if (d3.charts === null || typeof(d3.charts) !== 'object') { d3.charts = {}; }

d3.charts.bubbleBuilder = function(selection, data, config) {
  'use strict';

  var builder = d3.charts.baseBuilder(selection, data, config),
      categories,
      y = d3.scale.linear(),
      x = d3.scale.linear(),
      r = d3.scale.linear(),
      xAxis = d3.svg.axis(),
      yAxis = d3.svg.axis(),
      color = d3.scale.ordinal(),
      format = d3.format('.3s'),
      legend = d3.charts.legend();

  builder.draw = function() {
    var empty = _.isEmpty(data);

    builder.setupSvg();
    builder.setupChart();
    builder.setupGraphic();
    empty ? setupNoData() : setupData();

    drawBubbleChart();
    if (config.titleOn) { builder.drawTitle(); }
    if (empty) { builder.drawNoDataLabel(); }
    if (config.legend) { drawLegend(); }
    if (config.chartArea) { builder.chartArea(); }
    if (config.graphicArea) { builder.graphicArea(); }
  };

  var setupNoData = function() {
    color.domain(['TBD']).range(['#E6E6E6']);
    legend.color(color);
  }

  var setupData = function() {
    x.domain(d3.extent(data, function(d) { return parseFloat(d.xAxis); }));
    y.domain(d3.extent(data, function(d) { return parseFloat(d.yAxis); }));
    r.domain(d3.extent(data, function(d) { return d.value; })).nice();
    // TODO DEMO HACK FOR PADDING
    x.domain([x.domain()[0] - 3, x.domain()[1] + 3]);
    categories = d3.utilities.uniqueProperties(data, 'category');
    color.domain(categories).range(d3.utilities.colorWheel)
  }

  var drawLegend = function() {
    legend.color(color);
    legend.y(builder.legendMarginTop()).x(builder.legendMarginLeft());
    builder.svg().datum(categories).call(legend);
  }

  var drawBubbleChart = function() {
    var chartHeight = builder.graphicHeight(),
        chartWidth = builder.graphicWidth(),
        chart = builder.graphic();

    y.rangeRound([chartHeight,0]);
    x.rangeRound([0, chartWidth]);
    r.rangeRound([3,20])

    xAxis.scale(x)
        .tickSize(-chartHeight)
        .tickPadding(3)
        .tickFormat(format)
        .outerTickSize([0])
        .orient('bottom');

    yAxis.scale(y)
        .tickSize(0)
        .tickPadding(10)
        .orient('left');

    chart.append('g')
        .attr('class', 'horizontal y axis')
        .call(yAxis);

    var gx = chart.append('g')
        .attr('class', 'horizontal x axis number')
        .attr('transform', 'translate(0,' + chartHeight + ')')
        .call(xAxis);
    gx.selectAll('g').classed('gridline', true);
    gx.selectAll('text').attr('x', 18)

    var layer = chart.selectAll('.layer')
        .data(data)
        .enter().append('g')
        .attr('class', 'layer');

    var bubble = layer.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", function(d) { return r(d.value) })
      .attr("cx", function(d) {
        return x(d.xAxis); })
      .attr("cy", function(d) { return y(d.yAxis); })
      .attr("fill", function(d) { return color(d.category); });

  }

  return builder;
};