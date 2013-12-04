if (d3.charts === null || typeof(d3.charts) !== 'object') { d3.charts = {}; }

this.d3.charts.tablechart = function() {
  'use strict';


  // custom config and overides
  var chart  = d3.charts.baseChart()
      .config('chartArea', false)
      .config('graphicArea', false)
      .config('legend', true)
      .config('leftLabels', true)
      .config('bottomLabels', true)
      .config('titleOn', true)
      .builder(d3.charts.tablechartBuilder);

  return chart;
};
