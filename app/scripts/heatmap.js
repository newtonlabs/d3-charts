/*jslint browser: true*/
/*global $, jQuery, d3, _*/

if (d3.charts === null || typeof(d3.charts) !== "object") { d3.charts = {}; }

// Based on http://bost.ocks.org/mike/chart/
this.d3.charts.heatmap = function() {
 'use strict';

  var width = 1500,
    height = 500,
    controlHeight = 50,
    margin = { top: 40, right: 10, bottom: 10, left: 175 },
    buckets = 3;

  // Rewrite with native reduce
  var uniqueProperties = function(data, property) {
    return _.reduce(data, function(memo, d) {
      if (! _.find(memo, function(o) {return d[property] === o})) {
        memo.push(d[property]);
      }
      return memo;
    },[]);
  }

  function my(selection) {
    var chartWidth   = width  - margin.left - margin.right,
        chartHeight  = height - margin.top  - margin.bottom;

    selection.each(function(data) {

      var rows    = uniqueProperties(data[0].data, 'xAxis');
      var columns = uniqueProperties(data[0].data, 'yAxis');

      var x = d3.scale.ordinal().domain(rows).rangeRoundBands([0, chartWidth], .2, .2);
      var y = d3.scale.ordinal().domain(columns).rangeRoundBands([0, chartHeight], .2, .2);
      var yAxis = d3.svg.axis().scale(y).orient("left");
      var xAxis = d3.svg.axis().scale(x).orient("top");

      var svg = d3.select(this).append("svg")
        .attr("width",  chartWidth  + margin.left + margin.right)
        .attr("height", chartHeight + margin.top  + margin.bottom);

      var background = svg.append("rect")
        .attr("height", height)
        .attr("width", width)
        .attr("style", "stroke:gray;stroke-width:2;fill-opacity:0.05;stroke-opacity:0.9; fill:white");

      var heatmap = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      heatmap.selectAll("rect").data(data[0].data).enter().append("rect")
        .attr("x", function(d) { return x(d.xAxis)})
        .attr("y", function(d) { return y(d.yAxis)})
        .attr("rx", 10)
        .attr("ry", 10)
        .attr("width",  x.rangeBand())
        .attr("height", y.rangeBand())
        .attr("style", function(d) {return "fill:"+d.color+";stroke:gray;stroke-width:2;fill-opacity:.75;stroke-opacity:0.9"})

      heatmap.append("g")
        .attr("class", "y axis")
        .call(yAxis);

      heatmap.append("g")
        .attr("class", "x axis")
        .call(xAxis);

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

  return my;
};


      // var background = heatmap.append("rect")
      //   .attr("height", chartHeight)
      //   .attr("width", chartWidth)
      //   .attr("style", ";stroke:gray;stroke-width:2;fill-opacity:0.05;stroke-opacity:0.9; fill:white");
