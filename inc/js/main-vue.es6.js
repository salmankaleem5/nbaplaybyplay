const vm = new Vue ({
  el: '#app',
  data: {
    minuteStart: 0,
    minuteEnd: 48,
    currentDate: null,
  },
  methods: {
    getGames: function(event){
      console.log( this.currentDate );
    },
    getData: function(event){
      console.log( this.minuteRange );
    }
  },
  computed: {
    minuteRange: function() {
      return [this.minuteStart, this.minuteEnd];
    }
  },
  mounted: function(){
    const date = new Date();
    date.setDate( date.getDate() - 1 );
    this.currentDate = date.toISOString().substr(0,10);

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
})
