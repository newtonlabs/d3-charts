if (d3.charts === null || typeof(d3.charts) !== 'object') { d3.charts = {}; }

this.d3.charts.tablechart = function() {
  'use strict';

  var chart  = d3.charts.baseChart()
      .config('svgArea', false)
      .config('chartArea', false)
      .config('graphicArea', false)
      .config('legend', false)
      .config('leftLabels', true)
      .config('bottomLabels', false)
      .config('topLabels', true)
      .config('titleOn', false)
      .config('chartType', 'line')
      .config('className', 'tablechart')
      .config('width', 900)
      .config('height',500)
      .builder(d3.charts.tablechartBuilder);

  return chart;
};
