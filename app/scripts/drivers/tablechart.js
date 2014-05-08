var tablechart = d3.charts.tablechart();
var parseDate = d3.time.format('%Y%m%d').parse;

d3.json('data/tablechart.js', function(error, data) {
  data = d3.utilities.transformSet(data);
  _.each(data, function(d) { d.date = parseDate(d.xAxis); d.value = +d.value});
  d3.select('#tablechart').datum(data).call(tablechart);
  d3.select('#tablechart_empty').datum([]).call(tablechart);
});
