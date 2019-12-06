var lineVis, continentLineVis;

queue()
    .defer(d3.csv, 'champs.csv')
    .await(createLineVis);

function createLineVis(error, data) {
  lineVis = new LineVis("line-vis", data);
};

$('#select-players').change(() => {
  lineVis.selectPlayers();
})

queue()
    .defer(d3.csv, 'continent_plot.csv')
    .await(createContinentLineVis);

function createContinentLineVis(error, data) {
  continentLineVis = new ContinentLineVis("continent-line-vis", data);
};

$('#select-players-continent').change(() => {
  continentLineVis.selectPlayers();
})
// var width = 600,
//   height = 600;
// var padding = 40;
//
// svg = d3.select("#chart-area").append("svg")
//   .attr("width", width)
//   .attr("height", height);
//
//
// var yScale = d3.scaleLinear()
//   .range([height - padding, padding]);
//
// var xScale = d3.scaleLinear()
//   .range([padding, width - padding]);
//
// var xAxis = d3.axisBottom()
//   .scale(xScale)
//   .tickFormat((d) => {
//     return "" + d;
//   });
//
// var yAxis = d3.axisLeft()
//   .scale(yScale);
//
// var div = d3.select("body").append("div")
//   .attr("class", "tooltip")
//   .style("opacity", 0);
//
// all_last_names = ["Federer", "Nadal", "Djokovic"]
// last_names = all_last_names;
//
// // Load data
// d3.csv("champs.csv", function(data) {
//   data.forEach((d) => {
//     d.rank = +d.rank;
//     d.year = +d.year;
//   })
//
//   var dateExtent = d3.extent(data, (d) => {
//     return d.year;
//   });
//   var rankExtent = d3.extent(data, (d) => {
//     return d.rank;
//   });
//
//   var innerPaddingX = 1;
//   var innerPaddingY = 2;
//   xScale.domain([dateExtent[0] - innerPaddingX, dateExtent[1]])
//   yScale.domain([rankExtent[0] - innerPaddingY, rankExtent[1]])
//
//   playerData = data;
//   // initViz();
//   updateViz();
// });
//
// function initViz() {
//
// }
//
// function updateViz() {
//   var color = d3.scaleOrdinal()
//     .domain([0, 1, 2])
//     .range(['#e41a1c', '#377eb8', '#4daf4a'])
//
//   svg.append("g")
//     .attr("class", "x-axis axis")
//     .attr("transform", "translate(0," + (height - padding) + ")")
//     .call(xAxis)
//
//   svg.append("g")
//     .attr("class", "axis y-axis")
//     .attr("transform", "translate(" + padding + ",0)")
//     .call(yAxis)
//
//
//   console.log(last_names)
//   last_names.forEach((last_name, idx) => {
//     cur_data = playerData.filter((d) => d.last_name == last_name);
//     svg.append("path")
//       .datum(cur_data)
//       .attr("fill", "none")
//       .attr("stroke", color(idx))
//       .attr("stroke-width", 1.5)
//       .attr("d", d3.line()
//         .x(function(d) {
//           return xScale(d.year)
//         })
//         .y(function(d) {
//           return yScale(d.rank)
//         })
//       )
//
//     this.circles = svg.selectAll("circles")
//       .data(cur_data)
//
//     this.circles.enter().append("circle")
//       .attr("class", "circles")
//       .merge(this.circles)
//       .attr("r", 5)
//       .on("mouseover", (d) => {
//         div.transition()
//           .duration(800)
//           .style("opacity", .8);
//         var txt = formatToolTip(d);
//         div.html(txt)
//           .style("left", (d3.event.pageX) + "px")
//           .style("top", (d3.event.pageY - 28) + "px");
//       })
//       .on("mouseout", (d) => {
//         div.transition()
//           .duration(600).style("opacity", 0);
//       })
//       .attr("fill", (d) => {
//         return color(idx);
//       })
//       .attr('cx', (function(d) {
//         return xScale(d.year)
//       }))
//       .attr('cy', (function(d) {
//         return yScale(d.rank)
//       }));
//     this.circles.exit().remove();
//   });
//
//   var nodes = svg.selectAll(".legendNodes")
//     .data(last_names);
//
//   nodes.enter()
//     .append("circle")
//     .attr("class", "legendNodes")
//     .merge(nodes)
//     .attr("cx", (d, i) => {
//       return width - 120;
//     })
//     .attr("cy", (d, i) => {
//       return 100 + 20 * i;
//     })
//     .attr("r", (d) => {
//       return 8;
//     })
//     .attr("fill", (d, i) => color(i));
//   nodes.exit().remove();
//
//   var texts = svg.selectAll(".texts")
//     .data(last_names);
//
//   texts.enter()
//     .append("text")
//     .attr("class", "texts")
//     .merge(texts)
//     .attr("x", (d, i) => {
//       return width - 100;
//     })
//     .attr("y", (d, i) => {
//       return 105 + 20 * i;
//     })
//     .text((d, i) => {
//       return d;
//     })
//     .attr("fill", "black");
//   texts.exit().remove();
//
//   svg.append("g")
//     .append("text")
//     .text((d) => {
//       return "Year";
//     })
//     .attr("x", width / 2)
//     .attr("y", height);
//
//   svg.append("g")
//     .append("text")
//     .text((d) => {
//       return "Rank";
//     })
//     .attr("transform", "rotate(-90)")
//     .attr("x", -220)
//     .style("text-anchor", "end")
//     .attr("y", 15);
// }
//
// function formatToolTip(d) {
//   var txt = "";
//   txt += d.last_name + "<br>";
//   var rankstr = "" + d.rank;
//   var yearstr = "" + d.year;
//   txt += "Rank: " + rankstr + "<br>";
//   txt += "Year: " + yearstr + "<br>";
//   return txt;
// }
//
// function selectPlayers() {
//   var selection = d3.select('#select-players').property("value");
//   if (selection !== "All") {
//     last_names = all_last_names.filter((d) => d === selection);
//     updateViz();
//   }
// }
