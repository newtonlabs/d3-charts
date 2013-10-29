/*jslint browser: true*/
/*global $, jQuery, d3, _*/

if (d3.charts === null || typeof(d3.charts) !== "object") { d3.charts = {}; }

// Based on http://bost.ocks.org/mike/chart/
this.d3.charts.noData = function() {
 'use strict';

  var x = 0,
    y = 0;

  function my(selection) {
    selection.each(function(data) {
      var noData = selection.append("g")
          .attr("class", "no-data-found")
          .attr("transform", "translate(" + x + "," + y +")");

      noData.append("rect")
          .attr("x", 0)
          .attr("y", 0)
          .attr("height", '100px')
          .attr("width", '300px')

      noData.append("text")
          .attr("x", 150)
          .attr("y", 55)
          .text("NO DATA FOUND");
    });
  }

  // Getters and Setters
  my.x = function(value) {
    if (!arguments.length) { return x; }
    x = value;
    return my;
  };

  my.y = function(value) {
    if (!arguments.length) { return y; }
    y = value;
    return my;
  };

  return my;
};
