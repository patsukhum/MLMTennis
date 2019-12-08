var lineVis, continentLineVis, data2Vis;

queue()
    .defer(d3.json, 'data/country_count.json')
    .defer(d3.json, 'data/world-110m.json')
    .defer(d3.json, 'data/slim-2.json')
    .defer(d3.json, 'data/country_median_rank.json')
    .await(createMapVis);

function createMapVis(error, data, data2, data3, data4) {
  data2Vis = new Data2Vis("data2-vis", data, data2, data3, data4);
};


queue()
    .defer(d3.csv, 'data/facet2.csv')
    .await(createLineVis);

function createLineVis(error, data) {
  lineVis = new LineVis("line-vis", data);
};

$('#select-players').change(() => {
  lineVis.selectPlayers();
})

queue()
    .defer(d3.csv, 'data/continent_plot.csv')
    .defer(d3.csv, 'data/filtered.continents.dataset.csv')
    .await(createContinentLineVis);

function createContinentLineVis(error, data, data2) {
  continentLineVis = new ContinentLineVis("continent-line-vis", data, data2);
};

$('#select-players-continent').change(() => {
  continentLineVis.selectPlayers();
})

queue()
    .defer(d3.csv, 'data/match_model.csv')
    .defer(d3.csv, 'data/filtered.atp.dataset.csv')
    .await(createMatchLineVis);

function createMatchLineVis(error, data, data2) {
  matchLineVis = new MatchLineVis("match-line-vis", data, data2);
  var slide = document.getElementById('slide1'),
    sliderDiv = document.getElementById("sliderAmount1");

  sliderDiv.innerHTML = 0;
  slide.onchange = function() {
      sliderDiv.innerHTML = this.value;
      matchLineVis.updateSliderVal(this.value, 0);
  }

  var slide2 = document.getElementById('slide2'),
    sliderDiv2 = document.getElementById("sliderAmount2");

  sliderDiv2.innerHTML = 0;
  slide2.onchange = function() {
      sliderDiv2.innerHTML = this.value;
      matchLineVis.updateSliderVal(this.value, 1);
  }

  var slide3 = document.getElementById('slide3'),
    sliderDiv3 = document.getElementById("sliderAmount3");

  sliderDiv3.innerHTML = 0;
  slide3.onchange = function() {
      sliderDiv3.innerHTML = this.value;
      matchLineVis.updateSliderVal(this.value, 2);
  }
};
