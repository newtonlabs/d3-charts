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
    var chartWidth,
        chartHeight,
        categories,
        yStackMax,
        chart,
        layers,
        labels,
        chartData = [],
        y = d3.scale.ordinal(),
        x = d3.scale.linear(),
        xAxis  = d3.svg.axis(),
        yAxis  = d3.svg.axis(),
        color  = d3.scale.ordinal(),
        legend = d3.charts.legend(),
        noData = d3.charts.noData(),
        format = d3.format(".3s"),
        stack  = d3.layout.stack(),
        title  = d3.charts.chartTitle();

    var initialize = function(selection, data) {
      if (_.isEmpty(data)) {
        initializeWithOutData();
      } else {
        initializeWithData(data);
      }
      initializeDimensions(selection);
    }

    var initializeWithData = function(data) {
      chartData = data;
      layers = stack(chartData);
      labels = _.map(layers[0], function(d) { return d.x; });
      categories = _.reduce(layers, function(memo, d) { memo.push(d[0].category); return memo}, []);
      yStackMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); });

      y.domain(labels);
      x.domain([0, yStackMax]);
      color.domain(categories).range(d3.utilities.stackColors);
      legend.color(color);
    }

    var initializeWithOutData = function() {
      chartData = [];
      layers = [];
      labels = _.map(_.range(7), function(d) {return ("Label - " + d)});
      categories = [];

      y.domain(labels);
    }

    var initializeDimensions = function(selection) {
      // TODO ... -40?
      chartWidth  = width  - margin.left - margin.right - 40;
      chartHeight = height - margin.top  - margin.bottom - titleMargin.top;

      y.rangeRoundBands([0,chartHeight], 0.2);
      x.range([0, chartWidth]);

      svg = d3.select(selection).append("svg")
          .attr("class", "groupStack")
          .attr("width",  chartWidth  + margin.left + margin.right + 40)
          .attr("height", chartHeight + margin.top  + margin.bottom + titleMargin.top)

      chart = svg.append("g")
          .attr("transform", "translate(" + margin.left + "," + (margin.top + titleMargin.top) + ")")
          .attr("class", "groupStack");

      xAxis.scale(x)
          .tickSize(-chartHeight)
          .tickPadding(3)
          .tickFormat(format)
          .outerTickSize([0])
          .orient("bottom");

      yAxis.scale(y)
          .tickSize(0)
          .orient("left");
    }

    var drawChart = function() {
      chart.append("g").attr("class", "y axis").call(yAxis);

      var gx = chart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + chartHeight + ")")
        .call(xAxis);
      gx.selectAll("g").classed("gridline", true);
      gx.selectAll("text").attr("x", 18)

      var layer = chart.selectAll(".layer")
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
    }

    var drawTitle = function() {
      title.title(titleText).subTitle(subTitleText);
      title.x(16).y(margin.top);
      svg.call(title);
    }

    var drawLegend = function() {
      legend
          .y(margin.top + titleMargin.top)
          .x(chartWidth + 30 + margin.right);

      svg.datum(categories).call(legend);
    }

    var drawNoData = function() {
      noData.x((chartWidth)/2).y(chartHeight/2);
      svg.call(noData);
    }

    selection.each(function(data) {
      selection.each(function(data) {
        initialize(this, data);
        drawChart(data);
        drawTitle();
        drawLegend();
        if (_.isEmpty(data)) { drawNoData();}
      })
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

  my.subtitle = function(value) {
    if (!arguments.length) { return subTitleText; }
    subTitleText = value;
    return my;
  };

  return my;
};
