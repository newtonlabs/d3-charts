var tablechart = d3.charts.tablechart();
var parseDate = d3.time.format("%Y%m%d").parse;

d3.csv("../data/tablechart.csv", function(error, data) {
  _.each(data, function(d) { d.date = parseDate(d.xAxis); d.value = +d.value});
  d3.select("#tablechart").datum(data).call(tablechart);
});