/*jslint browser: true*/
/*global $, jQuery, d3, _*/

if (d3.charts === null || typeof(d3.charts) !== "object") { d3.charts = {}; }

// Based on http://bost.ocks.org/mike/chart/
this.d3.charts.groupStack = function() {
  'use strict';
  var width = 1024,
  height = 500,
  svg = {},
  margin = {top: 10, right: 184, bottom: 20, left: 168},
  titleText = "STACKED BAR CHART EXAMPLE",
  subTitleText = "Subtext as needed",
  titleMargin = {top: 30};

  function my(selection) {
    var chartWidth    = width  - margin.left - margin.right - 40,
        chartHeight   = height - margin.top  - margin.bottom - titleMargin.top,
        format = d3.format(".3s"),
        title  = d3.charts.chartTitle().title(titleText).subTitle(subTitleText);

    selection.each(function(data) {
      var stack = d3.layout.stack(),
          layers = stack(data),
          labels = _.map(layers[0], function(d) { return d.x; }),
          categories = _.reduce(layers, function(memo, d) { memo.push(d[0].category); return memo}, []),
          yStackMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); });

      var y = d3.scale.ordinal()
          .domain(labels)
          .rangeRoundBands([0, chartHeight], .2);

      var x = d3.scale.linear()
          .domain([0, yStackMax])
          .range([0, chartWidth]);

      var color = d3.scale.ordinal()
          .domain(categories)
          .range(d3.utilities.stackColors);

      var legend  = d3.charts.legend().color(color);

      svg = d3.select(this).append("svg")
          .attr("class", "groupStack")
          .attr("width",  chartWidth  + margin.left + margin.right)
          .attr("height", chartHeight + margin.top  + margin.bottom + titleMargin.top)

      title.x(16).y(margin.top);
      svg.call(title);

      var bar = svg.append("g")
          .attr("transform", "translate(" + margin.left + "," + (margin.top + titleMargin.top) + ")")
          .attr("class", "groupStack");

      var xAxis = d3.svg.axis()
          .scale(x)
          .tickSize(-chartHeight)
          .tickPadding(3)
          .tickFormat(format)
          .outerTickSize([0])
          .orient("bottom");

      var yAxis = d3.svg.axis()
          .scale(y)
          .tickSize(0)
          .orient("left");

      bar.append("g")
        .attr("class", "y axis")
        .call(yAxis);

      var gx = bar.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + chartHeight + ")")
        .call(xAxis);

      gx.selectAll("g").classed("gridline", true);
      gx.selectAll("text").attr("x", 18)

      var layer = bar.selectAll(".layer")
          .data(layers)
          .enter().append("g")
          .attr("class", "layer")
          .style("fill", function(d, i) { return color(i); });

      var rect = layer.selectAll("rect")
          .data(function(d) { return d; })
          .enter().append("rect")
          .attr("x", 0)
          .attr("y", function(d) { return y(d.x); })
          .attr("width", 0)
          .attr("height", y.rangeBand())

      rect
          .transition()
          .delay(function(d, i) { return i * 40; })
          .attr("x", function(d) { return x(d.y0); })
          .attr("width", function(d) { return x(d.y); });


      var text = layer.selectAll("text")
          .data(_.last(layers))
          .enter().append("text")
          .attr("x", function(d) { return x(d.y + d.y0)+5; })
          .attr("y", function(d) { return y(d.y)+y.rangeBand()/2+4; })
          .attr("class","value")
          .text(function(d, i) { return format(d.y+d.y0); });

     // Build the legend
      legend
          .y(titleMargin.top)
          .x(chartWidth + 30 + margin.right);

      svg.datum(categories).call(legend);
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

  my.title = function(value) {
    if (!arguments.length) { return titleText; }
    titleText = value;
    return my;
  };

  my.subTitle = function(value) {
    if (!arguments.length) { return subTitleText; }
    subTitleText = value;
    return my;
  };

  return my;
};
