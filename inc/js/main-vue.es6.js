const apiModule = (function(){
  let module = {};
  const url = "http://localhost:8888/api/index.php";

  module.getUrl = () => {
    return url;
  };

  return module;
}());

// https://vuejs.org/v2/guide/components.html#Using-v-model-on-Components
const gameItemTemplate = `
  <div class="form-check">
    <label class="form-check-label">
      <input type="radio" name="game" :value="game.gameID" class="form-check-input" v-on:input="$emit('input', $event.target.value)">
      <span>{{ game.homeTeam.teamName }} vs {{game.awayTeam.teamName }}</span>
    </label>
  </div>
`;
Vue.component('game-item', {
  props: ['game'],
  template: gameItemTemplate
});

const tableRowTemplate = `
  <tr>
    <td>{{ rowName }}</td>
    <td v-for="cat in statsCategories">
      {{ rowData[cat] }}
    </td>
  </tr>
`;
Vue.component('table-row', {
  props: ['rowData', 'rowName'],
  template: tableRowTemplate,
  data: function(){
    return {
      statsCategories: ['PTS', 'FGM', 'FGA', '2PM', '2PA', '3PM', '3PA', 'FTM', 'FTA', 'REB', 'TOV', 'PF', 'SUB']
    }
  }
});

const vm = new Vue ({
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
    getGames: function(event){
      if( this.currentDate !== undefined ){
        const formData = new FormData();
        formData.set('action', 'getGames');
        formData.set('gameDate', formatDate(this.currentDate));

        axios({
          method: 'post',
          url: apiModule.getUrl(),
          data: formData,
          responseType: 'json'
        })
        .then((response) => {
          if( response.data.length > 0 ){
            this.gamesList = response.data;
          }
        })
        .catch(function(error){
          console.log( error );
        });
      }
    },
    getData: function(event){
      if( this.selectedGameID !== undefined && this.currentDate !== undefined && this.minuteRange.length === 2 ){
        const formData = new FormData();
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
        })
        .then((response) => {
          console.log( response );
          var teamAbbrs = Object.keys(response.data);
          this.teamA = Object.assign({}, this.teamA, response.data[teamAbbrs[0]]);
          this.teamAName = teamAbbrs[0];

          this.teamB = Object.assign({}, this.teamB, response.data[teamAbbrs[1]]);
          this.teamBName = teamAbbrs[1];
        })
        .catch(function(error){
          console.log( error );
        });
      }
    }
  },
  computed: {
    minuteRange: function() {
      return [this.minuteStart, this.minuteEnd];
    }
  },
  mounted: function(){
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

      this.$refs.vueInputSlider.noUiSlider.on('set', (values) => {
        this.minuteStart = parseInt(values[0]);
        this.minuteEnd = parseInt(values[1]);
      });
    }
  });


/**
 * Format date from input to match pattern accepted by the NBA's API
 * @param  String
 * @return String
 */
 function formatDate(dateString){
  return dateString.replace(new RegExp('-', 'g'), "");
}
