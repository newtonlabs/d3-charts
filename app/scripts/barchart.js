/*jslint browser: true*/
/*global $, jQuery, d3, _*/

if (d3.charts === null || typeof(d3.charts) !== "object") { d3.charts = {}; }

// Based on http://bost.ocks.org/mike/chart/
this.d3.charts.barchart = function() {
 'use strict';

  var width = 1500,
    height = 500,
    margin = { top: 20, right: 100, bottom: 10, left: 250 },
    color = d3.scale.category20();

  function my(selection) {
  
    var chartWidth    = width  - margin.left - margin.right,
        chartHeight   = height - margin.top  - margin.bottom;

    var x0 = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    var x1 = d3.scale.ordinal();

    var y = d3.scale.linear()
        .range([chartHeight, 0]);

    var xAxis = d3.svg.axis()
        .scale(x0)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(d3.format(".2s"));

    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    selection.each(function(data) {
      var groups = d3.keys(data[0]).filter(function(key) { return ((key !== "xAxis") && (key !== "yAxis") && (key !== "target")); });
      
      data.forEach(function(d) {
        d.group = groups.map(function(name) { return {name: name, value: +d[name]}; });
      });

      x0.domain(data.map(function(d) { return d.xAxis; }));
      x1.domain(groups).rangeRoundBands([0, x0.rangeBand()]);
      y.domain([0, d3.max(data, function(d) { return d3.max(d.group, function(d) { return d.value; }); })]);

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + chartHeight + ")")
          .call(xAxis);

      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("y", -20)
          .attr("dy", ".71em")
          .style("text-anchor", "start")
          .text(data[0].yAxis);
          
      var cat = svg.selectAll(".cat")
          .data(data)
        .enter().append("g")
          .attr("class", "g")
          .attr("transform", function(d) { return "translate(" + x0(d.xAxis) + ",0)"; });

      cat.selectAll("rect")
          .data(function(d) { return d.group; })
        .enter().append("rect")
          .attr("width", x1.rangeBand())
          .attr("x", function(d) { return x1(d.name); })
          .attr("y", function(d) { return y(d.value); })
          .attr("height", function(d) { return chartHeight - y(d.value); })
          .style("fill", function(d) { return color(d.name); });

      // var line = d3.svg.line()
        // .x(function(d, i) {
          // console.log(d);
          // return x0(i); })
        // .y(function(d, i) { return y(400000); }); 

      // svg.append("path")
          // .datum(data)
          // .attr("style", function(d) {return "fill:none;stroke:gray;stroke-width:2;";})
          // .attr("d", line);          
          
      var line = svg.append("line")
                  .attr("x1", 0)
                  .attr("y1", y(data[0].target))
                  .attr("x2", width)
                  .attr("y2", y(data[0].target))
                  .attr("style", function(d) {return "fill:none;stroke-dasharray:5,5;stroke:gray;stroke-width:2;";});
          
      // var legend = svg.selectAll(".legend")
          // .data(groups.slice().reverse())
        // .enter().append("g")
          // .attr("class", "legend")
          // .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

      // legend.append("rect")
          // .attr("x", width - 18)
          // .attr("width", 18)
          // .attr("height", 18)
          // .style("fill", color);

      // legend.append("text")
          // .attr("x", width - 24)
          // .attr("y", 9)
          // .attr("dy", ".35em")
          // .style("text-anchor", "end")
          // .text(function(d) { return d; });        

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
