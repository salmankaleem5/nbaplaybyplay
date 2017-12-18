<?php
header("Access-Control-Allow-Origin: *");	// Not safe for production, link stackoverflow here
require 'lib/NBAClient.php';

if( isset($_POST['action']) && $_POST['action'] == "getGames" ){
	if( isset($_POST['gameDate']) ){
		// error check for $_POST vars

		//$schedule = json_decode( file_get_contents("schedule.json"), true );	
		$schedule = NBAClient::getGames($_POST['gameDate']);
		
		if( empty($schedule) || empty( $schedule['sports_content']['games']['game'] ) ){
			echo json_encode( array() );
		} else {
			echo json_encode( parse_schedule($schedule) );	
		}

		die();
	}
} else if( isset($_POST['action']) && $_POST['action'] == "getStats" ){
	if( isset($_POST['gameID']) && isset($_POST['startTime']) && isset($_POST['endTime']) && isset($_POST['gameDate']) ){
		// error check for $_POST vars

		// curl request to get play by play for the provided game
		//$playsList = json_decode( file_get_contents("plays.json"), true );
		$playsList = NBAClient::getPlays($_POST['gameDate'], $_POST['gameID']);
		
		echo json_encode( get_stats( $playsList, $_POST['startTime'], $_POST['endTime'] ) );
		die();
	}
} else {
	echo json_encode($_POST);
	die(-1);
}

/**
 * @param  array $schedule
 * @return array $scheduledGames
 */
function parse_schedule( array $schedule ): array{
	$teamInformation = json_decode( file_get_contents("teams.json"), true );
	
	$games = $schedule['sports_content']['games']['game'];

	$scheduledGames = [];
	foreach( $games as $game ){
		$homeTeamID = $game['home']['id'];
		$homeTeam = $teamInformation[$homeTeamID];

		$awayTeamID = $game['visitor']['id'];
		$awayTeam = $teamInformation[$awayTeamID];

		$gameID = $game['id'];
		$date = $game['date'];

		array_push( $scheduledGames, ['date' => $date, 'homeTeamID' => $homeTeamID, 'homeTeam' => $homeTeam, 'awayTeamID' => $awayTeamID, 'awayTeam' => $awayTeam, 'gameID' => $gameID ] );
	}

	return $scheduledGames;
}

/**
 * @param  Array $playsList
 * @param  String $startTime
 * @param  String $endTime
 * @return Array
 */
function get_stats( array $playsList, string $startTime, string $endTime ): array{
	$playsList = $playsList['sports_content']['game']['play'];

	$range = getTimeRange( intval($startTime), intval($endTime) );

	// Find starting point (quarter that the start time is in)
	$i = 0;
	while( $i < count($playsList) ){
		$play = $playsList[$i];
		$quarter = intval( $play['period'] );

		// Found start of the quarter user is looking for. Need to find play that corresponds to the provided start time
		if( $quarter == $range['start']['quarter'] ){
			break;
		}

		$i++;
	}

	$stats = array();

	while( $i < count($playsList) ){
		$play = $playsList[$i];
		$playTimestamp = empty($play['clock']) ? "12:00" : $play['clock'];
		$playTimestamp = strtotime( $playTimestamp );

		// Found play that corresponds to provided start time
		if( $playTimestamp <= $range['start']['time'] ){
			// collect first stat point here
			collect_stats($play, $stats);

			break;
		}

		$i++;
	}
	
	// Find ending point
	while( $i < count($playsList) ){
		$play = $playsList[$i];
		$quarter = intval( $play['period'] );

		// Found start of the ending quarter user is looking for. Need to find play that corresponds to the provided end time
		if( $quarter == $range['end']['quarter'] ){
			break;
		}

		// collect stats here
		collect_stats($play, $stats);

		$i++;
	}

	while( $i < count($playsList) ){
		$play = $playsList[$i];
		$playTimestamp = empty($play['clock']) ? "12:00" : $play['clock'];
		$playTimestamp = strtotime( $playTimestamp );
		
		// Found play that corresponds to provided end time
		if( $playTimestamp <= $range['end']['time'] ){
			break;
		}

		// collect stats here
		collect_stats($play, $stats);

		$i++;
	}	
	
	return $stats;
}

/**
 * @param  [type]
 * @param  Array $stats (by reference)
 * @return none
 */
function collect_stats( array $play, array &$stats ){
	$categories = array(
		'FGM' => 0, 'FGA' => 0, 'PTS' => 0, 'REB' => 0, 'PF' => 0, 'FTM' => 0, 'FTA' => 0, '3PM' => 0, '3PA' => 0, '2PM' => 0, '2PA' => 0, 'TOV' => 0, 'SUB' => 0
	);

	$team = $play['team_abr'];
	$playDesc = $play['description'];

	if( !isset($stats[$team]) ){
		$stats[$team] = $categories;
	}

	// Identify type of play and record statistic accorindgly
	// Could make a more efficient algorithm (Work in progress)
	if( strpos($playDesc, 'PTS') !== FALSE ) {
		if( strpos($playDesc, 'Free Throw') !== FALSE ){
			$shotType = 'FT';
			$pts = 1;
		} else if( strpos($playDesc, '3pt') !== FALSE ){
			$shotType = '3P';
			$pts = 3;
			$stats[$team]["FGA"]++;
			$stats[$team]["FGM"]++;
		} else {	// 2pt shot
			$shotType = '2P';
			$pts = 2;
			$stats[$team]["FGA"]++;
			$stats[$team]["FGM"]++;
		}
		$stats[$team]["{$shotType}A"]++;
		$stats[$team]["{$shotType}M"]++;
		$stats[$team]['PTS'] += $pts;
	} else if( strpos($playDesc, 'Missed') !== FALSE ){
		if( strpos($playDesc, 'Free Throw') !== FALSE ){
			$shotType = 'FT';
		} else if( strpos($playDesc, '3pt') !== FALSE ){
			$shotType = '3P';
			$stats[$team]["FGA"]++;
		} else {	// 2pt shot
			$shotType = '2P';
			$stats[$team]["FGA"]++;
		}
		$stats[$team]["{$shotType}A"]++;
	} else if( strpos($playDesc, 'Rebound') !== FALSE ){
		$stats[$team]['REB']++;
	} else if( strpos($playDesc, 'Foul') !== FALSE ){
		$stats[$team]['PF']++;
		if( strpos($playDesc, 'Turnover') !== FALSE ){
			$stats[$team]['TOV']++;
		}
	} else if( strpos($playDesc, 'Turnover') !== FALSE ){
		$stats[$team]['TOV']++;
	} else if( strpos($playDesc, 'Substitution') !== FALSE ){
		$stats[$team]['SUB']++;
	}
}

/**
 * @param  int $startTime
 * @param  int $endTime
 * @return Array
 */
function getTimeRange( int $startTime, int $endTime ): array{
	return [ 'start' => getStartTimeInfo($startTime), 'end' => getEndTimeInfo($endTime) ];
}

/**
 * @param  int $startTime
 * @param  int $minutesinQuarter
 * @return Array
 */
function getStartTimeInfo( int $startTime, int $minutesInQuarter = 12 ): array{
	$quarter = intdiv( $startTime, $minutesInQuarter ) + 1;
	$minutes = 12 - ($startTime % 12);
	$timeInQuarter = strtotime("{$minutes}:00");

	return [ 'quarter' => $quarter, 'time' => $timeInQuarter ];
}

/**
 * @param  int $endTime
 * @param  int $minutesinQuarter
 * @return Array
 */
function getEndTimeInfo( int $endTime, int $minutesInQuarter = 12 ): array{
	if( $endTime % 12 == 0 ){
		$quarter = intdiv( $endTime, $minutesInQuarter );
		$minutes = 0;
	} else {
		$quarter = intdiv( $endTime, $minutesInQuarter ) + 1;
		$minutes = 12 - ($endTime % 12);
	}

	$timeInQuarter = strtotime("{$minutes}:00");

	return [ 'quarter' => $quarter, 'time' => $timeInQuarter ];
}

?>