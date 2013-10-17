(function() {
  'use strict';

  var data = ['timeseries',  'groupStack', 'filter', 'donut', 'heatmap', 'barchart', ];
  var navigation = d3.select('#navigation');

  navigation.selectAll('li').data(data).enter()
    .append('li')
    .append('a')
    .attr('href', function(d) {return d + ".html";})
    .html(function(d) {return d})

}).call(this);

