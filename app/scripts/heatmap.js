/*jslint browser: true*/
/*global $, jQuery, d3, _*/

if (d3.charts === null || typeof(d3.charts) !== "object") { d3.charts = {}; }

// Based on http://bost.ocks.org/mike/chart/
this.d3.charts.heatmap = function() {
 'use strict';

  var width = 960,
    height = 500,
    controlHeight = 50,
    margin = {top: 10,  right: 10, bottom: 100, left: 40},
    color = d3.scale.category10();

  function my(selection) {
    var chartWidth   = width  - margin.left - margin.right,
        chartHeight  = height - margin.top  - margin.bottom,
        chartHeight2 = controlHeight,
        x  = d3.time.scale().range([0, chartWidth]),
        x2 = d3.time.scale().range([0, chartWidth]),
        y  = d3.scale.linear().range([chartHeight, 0]),
        y2 = d3.scale.linear().range([chartHeight2, 0]),
        xAxis  = d3.svg.axis().scale(x).orient("bottom"),
        xAxis2 = d3.svg.axis().scale(x2).orient("bottom"),
        yAxis  = d3.svg.axis().scale(y).orient("left");

    selection.each(function(data) {
      console.log('creating visualization on selection');
      var svg = d3.select(this).append("svg")
        .attr("width",  chartWidth  + margin.left + margin.right)
        .attr("height", chartHeight + margin.top  + margin.bottom);

      svg.append("rect")
        .attr("height", height)
        .attr("width", width)
        .attr("style", "fill:blue;stroke:gray;stroke-width:2;fill-opacity:0.1;stroke-opacity:0.9");

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
