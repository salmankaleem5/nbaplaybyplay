<?php
require('lib/Requests.php');
Requests::register_autoloader();

class NBAClient {
	/**
	 * [getGames description]
	 * @param  [type] $dateString [description]
	 * @return [type]             [description]
	 */
	static function getGames(string $dateString){
		$url = "http://data.nba.com/data/5s/json/cms/noseason/scoreboard/{$dateString}/games.json";
		return self::request($url);
	}

	/**
	 * [getPlays description]
	 * @param  [type] $dateString [description]
	 * @param  [type] $gameID     [description]
	 * @return [type]             [description]
	 */
	static function getPlays(string $dateString, string $gameID){
		$url = "http://data.nba.com/data/15m/json/cms/noseason/game/{$dateString}/{$gameID}/pbp_all.json";	
		return self::request($url);
	}

	static function request( string $url ){
		$response = Requests::get($url);
		if( $response->success && $response->status_code == 200 ){
			return json_decode($response->body, true);
		} else {
			return array();
		}		
	}
}