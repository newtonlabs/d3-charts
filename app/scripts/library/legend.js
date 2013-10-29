/*jslint browser: true*/
/*global $, jQuery, d3, _*/

if (d3.charts === null || typeof(d3.charts) !== "object") { d3.charts = {}; }

// Based on http://bost.ocks.org/mike/chart/
this.d3.charts.legend = function() {
 'use strict';

  var x = 0,
    y = 0,
    color =  d3.scale.category10(),
    click = undefined

  function my(selection) {
    selection.each(function(data) {
      var legendBox = selection.append("g")
        .attr("class", "legend-container")
        .attr("transform", "translate(" + x + "," + y + ")");

      var legend = legendBox.selectAll(".legend")
        .data(data)
        .enter().append("g")
        .attr("class", "legend")


      legend.append("rect")
        .attr("x", 0)
        .attr("y", function(d,i) {return (i * 28)})
        .attr("width", 17)
        .attr("height", 17)
        .attr("fill", function(d) { return color(d); });

      legend.append("text")
        .attr("x", 25)
        .attr("y", function(d,i) {return (i * 28) + 9})
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(function(d) { return d; });

      if (click) {
        legendBox.selectAll("g")
          .attr("style", "cursor: pointer;")
          .on("click", click);
      }
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

  my.color = function(value) {
    if (!arguments.length) { return color; }
    color = value;
    return my;
  };

  my.click = function(value) {
    if (!arguments.length) { return click; }
    click = value;
    return my;
  }


  return my;
};
