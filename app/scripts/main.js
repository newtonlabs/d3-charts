"use strict";

var timeseriesChart = d3.charts.timeseries();

var parseDate = d3.time.format("%Y%m%d").parse;

d3.tsv("constants/data.tsv", function(error, data) {
  var series = d3.keys(data[0]).filter(function(key) { return key !== "date"; })

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

 d3.select("#timeseries").datum(scrubbed).call(timeseriesChart);
});


var heatmapChart = d3.charts.heatmap();
var populate = function(category, obj) {
  var data = {
    xAxis: obj.xAxis,
    yAxis: obj.yAxis,
    color: obj.color,
    trend: obj.trend,
    value: obj.value,
    target: obj.target,
    id: obj.ID

  }
  category.data.push(data);
};

d3.csv("data/heatMap_data.csv", function(error, data) {
  console.log(data);

  // Maintain order from the JSON object
  var scrubbed = _.reduce(data, function(memo, obj) {

    var category = _.find(memo, function(d) {return d.name == obj.category});

    if (category) {
      populate(category, obj)
    }
    else {
      category = {};
      category.name = obj.category;
      category.data = [];
      memo.push(category);
    }

    return memo
  },[]);

  d3.select("#heatmap").datum(scrubbed).call(heatmapChart);
});

