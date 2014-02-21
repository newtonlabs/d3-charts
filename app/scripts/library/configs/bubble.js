if (d3.charts === null || typeof(d3.charts) !== 'object') { d3.charts = {}; }

this.d3.charts.bubble = function() {
  'use strict';

  var chart  = d3.charts.baseChart()
      .config('chartArea', false)
      .config('graphicArea', false)
      .config('legend', true)
      .config('leftLabels', true)
      .config('bottomLabels', true)
      .config('titleOn', true)
      .config('vertical', false)
      .config('className', 'bubble')
      .builder(d3.charts.bubbleBuilder);

  return chart;
};
