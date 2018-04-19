(function(){
	// Sets the default date to yesterday's date
	var yesterdayDate = new Date();
	yesterdayDate.setDate( yesterdayDate.getDate() - 1 );
	var yesterdayString = yesterdayDate.toISOString().substr(0,10);
	$("#game-date-input")
		.val( yesterdayString )
		.attr('max', yesterdayString );

	/**
	 * Module to interact with the games list
	 */
	var gamesListModule = (function(){
		var selector = $('#games-list');
		var selectedGameID = undefined;
		var gamesListData = undefined;

		return {
			/**
			 * @param  JSONObject games
			 * @return none
			 */
			updateList: function( games ){
				selector.empty();
				games.forEach(function(el, i){
					var gameInputDiv = $("<div/>", {
						class: "form-check"
					});
					var gameInputLabel = $("<label />", {
						class: "form-check-label"
					});
					$("<input />", {
						type: "radio",
						name: "game",
						value: el.gameID,
						id: "game" + i,
						class: "form-check-input"
					}).appendTo( gameInputLabel );

					var labelText =  el.homeTeam.teamName + ' vs ' + el.awayTeam.teamName;
					$("<span>" + labelText + "</span>").appendTo(gameInputLabel);
					gameInputLabel.appendTo( gameInputDiv );
					gameInputDiv.appendTo( selector );
				});
				selector.removeClass('hidden');

				gamesListData = games;
			},
			/**
			 * [notifyUser description]
			 * @param  {[type]} $message [description]
			 * @return {[type]}          [description]
			 */
			notifyUser: function( message ){
				selector.empty();
				selector.append("<p>"+message+"</p>");
				selector.removeClass('hidden');
			},
			/**
			 * @param String
			 */
			setSelectedGameID: function( gameID ){
				selectedGameID = gameID;
			},
			/**
			 * @return String
			 */
			getSelectedGameID: function(){
				return selectedGameID;
			},
			/**
			 * @return Object
			 */
			getSelectedGame: function(){
				var game = undefined;
				$.each(gamesListData, function(key, value){
					if( value.gameID == selectedGameID ){
						game = value;
						return false;
					}
				});
				return game;
			}
		}
	})();

	/*
		Initialize time range slider
	 */
	var inputSlider = document.getElementById('input-slider');
	noUiSlider.create(inputSlider, {
		start: [0, 48],
		step: 1,
		connect: true,
		range: {
			'min': [0],
			'max': [48],
		},
		pips: {
			mode: 'steps',
			density: 3,
			filter: function( value, type ){
				return value % 12 ? 2 : 1;
			}
		}
	});

	var startOfSeasonUTC = new Date("2017-10-17").getTime();
	var yesterdayDateUTC = yesterdayDate.getTime();
	/*
		Event handler to retrieve games from the specified date
	 */
	$("#get-games-button").on('click', function(event){
		event.preventDefault();

		// Confirm date is between 10/17/2017 and today's date
		var gameDate = $("#game-date-input").val();
		var gameDateUTC = new Date(gameDate).getTime();

		if( !(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(gameDate)) ){
			alert("Please enter a valid date, between 10/17/2017 and yesterday's date");
			return false;
		}

		// Yesterday's date is the maximum date a user can select
		if( gameDateUTC < startOfSeasonUTC || gameDateUTC > yesterdayDateUTC ){
			alert("Please enter a valid date, between 10/17/2017 and yesterday's date");
			return false;
		}

		gameDate = formatDate( gameDate );

		// AJAX request to get games on date provided
		$.ajax({
			url: "http://nbaplaybyplay.test/api/index.php",
			type: "POST",
			data: {
				"action": "getGames",
				"gameDate": gameDate,
			},
			success: function( response ){
				if( Array.isArray(response) && response.length > 0 ){
					// Prompt user to select a game to retrieve stats from, populate game list with multiple games that user can select
					gamesListModule.updateList(response);
				} else if( response.length == 0 ){
					gamesListModule.notifyUser("No games found for the specified date");
				}
			},
			error: function( xhr, status, error ){
				console.log( status, error );
			},
			dataType: "json"
		});
	});

	/**
	 * Format date from input to match pattern accepted by the NBA's API
	 * @param  String
	 * @return String
	 */
	function formatDate(dateString){
		return dateString.replace(new RegExp('-', 'g'), "");
	}

	// Input items visible after games are retrieved
	$("#games-list").on('change', 'input[type=radio][name=game]', function(event){
		gamesListModule.setSelectedGameID( this.value );
		// Enable get data button after a game is selected
		$("#get-data-button").removeAttr('disabled');
	});

	/*
		Event handler to retrieve statistics for a given game within the specified time range
	 */
	$("#get-data-button").on('click', function(event){
		event.preventDefault();

		var timeRange = inputSlider.noUiSlider.get();
		var startTime = parseInt(timeRange[0]);
		var endTime = parseInt(timeRange[1]);

		var selectedGame = gamesListModule.getSelectedGame();

		if( (startTime < 0 || startTime >= 48) || (endTime <= 0 || endTime > 48) ){
			alert('Invalid time range, please select a time between 0 minutes and 48 minutes')
			return false;
		}

		if( selectedGame.gameID == undefined ){
			return false;
		}

		$.ajax({
			url: "http://localhost/nbaplay/api/index.php",
			type: "POST",
			data: {
				"action": "getStats",
				"gameID": selectedGame.gameID,
				"gameDate": selectedGame.date,
				"startTime": timeRange[0],
				"endTime": timeRange[1]
			},
			success: function( response ){
				var selectedGame = gamesListModule.getSelectedGame();
				if( Object.keys(response).length == 2 && selectedGame != undefined ){
					$("#table-stats tbody").empty();

					var homeTeamRow = makeTableRows( response[selectedGame.homeTeam.abbreviation], selectedGame.homeTeam.teamName );
					var awayTeamRow = makeTableRows( response[selectedGame.awayTeam.abbreviation], selectedGame.awayTeam.teamName );

					$("#table-stats").append(homeTeamRow).append(awayTeamRow).removeClass('hidden');
				}
			},
			error: function( xhr, status, error ){
				console.log( status, error );
			},
			dataType: "json"
		});
	});

	/**
	 * Creates table row that will be appended to the statistics table
	 * @param  Object
	 * @param  String
	 * @return DOMElement
	 */
	function makeTableRows( teamStats, teamName ){
		var statsCategories = ['PTS', 'FGM', 'FGA', '2PM', '2PA', '3PM', '3PA', 'FTM', 'FTA', 'REB', 'TOV', 'PF', 'SUB'];

		var row = $("<tr/>");
		$("<td/>", {
			text: teamName
		}).appendTo(row);

		statsCategories.forEach(function(stat){
			$("<td/>", {
				text: teamStats[stat],
			}).appendTo(row);
		});

		return row;
	}
})();
