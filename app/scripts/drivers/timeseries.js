
var timeseriesChart = d3.charts.timeseries();

var parseDate = d3.time.format("%Y%m%d").parse;

d3.tsv("data/timeseries_old_data.tsv", function(error, data) {
  var series = d3.keys(data[0]).filter(function(key) { return key !== "date"; })
  console.log(series);

  data.forEach(function(d) {
    d.date = parseDate(d.date)
  })

  var scrubbed = _.map(series, function(name) {
    return {
      series: name,
      data: _.map(data, function(d) {
        return {date: d.date, value: +d[name]};
      })
    };
  });
  console.log(scrubbed);

 d3.select("#timeseries").datum(scrubbed).call(timeseriesChart);
});

// d3.csv("data/timeseries_data.csv", function(error, data) {
//   var series = d3.utilities.uniqueProperties(data, "category");

//   var scrubbed = _.map(series, function(name) {
//     return {
//       series: name,
//       data: _.map(_.filter(data, function(d) {return d.category == name;}), function(d) {
//         return {date: parseDate(d.xAxis), value: +d.value};
//       })
//     };
//   });
//   console.log([scrubbed[0]]);


//  d3.select("#timeseries").datum([scrubbed[0]]).call(timeseriesChart);

// });