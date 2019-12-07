LineVis = function(_parentElement, _data) {
  this.parentElement = _parentElement;
  this.data = _data;
  this.wrangleData();
  this.initVis();
  this.updateVis();
};

LineVis.prototype.wrangleData = function() {
  var vis = this;
  vis.data.forEach((d) => {
    d.rank = +d.rank;
    d.year = +d.year;
  })
}

LineVis.prototype.initVis = function() {
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

  vis.all_last_names = ["Federer", "Nadal", "Djokovic"]
  vis.last_names = vis.all_last_names;

  vis.dateExtent = d3.extent(vis.data, (d) => {
    return d.year;
  });
  vis.rankExtent = d3.extent(vis.data, (d) => {
    return d.rank;
  });

  var innerPaddingX = 1;
  var innerPaddingY = 2;
  vis.xScale.domain([vis.dateExtent[0] - innerPaddingX, vis.dateExtent[1]])
  vis.yScale.domain([vis.rankExtent[0] - innerPaddingY, vis.rankExtent[1]])

  vis.playerData = vis.data;
  vis.fed = vis.playerData.filter((d) => d.last_name == 'Federer');
  vis.nad = vis.playerData.filter((d) => d.last_name == 'Nadal');
  vis.djo = vis.playerData.filter((d) => d.last_name == 'Djokovic');

  vis.color = d3.scaleOrdinal()
    .domain([0, 1, 2])
    .range(['#e41a1c', '#377eb8', '#4daf4a'])

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
      return "Year";
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

LineVis.prototype.updateVis = function() {
  var vis = this;
  if (vis.last_names.includes('Federer'))
    vis.drawPlayer(vis, vis.fed, 0);
  else
    vis.drawPlayer(vis, [], 0);
  if (vis.last_names.includes('Nadal'))
    vis.drawPlayer(vis, vis.nad, 1);
  else {
    vis.drawPlayer(vis, [], 1);
  }
  if (vis.last_names.includes('Djokovic'))
    vis.drawPlayer(vis, vis.djo, 2);
  else
    vis.drawPlayer(vis, [], 2);
}

LineVis.prototype.drawPlayer = function(vis, cur_d, idx) {
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
          return vis.xScale(d.year)
        })
        .y(function(d) {
          return vis.yScale(d.rank)
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
        return vis.xScale(d.year)
      })
      .y(function(d) {
        return vis.yScale(d.rank)
      })
    )

  vis.circles = vis.svg.selectAll(".circles" + idx)
    .data(cur_d)

  vis.circles.enter().append("circle")
    .attr("class", "circles" + idx)
    .merge(vis.circles)
    .attr("r", 5)
    .on("mouseover", (d) => {
      vis.div.transition()
        .duration(800)
        .style("opacity", .8);
      var txt = formatToolTip(d);
      vis.div.html(txt)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout", (d) => {
      vis.div.transition()
        .duration(600).style("opacity", 0);
    })
    .attr("fill", (d) => {
      return vis.color(idx);
    })
    .attr('cx', (function(d) {
      return vis.xScale(d.year)
    }))
    .attr('cy', (function(d) {
      return vis.yScale(d.rank)
    }));
  vis.circles.exit().remove();


  var nodes = vis.svg.selectAll(".legendNodes" + idx)
    .data([vis.all_last_names[idx]]);

  nodes.enter()
    .append("circle")
    .attr("class", "legendNodes" + idx)
    .merge(nodes)
    .attr("cx", (d, i) => {
      return vis.width - 120;
    })
    .attr("cy", (d, i) => {
      return 100 + 20 * idx;
    })
    .attr("r", (d) => {
      if (vis.last_names.includes(vis.all_last_names[idx]))
        return 8;
      return 0;
    })
    .attr("fill", (d, i) => vis.color(idx));
  nodes.exit().remove();

  var texts = vis.svg.selectAll(".texts" + idx)
    .data([vis.all_last_names[idx]]);

  texts.enter()
    .append("text")
    .attr("class", "texts" + idx)
    .merge(texts)
    .attr("x", (d, i) => {
      return vis.width - 100;
    })
    .attr("y", (d, i) => {
      return 105 + 20 * idx;
    })
    .text((d, i) => {
      if (vis.last_names.includes(vis.all_last_names[idx]))
        return d;
      return "";
    })
    .attr("fill", "black");
  texts.exit().remove();
}

LineVis.prototype.selectPlayers = function() {
  var vis = this;
  var selection = d3.select('#select-players').property("value");
  $("#line-vis").empty();
  vis.initVis();
  if (selection !== "All") {
    vis.last_names = vis.all_last_names.filter((d) => d === selection);
    vis.updateVis();
  } else {
    vis.last_names = vis.all_last_names;
    vis.updateVis();
  }
}


function formatToolTip(d) {
  var txt = "";
  txt += d.last_name + "<br>";
  var rankstr = "" + d.rank;
  var yearstr = "" + d.year;
  txt += "Rank: " + rankstr + "<br>";
  txt += "Year: " + yearstr + "<br>";
  return txt;
}
