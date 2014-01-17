if (d3.charts === null || typeof(d3.charts) !== 'object') { d3.charts = {}; }

d3.charts.templateBuilder = function(selection, data, config) {
  'use strict';

  var builder = d3.charts.baseBuilder(selection, data, config),
      legend = d3.charts.legend(),
      x = d3.scale.ordinal(),
      y = d3.scale.ordinal();

  builder.draw = function() {
    var empty = _.isEmpty(data);

    builder.setupSvg();
    builder.setupChart();
    builder.setupGraphic();
    if (empty) { stubNoData(); }

    setupData();
    drawChart();

    if (empty) { builder.drawNoDataLabel(); }
    if (config.legend) { drawLegend(); }
    if (config.svgArea) { builder.svgArea(); }
    if (config.titleOn) { builder.drawTitle(); }
    if (config.chartArea) { builder.chartArea(); }
    if (config.graphicArea) { builder.graphicArea(); }
  };

  var stubNoData = function() {
  }

  var setupData = function() {
  }

  var drawChart = function() {
  }

  var drawLegend = function() {
  }

  return builder;
};