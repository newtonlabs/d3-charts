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
  // console.log(data);

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


var barChart = d3.charts.barchart();
d3.csv("data/barchart_data.csv", function(error, data) {

  var uniqueProperties = function(data, property) {
    return _.reduce(data, function(memo, d) {
      if (! _.find(memo, function(o) {return d[property].trim() === o;})) {
        memo.push(d[property]);
      }
      return memo;
    },[]);
  };
  
  var uniqueMonths = function(data, property) {
    return _.reduce(data, function(memo, d) {
      if (! _.find(memo, function(o) {return d[property].substring(4,6) === o;})) {
        memo.push(d[property].substring(4,6));
      }
      return memo;
    },[]);
  };
  
  var monthValue = function(data, month, xAxis) {
    data = _.filter(data, function(d){ return ((d.Category.substring(4,6) == month) && (d.xAxis == xAxis)); });
    return _.reduce(data, function(memo, num){ return memo + Math.abs(Number(num.value)); }, 0);
  }
  
  var month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  
  //filter for yAxis - "There can be only one"
  data = _.filter(data, function(d){ return d.yAxis == 'Funded Loans'; });
  
  //filter for august
  //data = _.filter(data, function(d){ return d.Category.substring(4,6) == '08'; });
  
  var scrubbed = [];
  var rows = uniqueProperties(data, 'xAxis');
  var months = uniqueMonths(data, 'Category');
  
  rows.forEach(function(r) {
    var obj = {
      xAxis: r
    }
    months.forEach(function(m) {
      obj[month[parseInt(m)-1]] = monthValue(data, m, r);
    });
    scrubbed.push(obj);
  });
  
  d3.select("#barchart").datum(scrubbed).call(barChart);
});