/*jslint browser: true*/
/*global $, jQuery, d3, _*/

if (d3.charts === null || typeof(d3.charts) !== "object") { d3.charts = {}; }

// Based on http://bost.ocks.org/mike/chart/
this.d3.charts.hBarchart = function() {
  'use strict';

  var width = 960,
  height = 500,
  svg = {},
  margin = { top: 30, right: 10, bottom: 20, left: 10 };

  function my(selection) {
    var target;

    var hasTarget = function(){
      return typeof(target) !== 'undefined';
    }

    var chartWidth  = width - margin.left - margin.right,
        chartHeight = height - margin.top  - margin.bottom;

    var x = d3.scale.linear().range([0, chartWidth]);
    var y = d3.scale.ordinal().rangeRoundBands([0, chartHeight], .2);
    var stack = d3.layout.stack();
    var xAxis = d3.svg.axis().scale(x).orient("bottom");
    var yAxis = d3.svg.axis().scale(y).orient("bottom");

    selection.each(function(data) {

      svg = d3.select(this).append("svg")
        .attr("class", "barchart")  //for namespacing css
        .attr("width", chartWidth + margin.left + margin.right)
        .attr("height", chartHeight + margin.top + margin.bottom);

      var bar = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var extent = d3.extent(data, function(d) { return d.value; });
      extent[0] = Math.min(0, extent[0]);
      x.domain(extent);
      y.domain(data.map(function(d) { return d.yAxis; }))

      bar.selectAll(".bar").data(data).enter().append("rect")
        .attr("x", function(d) { return x(Math.min(0, d.value)); })
        .attr("y", function(d) { return y(d.yAxis); })
        .attr("width", function(d) { return Math.abs(x(d.value) - x(0)); })
        .attr("height", y.rangeBand())
        .attr("fill", function(d) { return d.color; } );

      bar.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + chartHeight + ")")
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

  my.svg = function() {
    return svg;
  };

  return my;
};
