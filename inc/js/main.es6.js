// import "babel-polyfill";

(function(){
	const apiModule = (function(){
		let module = {};
		const url = "http://localhost:8888/api/index.php";

		module.getUrl = () => {
			return url;
		};

		return module;
	}());

	// Sets the default date to yesterday's date
	const yesterdayDate = new Date();
	yesterdayDate.setDate( yesterdayDate.getDate() - 1 );
	const yesterdayString = yesterdayDate.toISOString().substr(0,10);
	// $("#game-date-input")
	// 	.val( yesterdayString )
	// 	.attr('max', yesterdayString );

	/**
	 * Module to interact with the games list
	 */
	const gamesListModule = (() => {
		const selector = $('#games-list');
		let selectedGameID = undefined;
		let gamesListData = undefined;

		return {
			/**
			 * @param  JSONObject games
			 * @return none
			 */
			updateList: ( games ) => {
				selector.empty();
				games.forEach(function(el, i){
					const gameInputDiv = $("<div/>", {
						class: "form-check"
					});
					const gameInputLabel = $("<label />", {
						class: "form-check-label"
					});
					$("<input />", {
						type: "radio",
						name: "game",
						value: el.gameID,
						id: `game${i}`,
						class: "form-check-input"
					}).appendTo( gameInputLabel );

					const labelText =  `${el.homeTeam.teamName} vs ${el.awayTeam.teamName}`;
					$(`<span>${labelText}</span>`).appendTo(gameInputLabel);
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
			notifyUser: ( message ) => {
				selector.empty();
				selector.append(`<p>${message}</p>`);
				selector.removeClass('hidden');
			},
			/**
			 * @param String
			 */
			setSelectedGameID: ( gameID ) => {
				selectedGameID = gameID;
			},
			/**
			 * @return String
			 */
			getSelectedGameID: () => {
				return selectedGameID;
			},
			/**
			 * @return Object
			 */
			getSelectedGame: () => {
				let game = undefined;
				$.each(gamesListData, (key, value) => {
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
	const inputSlider = document.getElementById('input-slider');
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

	const startOfSeasonUTC = new Date("2017-10-17").getTime();
	const yesterdayDateUTC = yesterdayDate.getTime();
	/*
		Event handler to retrieve games from the specified date
	 */
	$("#get-games-button").on('click', (event) => {
		event.preventDefault();

		// Confirm date is between 10/17/2017 and today's date
		const gameDate = $("#game-date-input").val();
		const gameDateUTC = new Date(gameDate).getTime();

		if( !(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(gameDate)) ){
			alert("Please enter a valid date, between 10/17/2017 and yesterday's date");
			return false;
		}

		// Yesterday's date is the maximum date a user can select
		if( gameDateUTC < startOfSeasonUTC || gameDateUTC > yesterdayDateUTC ){
			alert("Please enter a valid date, between 10/17/2017 and yesterday's date");
			return false;
		}

		// AJAX request to get games on date provided
		$.ajax({
			url: apiModule.getUrl(),
			type: "POST",
			data: {
				action: "getGames",
				gameDate: formatDate( gameDate ),
			},
			success: ( response ) => {
				if( Array.isArray(response) && response.length > 0 ){
					// Prompt user to select a game to retrieve stats from, populate game list with multiple games that user can select
					gamesListModule.updateList(response);
				} else if( response.length == 0 ){
					gamesListModule.notifyUser("No games found for the specified date");
				}
			},
			error: ( xhr, status, error ) => {
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
	$("#games-list").on('change', 'input[type=radio][name=game]', (event) => {
		gamesListModule.setSelectedGameID( this.value );
		// Enable get data button after a game is selected
		$("#get-data-button").removeAttr('disabled');
	});

	/*
		Event handler to retrieve statistics for a given game within the specified time range
	 */
	$("#get-data-button").on('click', (event) => {
		event.preventDefault();

		const timeRange = inputSlider.noUiSlider.get();
		const startTime = parseInt(timeRange[0]);
		const endTime = parseInt(timeRange[1]);

		const selectedGame = gamesListModule.getSelectedGame();

		if( (startTime < 0 || startTime >= 48) || (endTime <= 0 || endTime > 48) ){
			alert('Invalid time range, please select a time between 0 minutes and 48 minutes')
			return false;
		}

		if( selectedGame.gameID == undefined ){
			return false;
		}

		$.ajax({
			url: apiModule.getUrl(),
			type: "POST",
			data: {
				action: "getStats",
				gameID: selectedGame.gameID,
				gameDate: selectedGame.date,
				startTime: timeRange[0],
				endTime: timeRange[1]
			},
			success: ( response ) => {
				// var selectedGame = gamesListModule.getSelectedGame();
				if( Object.keys(response).length == 2 && selectedGame != undefined ){
					$("#table-stats tbody").empty();

					const homeTeamRow = makeTableRows( response[selectedGame.homeTeam.abbreviation], selectedGame.homeTeam.teamName );
					const awayTeamRow = makeTableRows( response[selectedGame.awayTeam.abbreviation], selectedGame.awayTeam.teamName );

					$("#table-stats").append(homeTeamRow).append(awayTeamRow).removeClass('hidden');
				}
			},
			error: ( xhr, status, error ) => {
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
		const statsCategories = ['PTS', 'FGM', 'FGA', '2PM', '2PA', '3PM', '3PA', 'FTM', 'FTA', 'REB', 'TOV', 'PF', 'SUB'];

		const row = $("<tr/>");
		$("<td/>", {
			text: teamName
		}).appendTo(row);

		statsCategories.forEach((stat) => {
			$("<td/>", {
				text: teamStats[stat],
			}).appendTo(row);
		});

		return row;
	}
})();
