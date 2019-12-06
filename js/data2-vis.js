/**
 * Data2Vis - Object constructor function
 *
 * Map Vis
 *
 * @param _parentElement  -- ID of HTML element that will contain the vis
 * @param _data           -- Box Office Revenue data (w/ country names)
 * @param _mapData        -- GeoJSON data (w/ country ids)
 * @param _countryCodes   -- Mapping between country id and names
 * @constructor
 */

Data2Vis = function(_parentElement, _data, _mapData, _countryCodes, medianRank) {
  this.parentElement = _parentElement;
  this.dataObject = _data;
  this.mapDataRaw = _mapData;
  this.countryCodes = _countryCodes;
  this.medianRank = medianRank;
  // this.dataObject = this.medianRank;

  console.log(this.data);
  console.log(this.mapDataRaw);

  this.initVis();
};


Data2Vis.prototype.initVis = function() {
  var vis = this;

  vis.margin = {
    'top': 40,
    'bottom': 40,
    'left': 40,
    'right': 40
  };
  vis.width = 900 - vis.margin.left - vis.margin.right;
  vis.height = vis.width;
  vis.svg = makeSvg(vis, 'data2-vis');

  vis.color = d3.scaleThreshold();

  vis.tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  vis.mapGroup = vis.svg.append("g")
    .attr('class', 'map');

  vis.svg.append("text")
    .attr("class", "legend-text")
    .text('Total Players')
    .attr("x", 23)
    .attr("y", -10+180)
    .attr("fill", "black")
    .style("font-size", 14);

  vis.svg.append("text")
    .attr("class", "legend-text")
    .text('(from 2000-2018)')
    .attr("x", 23)
    .attr("y", 190)
    .attr("fill", "black")
    .style("font-size", 11);

  vis.wrangleData();
};

Data2Vis.prototype.wrangleData = function() {
  var vis = this;

  vis.mapData = topojson.feature(vis.mapDataRaw, vis.mapDataRaw.objects.countries).features;

  vis.idToCountry = {};
  vis.countryToId = {};

  vis.alphaToCountry = {};
  vis.countryToAlpha = {};

  vis.idToAlpha = {};
  vis.alphaToId = {};

  vis.countryCodes.forEach((d) => {
    vis.idToCountry[+d['country-code']] = d.name;
    vis.countryToId[d.name] = +d['country-code'];
    vis.alphaToCountry[d['alpha-2']] = d.name;
    vis.countryToAlpha[d.name] = [d['alpha-2']];
    vis.alphaToId[d['alpha-2']] = +d['country-code'];
    vis.idToAlpha[+d['country-code']] = [d['alpha-2']];
  })

  vis.data = [];
  for(var key in vis.dataObject){
    vis.data.push({key:key, val: vis.dataObject[key][0]});
  }

  vis.mapData = vis.mapData.filter((d) => {
    return vis.idToCountry[d.id] !== 'Antarctica';
  })

  console.log(vis.mapData)
  console.log(vis.data)
  console.log(vis.countryCodes)

  vis.updateVis();
};

Data2Vis.prototype.updateVis = function() {
  var vis = this;

  var maxVal = d3.max(vis.data,(d) => {
    return d.val;
  })
  console.log(maxVal);
  vis.color.domain([10, 50, 100, 200, 300, 400, 500]);
  // vis.color.domain([200, 500, 800, 1100, 1400, 1700]);

  var emptyColor = ["lightgray"];
  // var colors = emptyColor.concat(d3.schemeReds[5]);
  var colors = emptyColor.concat(d3.schemeReds[6]);
  vis.color.range(colors);

  // var projection = d3.geoMercator()
  //   .translate([vis.width/2, vis.height/2])
  //   .center([0, 0]).scale(50);
  var projection = d3.geoMercator()
      .translate([vis.width/2, vis.height /3])
      .center([0, 0]).scale(80);

  // vis.svg.selectAll("path")
  //   .data(vis.mapData)
  //   .enter().append("path")
  //   .attr("d", d3.geoPath()
  //     .projection(projection));


  var chmap = vis.mapGroup.selectAll("path")
    .data(vis.mapData);
  // var chmap = vis.svg.append("g")
  //   .selectAll("path")
  //   .data(vis.data);

  chmap.enter()
    .append("path")
    .attr("class", "mapPath")
    .attr("d", d3.geoPath()
      .projection(projection)
    )
    .merge(chmap)
    .on("mouseover", (d) => {
      vis.tooltip.transition()
        .duration(800)
        .style("opacity", .8);
      console.log(d);
      var numPlayers = vis.dataObject[vis.idToAlpha[d.id]];
      if (numPlayers === undefined) numPlayers = 'N/A';
      var txt = vis.idToCountry[d.id] + "<br>Num Players: "+numPlayers;
      vis.tooltip.html(txt)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout", (d) => {
      vis.tooltip.transition()
        .duration(600).style("opacity", 0);
    })
    .attr("fill", function(d, i) {
      var alpha = vis.idToAlpha[d.id];
      if (alpha in vis.dataObject)
        return vis.color(vis.dataObject[alpha]);
      return "lightgray"
    });
  chmap.exit().remove();

  // Map legend
  var legendHeight = 130;
  var length = vis.color.range().length;

  var yLegend = d3.scaleLinear()
    .domain([1, length - 1])
    .rangeRound([legendHeight * (length - 1) / length, legendHeight / length]);

  var legendRects = vis.svg.selectAll(".legend-rect")
    .data(vis.color.range());

  legendRects.enter()
    .append("rect")
    .attr("class", "legend-rect")
    .merge(legendRects)
    .attr("x", (d, i) => {
      return 30;
    })
    .attr("y", (d, i) => {
      return yLegend(i) - 20+200;
    })
    .attr("width", (d) => {
      return 20;
    })
    .attr("height", (d) => {
      return 20;
    })
    .attr("fill", (d) => d);
  legendRects.exit().remove();

  var legendTexts = ['0-10 or No Data', '11-50', '51-100', '101-200', '201-300', '301-400', '401-500'];
  // var legendTexts = ['250-350', '350-500', '500-700', '700-1000', '900-1199', '1200-1499', '1500-1800', 'No Data'];
  // var legendTexts = ['No Data', '200-500', '500-800', '800-1100', '1100-1400', '1400-1700'];
  var texts = vis.svg.selectAll(".texts")
    .data(legendTexts);

  texts.enter()
    .append("text")
    .attr("class", "texts")
    .merge(texts)
    .attr("x", (d, i) => {
      return 55;
    })
    .attr("y", (d, i) => {
      return -5 + yLegend(i)+200;
    })
    .text((d, i) => {
      return d;
    })
    .attr("fill", "black")
    .style("font-size", 11)
    .style("text-anchor", "start");
  texts.exit().remove();
}
