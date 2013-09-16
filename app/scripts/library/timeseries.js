/*jslint browser: true*/
/*global $, jQuery, d3, _*/

if (d3.charts === null || typeof(d3.charts) !== "object") { d3.charts = {}; }

// Based on http://bost.ocks.org/mike/chart/
this.d3.charts.timeseries = function() {
 'use strict';

  var width = 960,
    height = 500,
    controlHeight = 50,
    margin = {top: 10,  right: 10, bottom: 100, left: 80},
    svg = {};
    //color = d3.scale.category10();

  function my(selection) {
    var target;
    var hasTarget = function(){
      return typeof(target) !== 'undefined';
    }
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
      x.domain(d3.extent(data[0].data, function(d) { return d.date; }));
      y.domain([
        d3.min(data, function(d) { return d3.min(d.data, function(c) {return c.value; }); }),
        d3.max(data, function(d) { return d3.max(d.data, function(c) {return c.value; }); })
      ]);
      x2.domain(x.domain());
      y2.domain(y.domain());

      var line = d3.svg.line()//.interpolate("basis")
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.value); });

      var line2 = d3.svg.line()//.interpolate("basis")
        .x(function(d) { return x2(d.date); })
        .y(function(d) { return y2(d.value); });

      if (typeof(data[0].data[0].target) !== 'undefined') {
        target = Number(data[0].data[0].target);
      }
      
      svg = d3.select(this).append("svg")
        .attr("class", "timeseries")  //for namespacing css
        .attr("width",  chartWidth  + margin.left + margin.right)
        .attr("height", chartHeight + margin.top  + margin.bottom);

      svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", chartWidth)
        .attr("height", chartHeight);

      var focus = svg.append("g")
        .attr("class", "chart1")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var brushing = function() {
        x.domain(brush.empty() ? x2.domain() : brush.extent());
        focus.selectAll("path").data(data).attr("d", function(d) {return line(d.data);});
        focus.selectAll("circle").data(data[0].data)
          .attr("cx", function(d) { return x(d.date); })
          .attr("cy", function(d) { return y(d.value); });
        focus.select(".x.axis").call(xAxis);
      }

      var brush = d3.svg.brush().x(x2)
        .on("brush", brushing);

      var context = svg.append("g")
        .attr("class", "chart2")
        .attr("transform", "translate(" + margin.left + "," + (chartHeight + chartHeight2 - margin.top)  + ")");

      focus.append("rect")
        .attr("class","focus")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", chartWidth)
        .attr("height", chartHeight)

      context.append("rect")
        .attr("class","context")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", chartWidth)
        .attr("height", chartHeight2)

      if (hasTarget()) {
        focus.append("line")
          .attr("class", "target")
          .attr("x1", 0)
          .attr("y1", y(target))
          .attr("x2", chartWidth)
          .attr("y2", y(target));
      }
      

      focus.selectAll("path").data(data).enter().append("path")
        .attr("clip-path", "url(#clip)")
        .attr("class", "line")
        .attr("d", function(d) {return line(d.data); });

      focus.selectAll("circle")
          .data(data[0].data).enter().append("circle")
          .attr("class", "circle")
          .attr("clip-path", "url(#clip)")
          .style("stroke", function(d) { return d.color; })
          .attr("cx", function(d) { return x(d.date); })
          .attr("cy", function(d) { return y(d.value); })
          .attr("r", 4);

      focus.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + chartHeight + ")")
        .call(xAxis);

      focus.append("g")
          .attr("class", "y axis")
          .call(yAxis);

      context.selectAll("path").data(data).enter().append("path")
        .attr("class", "timeline")
        .attr("d", function(d) { return line2(d.data); });

      context.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + chartHeight2 + ")")
        .call(xAxis2);

      var brushStart = x2.domain()[0];
      var brushEnd   = new Date();
      brushEnd.setTime(brushStart.getTime() + (24 * 60 * 60 * 1000 * 30)); // 30 days
      brush.extent([brushStart, brushEnd]);

      context.append("g")
        .attr("class", "x brush")
        .call(brush)
        .selectAll("rect")
        .attr("height", chartHeight2);

      brushing();

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
