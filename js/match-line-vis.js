MatchLineVis = function(_parentElement, _data) {
  this.parentElement = _parentElement;
  this.data = _data;
  this.wrangleData();
  this.initVis();
  this.updateVis();
};

MatchLineVis.prototype.wrangleData = function() {
  var vis = this;
  vis.data.forEach((d) => {
    d.rankRaw = +d.rankRaw;
    d.age = +d.age;
  })
}

MatchLineVis.prototype.initVis = function() {
  var vis = this;

  vis.margin = {
    'top': 40,
    'bottom': 40,
    'left': 40,
    'right': 40
  };
  vis.width = 600 - vis.margin.left - vis.margin.right;
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


  vis.dateExtent = d3.extent(vis.data, (d) => {
    return d.age;
  });
  vis.rankExtent = [5,20];

  var innerPaddingX = 1;
  var innerPaddingY = 2;
  vis.xScale.domain([vis.dateExtent[0] - innerPaddingX, vis.dateExtent[1]])
  vis.yScale.domain([vis.rankExtent[0] - innerPaddingY, vis.rankExtent[1]])

  vis.playerData = vis.data;

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
      return "age";
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

  vis.coefs = {
    0: -0.313064,
    1: -0.575952,
    2: -0.248177
  };

  vis.coefsVal = {
    0: 0,
    1: 0,
    2: 0
  }

  var nodes = vis.svg.selectAll(".legendNodes")
    .data(['Base', 'Adjusted']);

  nodes.enter()
    .append("rect")
    .attr("class", "legendNodes")
    .merge(nodes)
    .attr("x", (d, i) => {
      return vis.width - 160;
    })
    .attr("y", (d, i) => {
      return 100 + 20*i;
    })
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", (d, i) => {
      if (i===0) return "gray";
      return "black";
    });
  nodes.exit().remove();

  var texts = vis.svg.selectAll(".texts")
    .data(['Base', 'Adjusted']);

  texts.enter()
    .append("text")
    .attr("class", "texts")
    .merge(texts)
    .attr("x", (d, i) => {
      return vis.width - 140;
    })
    .attr("y", (d, i) => {
      return 100 + 20 *i + 13;
    })
    .text((d, i) => {
      return d;
    })
    .attr("fill", "black");
  texts.exit().remove();
  vis.updateVis();
}

MatchLineVis.prototype.updateVis = function() {
  var vis = this;
  vis.drawPlayer(vis, vis.data, "gray");
}

MatchLineVis.prototype.recomputeData = function() {
  var vis = this;
  vis.curData = vis.data.map((d) => {
    var newRank = d.rankRaw;
    newRank += vis.coefs[0]*vis.coefsVal[0] + vis.coefs[1]*vis.coefsVal[1] + vis.coefs[2]*vis.coefsVal[2];
    return {rankRaw:newRank, age:d.age};
  });
}

MatchLineVis.prototype.updateSliderVal = function(val, idx) {
  var vis = this;
  val = +val;
  vis.coefsVal[idx] = val;
  vis.recomputeData();
  // vis.curData = vis.data.map((d) => {
  //   return {rankRaw:d.rankRaw+val, age:d.age};
  // });
  $('#match-line-vis').empty();
  vis.initVis();
  vis.drawPlayer(vis, vis.data, "gray");
  vis.drawPlayer(vis, vis.curData, "black");
}

MatchLineVis.prototype.drawPlayer = function(vis, cur_d, color) {
  var vis = this;

  vis.svg.append("path")
    .datum(cur_d)
    .attr("fill", "none")
    .attr("stroke", color)
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()
      .x(function(d) {
        return vis.xScale(d.age)
      })
      .y(function(d) {
        return vis.yScale(d.rankRaw)
      })
    )


}
