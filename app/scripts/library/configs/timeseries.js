if (d3.charts === null || typeof(d3.charts) !== 'object') { d3.charts = {}; }

this.d3.charts.timeseries = function() {
  'use strict';

  var chart  = d3.charts.baseChart()
      .config('svgArea', false)
      .config('chartArea', false)
      .config('graphicArea', false)
      .config('legend', true)
      .config('leftLabels', false)
      .config('bottomLabels', true)
      .config('topLabels', false)
      .config('titleOn', true)
      .config('className', 'timeseries')
      .config('width', 900)
      .config('height',500)
      .config('dataPoints',false)
      .config('zoomOff', false)
      .builder(d3.charts.timeseriesBuilder);

  return chart;
};
