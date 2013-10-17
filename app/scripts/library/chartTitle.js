/*jslint browser: true*/
/*global $, jQuery, d3, _*/

if (d3.charts === null || typeof(d3.charts) !== "object") { d3.charts = {}; }

// Based on http://bost.ocks.org/mike/chart/
this.d3.charts.chartTitle = function() {
 'use strict';

  var x = 0,
    y = 0,
    titleText = 'Lorem',
    subTitleText = 'Ipsum';

  function my(selection) {
    selection.each(function(data) {
      var title = selection.append("g").attr("class", "chart-title");
      title.attr("transform", "translate(" + x + "," + y + ")" );
      title.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .attr("class", "header")
        .text(titleText);

      title.append("text")
        .attr("x", 0)
        .attr("y", 15)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(subTitleText);
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

  my.title = function(value) {
    if (!arguments.length) { return titleText; }
    titleText = value;
    return my;
  };

  my.subTitle = function(value) {
    if (!arguments.length) { return subTitleText; }
    subTitleText = value;
    return my;
  }


  return my;
};
