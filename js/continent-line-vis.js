ContinentLineVis = function(_parentElement, _data) {
  this.parentElement = _parentElement;
  this.data = _data;
  this.wrangleData();
  this.initVis();
  this.updateVis();
};

ContinentLineVis.prototype.wrangleData = function() {
  var vis = this;
  vis.data.forEach((d) => {
    d.Rank = +d.Rank;
    d.Age = +d.Age;
  })
}

ContinentLineVis.prototype.initVis = function() {
  var vis = this;

  vis.margin = {
    'top': 40,
    'bottom': 40,
    'left': 40,
    'right': 40
  };
  vis.width = 500 - vis.margin.left - vis.margin.right;
  vis.height = vis.width;
  vis.padding = 40;
  vis.svg = makeSvg(vis, 'line-vis');
  vis.yScale = d3.scaleLinear()
    .range([vis.height - vis.padding, vis.padding]);

  vis.xScale = d3.scaleLinear()
    .range([vis.padding, vis.width - vis.padding]);

  vis.xAxis = d3.axisBottom()
    .scale(vis.xScale)
    .tickFormat((d) => {
      return "" + d;
    });

  vis.yAxis = d3.axisLeft()
    .scale(vis.yScale);

  vis.div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  vis.all_regions = ["AF", "AS", "EU", "NoA", "OC", "SA"]
  vis.regions = vis.all_regions;

  vis.dateExtent = d3.extent(vis.data, (d) => {
    return d.Age;
  });
  vis.rankExtent = d3.extent(vis.data, (d) => {
    return d.Rank;
  });

  var innerPaddingX = 1;
  var innerPaddingY = 2;
  vis.xScale.domain([vis.dateExtent[0] - innerPaddingX, vis.dateExtent[1]])
  vis.yScale.domain([vis.rankExtent[0] - innerPaddingY, vis.rankExtent[1]])

  vis.playerData = vis.data;
  vis.af = vis.playerData.filter((d) => d.Continent == 'AF');
  vis.as = vis.playerData.filter((d) => d.Continent == 'AS');
  vis.eu = vis.playerData.filter((d) => d.Continent == 'EU');
  vis.noa = vis.playerData.filter((d) => d.Continent == 'NoA');
  vis.oc = vis.playerData.filter((d) => d.Continent == 'OC');
  vis.sa = vis.playerData.filter((d) => d.Continent == 'SA');

  vis.color = d3.scaleOrdinal()
    .domain([0, 1, 2, 3, 4, 5])
    .range(['#e41a1c', '#377eb8', '#4daf4a', 'blue', 'gray', 'purple'])

  vis.svg.append("g")
    .attr("class", "x-axis axis")
    .attr("transform", "translate(0," + (vis.height - vis.padding) + ")")
    .call(vis.xAxis)

  vis.svg.append("g")
    .attr("class", "axis y-axis")
    .attr("transform", "translate(" + vis.padding + ",0)")
    .call(vis.yAxis)

  vis.svg.append("g")
    .append("text")
    .text((d) => {
      return "Age";
    })
    .attr("x", vis.width / 2)
    .attr("y", vis.height);

  vis.svg.append("g")
    .append("text")
    .text((d) => {
      return "Rank";
    })
    .attr("transform", "rotate(-90)")
    .attr("x", -220)
    .style("text-anchor", "end")
    .attr("y", 15);

  // vis.updateVis();
}

ContinentLineVis.prototype.updateVis = function() {
  var vis = this;
  console.log(vis.regions);
  if (vis.regions.includes('AF'))
    vis.drawPlayer(vis, vis.af, 0);
  else
    vis.drawPlayer(vis, [], 0);
  if (vis.regions.includes('AS'))
    vis.drawPlayer(vis, vis.as, 1);
  else {
    vis.drawPlayer(vis, [], 1);
  }
  if (vis.regions.includes('EU'))
    vis.drawPlayer(vis, vis.eu, 2);
  else
    vis.drawPlayer(vis, [], 2);
  if (vis.regions.includes('NoA'))
    vis.drawPlayer(vis, vis.noa, 3);
  else
    vis.drawPlayer(vis, [], 3);
  if (vis.regions.includes('OC'))
    vis.drawPlayer(vis, vis.oc, 4);
  else {
    vis.drawPlayer(vis, [], 4);
  }
  if (vis.regions.includes('SA'))
    vis.drawPlayer(vis, vis.sa, 5);
  else
    vis.drawPlayer(vis, [], 5);

}

ContinentLineVis.prototype.drawPlayer = function(vis, cur_d, idx) {
  var vis = this;
  vis.svg.selectAll(".line" + idx).each(function (_d) {
    var line = d3.select(this)
      .datum(cur_d)
    line.enter().append("path")
      .merge(line)
      .attr("class", "line"+idx)
      .attr("fill", "none")
      .attr("stroke", vis.color(idx))
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(function(d) {
          return vis.xScale(d.Age)
        })
        .y(function(d) {
          return vis.yScale(d.Rank)
        })
      )
    line.exit().remove();
  });

  vis.svg.append("path")
    .datum(cur_d)
    .attr("fill", "none")
    .attr("stroke", vis.color(idx))
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()
      .x(function(d) {
        return vis.xScale(d.Age)
      })
      .y(function(d) {
        return vis.yScale(d.Rank)
      })
    )

  // vis.circles = vis.svg.selectAll(".circles" + idx)
  //   .data(cur_d)
  //
  // vis.circles.enter().append("circle")
  //   .attr("class", "circles" + idx)
  //   .merge(vis.circles)
  //   .attr("r", 5)
  //   .on("mouseover", (d) => {
  //     vis.div.transition()
  //       .duration(800)
  //       .style("opacity", .8);
  //     var txt = formatToolTip(d);
  //     vis.div.html(txt)
  //       .style("left", (d3.event.pageX) + "px")
  //       .style("top", (d3.event.pageY - 28) + "px");
  //   })
  //   .on("mouseout", (d) => {
  //     vis.div.transition()
  //       .duration(600).style("opacity", 0);
  //   })
  //   .attr("fill", (d) => {
  //     return vis.color(idx);
  //   })
  //   .attr('cx', (function(d) {
  //     return vis.xScale(d.Age)
  //   }))
  //   .attr('cy', (function(d) {
  //     return vis.yScale(d.Rank)
  //   }));
  // vis.circles.exit().remove();


  var nodes = vis.svg.selectAll(".legendNodes" + idx)
    .data([vis.all_regions[idx]]);

  nodes.enter()
    .append("circle")
    .attr("class", "legendNodes" + idx)
    .merge(nodes)
    .attr("cx", (d, i) => {
      return vis.width - 160;
    })
    .attr("cy", (d, i) => {
      return 100 + 20 * idx;
    })
    .attr("r", (d) => {
      if (vis.regions.includes(vis.all_regions[idx]))
        return 8;
      return 0;
    })
    .attr("fill", (d, i) => vis.color(idx));
  nodes.exit().remove();

  var texts = vis.svg.selectAll(".texts" + idx)
    .data([vis.all_regions[idx]]);

  texts.enter()
    .append("text")
    .attr("class", "texts" + idx)
    .merge(texts)
    .attr("x", (d, i) => {
      return vis.width - 140;
    })
    .attr("y", (d, i) => {
      return 105 + 20 * idx;
    })
    .text((d, i) => {
      if (vis.regions.includes(vis.all_regions[idx]))
        return d;
      return "";
    })
    .attr("fill", "black");
  texts.exit().remove();
}

ContinentLineVis.prototype.selectPlayers = function() {
  var vis = this;
  var selection = d3.select('#select-players-continent').property("value");
  $("#continent-line-vis").empty();
  vis.initVis();
  if (selection !== "All") {
    vis.regions = vis.all_regions.filter((d) => d === selection);
    vis.updateVis();
  } else {
    vis.regions = vis.all_regions;
    vis.updateVis();
  }
}


function formatToolTip(d) {
  var txt = "";
  txt += d.last_name + "<br>";
  var rankstr = "" + d.Rank;
  var yearstr = "" + d.Age;
  txt += "Rank: " + rankstr + "<br>";
  txt += "Year: " + yearstr + "<br>";
  return txt;
}
