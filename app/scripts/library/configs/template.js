if (d3.charts === null || typeof(d3.charts) !== 'object') { d3.charts = {}; }

this.d3.charts.template = function() {
  'use strict';

  var chart  = d3.charts.baseChart()
      .config('svgArea', true)
      .config('chartArea', true)
      .config('graphicArea', true)
      .config('legend', true)
      .config('leftLabels', true)
      .config('bottomLabels', true)
      .config('topLabels', true)
      .config('titleOn', true)
      .config('className', 'template')
      .config('width', 900)
      .config('height',500)
      .builder(d3.charts.templateBuilder);

  return chart;
};
