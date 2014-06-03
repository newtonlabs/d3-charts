/*jslint browser: true*/
/*global $, jQuery, d3, _*/

if (d3.charts === null || typeof(d3.charts) !== "object") { d3.charts = {}; }

// Based on http://bost.ocks.org/mike/chart/
this.d3.charts.filter = function() {
  'use strict';
  var width = 960,
  height = 500,
  selected = undefined,
  svg = {};

  function my(selection) {
    selection.each(function(data) {
      data.unshift("Select");
      svg = d3.select(this).append("div");
      var select = svg.append("select");
      var options = select.selectAll("option").data(data);
      options.enter().append("option")
        .attr("value", function(d) { return d; })
        .attr("subcategory", function(d) { return d; })
        .attr("selected", function(d) {return d === selected ? 'selected' : null})
        .text(function(d) { return d; });

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

  my.selected = function(value) {
    if (!arguments.length) { return selected; }
    selected = value;
    return my;
  };

  my.svg = function() {
    return svg;
  };

  my.title = function(value)        {return my;};
  my.subtitle = function(value)     {return my;};
  my.titleOn = function(value)      {return my;};
  my.bottomLabels = function(value) {return my;};
  my.legend = function(value)       {return my;};
  my.graphicArea = function(value)  {return my;};
  my.chartArea = function(value)    {return my;};

  return my;
};
