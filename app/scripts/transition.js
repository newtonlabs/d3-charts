/*jslint browser: true*/
/*global $, jQuery, d3, _*/

if (d3.charts === null || typeof(d3.charts) !== "object") { d3.charts = {}; }

// Based on http://bost.ocks.org/mike/chart/
this.d3.charts.transition = function() {
 'use strict';

  var width = 960,
    height = 500,
    controlHeight = 50,
    margin = {top: 10,  right: 10, bottom: 100, left: 40},
    color = d3.scale.category10();

  function my(selection) {


      var margin = {top: 200, right: 40, bottom: 200, left: 40},
          width = 960 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

      var x = d3.time.scale()
          .domain([new Date(2013, 7, 1), new Date(2013, 7, 15) - 1])
          .range([0, width]);

      var brush = d3.svg.brush()
          .x(x)
          .extent([new Date(2013, 7, 2), new Date(2013, 7, 3)])
          .on("brushend", brushended);

      var svg = d3.select("body").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      svg.append("rect")
          .attr("class", "grid-background")
          .attr("width", width)
          .attr("height", height);

      svg.append("g")
          .attr("class", "x grid")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.svg.axis()
              .scale(x)
              .orient("bottom")
              .ticks(d3.time.hours, 12)
              .tickSize(-height)
              .tickFormat(""))
        .selectAll(".tick")
          .classed("minor", function(d) { return d.getHours(); });

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .ticks(d3.time.days)
            .tickPadding(0))
        .selectAll("text")
          .attr("x", 6)
          .style("text-anchor", null);

      var gBrush = svg.append("g")
          .attr("class", "brush")
          .call(brush);
          // .call(brush.event);

      gBrush.selectAll("rect")
          .attr("height", height);

      function brushended() {
        if (!d3.event.sourceEvent) return; // only transition after input
        var extent0 = brush.extent(),
            extent1 = extent0.map(d3.time.day.round);

        // if empty when rounded, use floor & ceil instead
        if (extent1[0] >= extent1[1]) {
          extent1[0] = d3.time.day.floor(extent0[0]);
          extent1[1] = d3.time.day.ceil(extent0[1]);
        }

        console.log(this);

        d3.select(this).transition().duration(500)
            .call(brush.extent(extent1));
            // .call(brush.event);
      }


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
