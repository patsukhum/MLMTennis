MatchLineVis = function(_parentElement, _data, data2) {
  this.parentElement = _parentElement;
  this.data = _data;
  this.dataScatter = data2;
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
  vis.dataScatter.forEach((d) => {
    d.rank_sqrt = +d.rank_sqrt;
    d.age = +d.age + Math.random()-0.5;
  })

  vis.dataScatter = vis.dataScatter.filter((d) => {
    return d.age <= 32;
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


  vis.dateExtent = d3.extent(vis.dataScatter, (d) => {
    return d.age;
  });
  vis.rankExtent = d3.extent(vis.dataScatter, (d) => {
    return d.rank_sqrt;
  });

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
      return "Rank (sqrt)";
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

  var scatter = vis.svg.selectAll(".scatter")
    .data(vis.dataScatter);

  scatter.enter()
    .append("circle")
    .attr("class", "scatter")
    .merge(scatter)
    .attr("cx", (d, i) => {
      return vis.xScale(d.age);
    })
    .attr("cy", (d, i) => {
      return vis.yScale(d.rank_sqrt);
    })
    .style('opacity', 0.2)
    .attr("r", 3)
    .attr("fill", (d, i) => {
      return "black";
    });
  scatter.exit().remove();


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
      if (i===0) return "blue";
      return "red";
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
  vis.drawPlayer(vis, vis.data, "blue");
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
  vis.drawPlayer(vis, vis.data, "blue");
  vis.drawPlayer(vis, vis.curData, "red");
}

MatchLineVis.prototype.drawPlayer = function(vis, cur_d, color) {
  var vis = this;

  vis.svg.append("path")
    .datum(cur_d)
    .attr("fill", "none")
    .attr("stroke", color)
    .attr("stroke-width", 5)
    .attr("d", d3.line()
      .x(function(d) {
        return vis.xScale(d.age)
      })
      .y(function(d) {
        return vis.yScale(d.rankRaw)
      })
    )


}
