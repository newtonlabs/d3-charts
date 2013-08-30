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
    data = _.filter(data, function(d){ return ((d.category.substring(4,6) == month) && (d.xAxis == xAxis)); });
    return _.reduce(data, function(memo, num){ return memo + Number(num.value); }, 0);
  }


  //filter for yAxis - "There can be only one"
  data = _.filter(data, function(d){ return d.yAxis == 'Funded Loans'; });

  //filter for per month
  //data = _.filter(data, function(d){ return d.category.substring(4,6) == '03'; });

  var scrubbed = [],
    month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    rows = uniqueProperties(data, 'xAxis'),
    months = uniqueMonths(data, 'category');

  rows.forEach(function(r) {
    var obj = {
      xAxis: r,
      yAxis: data[0].yAxis,
      target: data[0].target
    }
    months.forEach(function(m) {
      obj[month[parseInt(m)-1]] = monthValue(data, m, r);
    });
    scrubbed.push(obj);
  });

  d3.select("#barchart").datum(scrubbed).call(barChart);
  // console.log(barChart.svg());
});