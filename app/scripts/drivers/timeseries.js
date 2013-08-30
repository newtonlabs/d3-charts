
var timeseriesChart = d3.charts.timeseries();
var parseDate = d3.time.format("%Y%m%d").parse;

var aggregate = function(data, category, stack) {
  var test = [];

  _.each(
    _.filter(data, function(d) {
       return (d.category == category && d.yAxis == stack);
    }), function(d) {
      test.push({
        date: parseDate(d.xAxis),
        value: +d.value
      })
    })
  return test;
}

d3.csv("data/timeseries_data.csv", function(error, data) {

  var series = d3.utilities.uniqueProperties(data, "category");
  var stacks = d3.utilities.uniqueProperties(data, "yAxis");

  var teamNameFilter = "Team 1" || series[0];
  var metricFilter   = "Net Promoter Score" || stacks[0];

  var datum  = aggregate(data, teamNameFilter, metricFilter);

  var scrubbed = {
    series: teamNameFilter,
    data: datum
  };

  d3.select("#timeseries").datum([scrubbed]).call(timeseriesChart);


});