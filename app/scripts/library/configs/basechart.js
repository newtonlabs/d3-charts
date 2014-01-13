if (d3.charts === null || typeof(d3.charts) !== 'object') { d3.charts = {}; }

this.d3.charts.baseChart = function() {
  'use strict';

  var config = {},
      svgContainer,
      builder;

  var chart = function(selection) {
    selection.each(function(data) {
      var build = builder(this, data, config);
      build.draw();
      svgContainer = build.svg();
    })
  };

  chart.config = function(accessor, value) {
    if (!arguments.length) { return config; }

    if (value !== undefined) { config[accessor] = value; }

    chart[accessor] = function(value) {
      if (!arguments.length) { return config[accessor]; }
      config[accessor] = value;
      return chart;
    };

    return chart;
  };

  chart.builder = function(value) {
    if (!arguments.length) { return builder; }
    builder = value;
    return chart;
  };

  // Chart Global Defaults
  chart.config('width', 900)
      .config('height', 500)
      .config('title', "TITLE GOES HERE")
      .config('subtitle', "Subtitle goes here")
      .config('margin', {
        top: 8,
        right: 0,
        bottom: 8,
        left: 0,
        leftLabel: 168,
        bottomLabel: 40,
        topLabel: 60,
        legend: 168,
        title: 30 })
      .config('leftLabels', true)
      .config('bottomLabels', true)
      .config('topLabels', false)
      .config('chartArea', false)
      .config('graphicArea', false)
      .config('legend', true)
      .config('titleOn', true)

  chart.svg =  function() { return svgContainer; }

  return chart;
};
