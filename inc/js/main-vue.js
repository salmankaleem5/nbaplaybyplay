'use strict';

var apiModule = function () {
  var module = {};
  var url = "http://localhost:8888/api/index.php";

  module.getUrl = function () {
    return url;
  };

  return module;
}();

// https://vuejs.org/v2/guide/components.html#Using-v-model-on-Components
var gameItemTemplate = '\n  <div class="form-check">\n    <label class="form-check-label">\n      <input type="radio" name="game" :value="game.gameID" class="form-check-input" v-on:input="$emit(\'input\', $event.target.value)">\n      <span>{{ game.homeTeam.teamName }} vs {{game.awayTeam.teamName }}</span>\n    </label>\n  </div>\n';
Vue.component('game-item', {
  props: ['game'],
  template: gameItemTemplate
});

var tableRowTemplate = '\n  <tr>\n    <td>{{ rowName }}</td>\n    <td v-for="cat in statsCategories">\n      {{ rowData[cat] }}\n    </td>\n  </tr>\n';
Vue.component('table-row', {
  props: ['rowData', 'rowName'],
  template: tableRowTemplate,
  data: function data() {
    return {
      statsCategories: ['PTS', 'FGM', 'FGA', '2PM', '2PA', '3PM', '3PA', 'FTM', 'FTA', 'REB', 'TOV', 'PF', 'SUB']
    };
  }
});

var vm = new Vue({
  el: '#app',
  data: {
    minuteStart: 0,
    minuteEnd: 48,
    currentDate: undefined,
    gamesList: [],
    selectedGameID: undefined,
    teamA: {},
    teamAName: undefined,
    teamB: {},
    teamBName: undefined
  },
  methods: {
    getGames: function getGames(event) {
      var _this = this;

      if (this.currentDate !== undefined) {
        var formData = new FormData();
        formData.set('action', 'getGames');
        formData.set('gameDate', formatDate(this.currentDate));

        axios({
          method: 'post',
          url: apiModule.getUrl(),
          data: formData,
          responseType: 'json'
        }).then(function (response) {
          if (response.data.length > 0) {
            _this.gamesList = response.data;
          }
        }).catch(function (error) {
          console.log(error);
        });
      }
    },
    getData: function getData(event) {
      var _this2 = this;

      if (this.selectedGameID !== undefined && this.currentDate !== undefined && this.minuteRange.length === 2) {
        var formData = new FormData();
        formData.set('action', "getStats");
        formData.set('gameID', this.selectedGameID);
        formData.set('gameDate', formatDate(this.currentDate));
        formData.set('startTime', this.minuteRange[0]);
        formData.set('endTime', this.minuteRange[1]);

        axios({
          method: 'post',
          url: apiModule.getUrl(),
          data: formData,
          responseType: 'json'
        }).then(function (response) {
          console.log(response);
          var teamAbbrs = Object.keys(response.data);
          _this2.teamA = Object.assign({}, _this2.teamA, response.data[teamAbbrs[0]]);
          _this2.teamAName = teamAbbrs[0];

          _this2.teamB = Object.assign({}, _this2.teamB, response.data[teamAbbrs[1]]);
          _this2.teamBName = teamAbbrs[1];
        }).catch(function (error) {
          console.log(error);
        });
      }
    }
  },
  computed: {
    minuteRange: function minuteRange() {
      return [this.minuteStart, this.minuteEnd];
    }
  },
  mounted: function mounted() {
    var _this3 = this;

    // const date = new Date();
    // date.setDate( date.getDate() - 1 );
    // this.currentDate = date.toISOString().substr(0,10);
    this.currentDate = '2017-11-08';
    /*
      Initialize time range slider
      */
    noUiSlider.create(this.$refs.vueInputSlider, {
      start: [this.minuteStart, this.minuteEnd],
      step: 1,
      connect: true,
      range: {
        'min': [0],
        'max': [48]
      },
      pips: {
        mode: 'steps',
        density: 3,
        filter: function filter(value, type) {
          return value % 12 ? 2 : 1;
        }
      }
    });

    this.$refs.vueInputSlider.noUiSlider.on('set', function (values) {
      _this3.minuteStart = parseInt(values[0]);
      _this3.minuteEnd = parseInt(values[1]);
    });
  }
});

/**
 * Format date from input to match pattern accepted by the NBA's API
 * @param  String
 * @return String
 */
function formatDate(dateString) {
  return dateString.replace(new RegExp('-', 'g'), "");
}
//# sourceMappingURL=main-vue.js.map
