if (d3.charts === null || typeof(d3.charts) !== 'object') { d3.charts = {}; }

this.d3.charts.heatmap = function() {
  'use strict';

  var chart  = d3.charts.baseChart()
      .config('svgArea', false)
      .config('chartArea', false)
      .config('graphicArea', false)
      .config('legend', false)
      .config('leftLabels', true)
      .config('bottomLabels', false)
      .config('topLabels', true)
      .config('titleOn', true)
      .config('width', 900)
      .config('height', 500)
      .config('fixedColumnWidth', false)
      .config('fixedRowHeight', false)
      .config('cellFont', 'small')
      .config('rowFont', 'small')
      .config('columnFont', 'small')
      .config('cellFontColor', 'white')
      .config('className', 'heatmap')
      .config('legendData', false)
      .config('cellValue', true)
      .builder(d3.charts.heatmapBuilder);

  return chart;
};
