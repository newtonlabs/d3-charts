/*jslint browser: true*/
/*global $, jQuery, d3, _*/

if (d3.charts === null || typeof(d3.charts) !== "object") { d3.charts = {}; }

// Based on http://bost.ocks.org/mike/chart/
this.d3.charts.groupStack = function() {
  'use strict';
  var width = 960,
  height = 500,
  svg = {},
  margin = {top: 40, right: 10, bottom: 20, left: 200};

  function my(selection) {
    var chartWidth    = width  - margin.left - margin.right,
        chartHeight   = height - margin.top  - margin.bottom;

    selection.each(function(data) {
      var stack = d3.layout.stack(),
          layers = stack(data),
          labels = _.map(layers[0], function(d) { return d.x; }),
          yStackMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); });

      var y = d3.scale.ordinal()
          .domain(labels)
          .rangeRoundBands([0, chartHeight], .08);

      var x = d3.scale.linear()
          .domain([0, yStackMax])
          .range([0, chartWidth]);

      var color = d3.scale.linear()
          .domain([0, layers.length - 1])
          .range(["#a8c1e5", "#a8c1e5"]);

      var xAxis = d3.svg.axis()
          .scale(x)
          .tickSize(0)
          .tickPadding(6)
          .orient("bottom");

      var yAxis = d3.svg.axis()
          .scale(y)
          .tickSize(0)
          .tickPadding(6)
          .orient("left");

      svg = d3.select(this).append("svg")
          .attr("class", "groupStack")
          .attr("width",  chartWidth  + margin.left + margin.right)
          .attr("height", chartHeight + margin.top  + margin.bottom)

      var bar = svg.append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
          .attr("class", "groupStack");

      var layer = bar.selectAll(".layer")
          .data(layers)
        .enter().append("g")
          .attr("class", "layer")
          .style("fill", function(d, i) { return color(i); });

      var rect = layer.selectAll("rect")
          .data(function(d) { return d; })
        .enter().append("rect")
          .attr("x", 0)
          .attr("y", function(d) { return y(d.x); })
          .attr("width", 0)
          .attr("height", y.rangeBand())

      rect.transition()
          .delay(function(d, i) { return i * 10; })
          .attr("x", function(d) { return x(d.y0); })
          .attr("width", function(d) { return x(d.y); });        

      bar.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + chartHeight + ")")
        .call(xAxis);

      bar.append("g")
        .attr("class", "y axis")
        .call(yAxis);
        
      var text = layer.selectAll("text")
        .data(function(d) { return d; })
      .enter().append("text")
        .attr("x", function(d) { return x(d.y)+5; })
        .attr("y", function(d) { return y(d.y)+y.rangeBand()/2+4; })
        .attr("class","value")
        .text(function(d, i) { return d.y+d.y0; });
        
      var legend = svg.selectAll(".legend")
      .data(layers)
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

      legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", function(d, i) { return color(i); });

      legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d[0].category; });        
    });
  }

  // Getters and Setters
  my.width = function(value) {
    if (!arguments.length) { return width; }
    width = value;
    return my;
  };

  my.height = function(value) {
    if (!arguments.length) { return height; }
    height = value;
    return my;
  };

  my.svg = function() {
    return svg;
  };

  return my;
};
