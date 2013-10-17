
var timeseriesChart = d3.charts.timeseries().dataPoints(false).title("Jalil is a badass").subTitle("and so is Thomas");
var parseDate = d3.time.format("%Y%m%d").parse;

var aggregate = function(data, category, stack) {
  var test = [];

  _.each(
    _.filter(data, function(d) {
       return (d.category == category && d.yAxis == stack);
    }), function(d) {
      test.push({
        date: parseDate(d.xAxis),
        value: +d.value,
        color: d.color,
        target: d.target
      })
    })
  return test;
}

d3.csv("data/timeseries_data.csv", function(error, data) {

  var series = d3.utilities.uniqueProperties(data, "category");
  _.each(data, function(d) { d.date = parseDate(d.xAxis); d.value = +d.value});
  var groups = _.groupBy(data, function(d) {return d.category});
  var datum  = _.map(series, function(d) { return {series: d, data: groups[d]}})

  d3.select("#timeseries").datum(datum).call(timeseriesChart);

});