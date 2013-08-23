/*jslint browser: true*/
/*global $, jQuery, d3, _*/

if (d3.charts === null || typeof(d3.charts) !== "object") { d3.charts = {}; }

// Based on http://bost.ocks.org/mike/chart/
this.d3.charts.heatmap = function() {
 'use strict';

  var width = 1500,
    height = 500,
    controlHeight = 50,
    margin = { top: 140, right: 10, bottom: 10, left: 175 };

  // Rewrite with native reduce
  var uniqueProperties = function(data, property) {
    return _.reduce(data, function(memo, d) {
      if (! memo.filter(function(o) { return d[property] === o;}).length) {
        memo.push(d[property]);
      }
      return memo;
    },[]);
  };

  function my(selection) {
    var chartWidth    = width  - margin.left - margin.right,
        chartHeight   = height - margin.top  - margin.bottom,
        chartHeight2  = controlHeight;

    selection.each(function(data) {
      var rows    = uniqueProperties(data[0].data, 'xAxis');
      var columns = uniqueProperties(data[0].data, 'yAxis');
      var categories = uniqueProperties(data, 'name');

      var x = d3.scale.ordinal().domain(rows).rangeRoundBands([0, chartWidth], 0.2, 0.2);
      var y = d3.scale.ordinal().domain(columns).rangeRoundBands([0, chartHeight], 0.2, 0.2);
      var x2 = d3.scale.ordinal().domain(categories).rangeRoundBands([0, chartWidth], 0.2, 0.2);
      var invertx2 = d3.scale.quantize().domain([0, chartWidth]).range(categories);

      var yAxis = d3.svg.axis().scale(y).orient("left");
      var xAxis = d3.svg.axis().scale(x).orient("top");
      var xAxis2 = d3.svg.axis().scale(x2).orient("top");

      var brushended = function() {
        if (!d3.event.sourceEvent) return; // only transition after input
        var brushStart = x2(invertx2(brush.extent()[0]));
        var brushEnd   = brushStart + x2.rangeBand();

        d3.select(this).transition()
          .call(brush.extent([brushStart, brushEnd]))
            // .call(brush.event);
      };

      var brush = d3.svg.brush()
        .x(x2)
        .on("brushend", brushended);

      var svg = d3.select(this).append("svg")
        .attr("width",  chartWidth  + margin.left + margin.right)
        .attr("height", chartHeight + margin.top  + margin.bottom);

      svg.append("rect")
        .attr("height", height)
        .attr("width", width)
        .attr("style", "stroke:gray;stroke-width:2;fill-opacity:0.05;stroke-opacity:0.9; fill:white");

      var heatmap = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      heatmap.append("rect")
        .attr("height", height)
        .attr("width", width)
        .attr("style", "stroke:gray;stroke-width:2;fill-opacity:0.05;stroke-opacity:0.9; fill:white");

      heatmap.selectAll("rect").data(data[0].data).enter().append("rect")
        .attr("x", function(d) { return x(d.xAxis);})
        .attr("y", function(d) { return y(d.yAxis);})
        .attr("rx", 10)
        .attr("ry", 10)
        .attr("width",  x.rangeBand())
        .attr("height", y.rangeBand())
        .attr("style", function(d) {return "fill:"+d.color+";stroke:gray;stroke-width:2;fill-opacity:.75;stroke-opacity:0.9";});

      heatmap.append("g")
        .attr("class", "y axis")
        .call(yAxis);

      heatmap.append("g")
        .attr("class", "x axis")
        .call(xAxis);

      var control = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + 40  + ")");

      control.append("rect")
        .attr("height", chartHeight2)
        .attr("width",  chartWidth)
        .attr("style", "stroke:gray;stroke-width:2;fill-opacity:0.2;stroke-opacity:0.3; fill:gray");

      control.append("g")
        .attr("class", "x grid")
        .attr("transform", "translate(0," + chartHeight2 + ")")
        .call(d3.svg.axis()
            .scale(x2)
            .orient("bottom")
            // .ticks(d3.time.hours, 12)
            .tickSize(-height)
            .tickFormat(""))

      control.append("g")
        .attr("class", "x axis")
        .call(xAxis2);

      control.append("g")
        .attr("class", "x brush")
        .call(brush)
    // .call(brush.event)
        .selectAll("rect")
        .attr("y", 0)
        .attr("height", chartHeight2);
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


      // var background = heatmap.append("rect")
      //   .attr("height", chartHeight)
      //   .attr("width", chartWidth)
      //   .attr("style", ";stroke:gray;stroke-width:2;fill-opacity:0.05;stroke-opacity:0.9; fill:white");
