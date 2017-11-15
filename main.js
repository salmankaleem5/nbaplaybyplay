(function(){
	var gameSelect = document.getElementById('game-select');
	var inputSlider = document.getElementById('input-slider');

	function filterQuarterStarts( value, type ){
		return value % 12 ? 2 : 1;
	}

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
			filter: filterQuarterStarts,
		}
	});

	var getDataBtn = new Vue({
		el: "#get-data-btn",
		data: {

		},
		methods: {
			get: function(event){
				// error checking on inputSlider
				console.log( inputSlider.noUiSlider.get() );
				console.log( gameSelect.options[gameSelect.selectedIndex].value )

				// make api request using game id and time range
			}
		}
	});
})();