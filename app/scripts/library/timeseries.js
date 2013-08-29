/*jslint browser: true*/
/*global $, jQuery, d3, _*/

if (d3.charts === null || typeof(d3.charts) !== "object") { d3.charts = {}; }

// Based on http://bost.ocks.org/mike/chart/
this.d3.charts.timeseries = function() {
 'use strict';

  var width = 960,
    height = 500,
    controlHeight = 50,
    margin = {top: 10,  right: 10, bottom: 100, left: 40},
    svg = {},
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

      color.domain(_.map(data, function(d) {return d.series; }));

      x.domain(d3.extent(data[0].data, function(d) { return d.date; }));
      y.domain([
        d3.min(data, function(d) { return d3.min(d.data, function(c) {return c.value; }); }),
        d3.max(data, function(d) { return d3.max(d.data, function(c) {return c.value; }); })
      ]);
      x2.domain(x.domain());
      y2.domain(y.domain());

      var line = d3.svg.line().interpolate("basis")
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.value); });

      var line2 = d3.svg.line().interpolate("basis")
        .x(function(d) { return x2(d.date); })
        .y(function(d) { return y2(d.value); });

      svg = d3.select(this).append("svg")
        .attr("width",  chartWidth  + margin.left + margin.right)
        .attr("height", chartHeight + margin.top  + margin.bottom);

      svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", chartWidth)
        .attr("height", chartHeight);

      var focus = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var brush = d3.svg.brush().x(x2).on("brush", function() {
        x.domain(brush.empty() ? x2.domain() : brush.extent());
        focus.selectAll("path").data(data).attr("d", function(d) {return line(d.data);});
        focus.select(".x.axis").call(xAxis);
      });

      var context = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + (chartHeight + chartHeight2 - margin.top)  + ")");

      focus.selectAll("path").data(data).enter().append("path")
        .attr("clip-path", "url(#clip)")
        .attr("class", "line")
        .attr('fill', 'none')
        .attr("d", function(d) { return line(d.data); })
        .attr("stroke", function(d) { return color(d.series); });

      focus.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + chartHeight + ")")
        .call(xAxis);

      focus.append("g")
          .attr("class", "y axis")
          .call(yAxis);

      context.selectAll("path").data(data).enter().append("path")
        .attr("class", "line")
        .attr('fill', 'none')
        .attr("d", function(d) { return line2(d.data); })
        .attr("stroke", function(d) { return color(d.series); });

      context.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + chartHeight2 + ")")
        .call(xAxis2);

      context.append("g")
        .attr("class", "x brush")
        .call(brush)
        .selectAll("rect")
        .attr("y", -6)
        .attr("height", chartHeight2 + 7);

      console.log(svg);
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
