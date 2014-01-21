if (d3.charts === null || typeof(d3.charts) !== 'object') { d3.charts = {}; }

d3.charts.baseBuilder = function(selection, data, config) {
  'use strict';

  var builder = {},
      svg,
      chart,
      graphic;

  builder.draw = function() {
    builder.setupSvg();
    builder.setupChart();
    builder.setupGraphic();

    if (config.svgArea) { builder.svgArea(); }
    if (config.chartArea) { builder.chartArea(); }
    if (config.graphicArea) {builder.graphicArea(); }
    if (config.testArea) { builder.addTestCircles(); }
  };

  builder.setupSvg = function(){
    svg = d3.select(selection).append('svg')
        .attr('class', config.className)
        .attr('width',  config.width)
        .attr('height', config.height);
  }

  builder.setupChart = function() {
    chart = svg.append('g')
        .attr('transform', 'translate('
            + builder.marginLeft() + ','
            + builder.marginTop() + ')')
  }

  builder.chartArea = function() {
     chart.append('rect')
        .attr('height', builder.chartHeight())
        .attr('width', builder.chartWidth())
        .attr('x', 0)
        .attr('y', 0)
        .attr('stroke', 'steelblue')
        .attr('fill', 'none')
        .attr('stroke-width', '2px');
  }

  builder.setupGraphic = function() {
    graphic = svg.append('g')
        .attr('transform', 'translate('
            + builder.graphicMarginLeft() + ','
            + builder.graphicMarginTop() + ')')
  }

  builder.svgArea = function() {
    svg.append('rect')
      .attr('height', config.height)
      .attr('width', config.width)
      .attr('x', 0)
      .attr('y', 0)
      .attr('stroke', 'gray')
      .attr('fill', 'none')
      .attr('stroke-width', '1px');
  }

  builder.graphicArea = function() {
    graphic.append('rect')
      .attr('height', builder.graphicHeight())
      .attr('width', builder.graphicWidth())
      .attr('x', 0)
      .attr('y', 0)
      .attr('stroke', 'red')
      .attr('fill', 'none')
      .attr('stroke-width', '2px');
  }

  builder.addTestCircles = function() {
    graphic.selectAll('circle').data([10,20,30]).enter()
        .append('circle')
        .attr('cy', function(d,i) { return (100*(i+1)); })
        .attr('cx', function(d,i) { return (125*(i+1)); })
        .attr('r', function(d) { return d; })
        .attr('stroke-width', '2px')
        .attr('fill', 'steelblue');
  }

  builder.graphicWidth = function() {
    if (config.leftLabels) {
      return builder.chartWidth() - config.margin.leftLabel;
    }
    return builder.chartWidth();
  }

  builder.graphicHeight = function() {
    if (config.bottomLabels && config.topLabels) {
      return builder.chartHeight() - config.margin.bottomLabel - config.margin.topLabel;
    }
    if (config.bottomLabels && !config.topLabels) {
      return builder.chartHeight() - config.margin.bottomLabel;
    }
    if (!config.bottomLabels && config.topLabels) {
      return builder.chartHeight() - config.margin.topLabel;
    }
    return builder.chartHeight();
  }

  builder.chartWidth = function() {
    if (config.legend) {
      return config.width - config.margin.left - config.margin.right - config.margin.legend;
    }
    return config.width - config.margin.left - config.margin.right;
  }

  builder.chartHeight = function() {
    if (config.titleOn) {
      return config.height - config.margin.top - config.margin.bottom - config.margin.title;
    }
    return config.height - config.margin.top - config.margin.bottom;
  }

  builder.marginLeft = function() {
    return config.margin.left;
  }

  builder.marginTop = function() {
    if (config.titleOn) {
      return config.margin.top + config.margin.title
    }
    return config.margin.top;
  }

  builder.graphicMarginTop = function() {
    if (config.topLabels) {
      return builder.marginTop() + config.margin.topLabel;
    }
    return builder.marginTop();
  }

  builder.graphicMarginLeft = function() {
    if (config.leftLabels) {
      return builder.marginLeft() + config.margin.leftLabel;
    }
    return builder.marginLeft();
  }

  builder.legendMarginTop = function() {
    return builder.graphicMarginTop();
  }

  builder.legendMarginLeft = function() {
    return config.width - config.margin.legend + 8;
  }

  builder.titleMarginLeft = function() {
    return config.margin.left;
  }

  builder.titleMarginTop = function() {
    return config.margin.top;
  }

  builder.bottomLabel = function() {
    return config.margin.bottomLabel;
  }

  builder.drawNoDataLabel = function() {
    var noData = d3.charts.noData();

    noData.x((config.width - 300)/2).y(config.height/2 - 50);
    builder.svg().call(noData);
  }

  builder.drawTitle = function() {
    var title = d3.charts.chartTitle();

    title.title(config.title).subTitle(config.subtitle);
    title.x(builder.titleMarginLeft()).y(builder.titleMarginTop());
    builder.svg().call(title);
  }

  builder.svg = function() { return svg; }
  builder.chart = function() { return chart; }
  builder.graphic = function() { return graphic; }

  return builder;
};