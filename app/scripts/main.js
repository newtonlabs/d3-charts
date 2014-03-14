(function() {
  'use strict';

  var data = ['timeseries',
    'stacked',
    'heatmap',
    'tablechart',
    'template',
    'filter',
    'load',
    'bubble',
    'tree',
    'custom-bubble'];
  var navigation = d3.select('#navigation');

  navigation.selectAll('li').data(data).enter()
    .append('li')
    .append('a')
    .attr('href', function(d) {return '/specs/' + d + '.html';})
    .html(function(d) {return d})

}).call(this);

