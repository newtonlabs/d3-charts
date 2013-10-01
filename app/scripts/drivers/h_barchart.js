var hBarchart = d3.charts.hBarchart();
d3.csv("data/h_barchart_data.csv", function(error, data) {

  // var uniqueProperties = function(data, property) {
  //   return _.reduce(data, function(memo, d) {
  //     if (! _.find(memo, function(o) {return d[property].trim() === o;})) {
  //       memo.push(d[property]);
  //     }
  //     return memo;
  //   },[]);
  // };

  // data = _.filter(data, function(d){ return ((d.yAxis == 'Net Promoter Score') && (d.category == 'January')); });

  // var scrubbed = [],
  // rows = d3.utilities.uniqueProperties(data, 'xAxis'),
  // categories = d3.utilities.uniqueProperties(data, 'category');

  // rows.forEach(function(r) {
  //   var obj = {
  //     xAxis: r,
  //     yAxis: data[0].yAxis,
  //     target: data[0].target
  //   }
  //   categories.forEach(function(c) {
  //     catData = _.filter(data, {category: c, xAxis: r});
  //     // Dont user Number code (formatter in canvs)
  //     obj[c] = {value: Number(catData[0].value).toFixed(2), color: catData[0].color};
  //   });
  //   scrubbed.push(obj);
  // });

  var scrubbed = data;

  d3.select("#hBarchart").datum(scrubbed).call(hBarchart);
});
