var timeseriesChart = d3.charts.timeseries()
    .dataPoints(false)
    .title("TIMESERIES SINE WAVE")
    .subtitle("1 year simulated data");

var parseDate = d3.time.format("%Y%m%d").parse;

d3.csv("data/timeseries.csv", function(error, data) {
  data = d3.utilities.transformSet(data);

  var series = d3.utilities.uniqueProperties(data, "category");
  _.each(data, function(d) { d.date = parseDate(d.xAxis); d.value = +d.value});
  var groups = _.groupBy(data, function(d) {return d.category});
  var datum = _.map(series, function(d) { return {series: d, data: groups[d]}})

  d3.select("#timeseries").datum(datum).call(timeseriesChart);

  timeseriesChart.legend(false);
  d3.select("#timeseries-nolegend").datum(datum).call(timeseriesChart);
  d3.select("#timeseries-empty").datum([]).call(timeseriesChart);

});