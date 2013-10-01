
var groupStack = d3.charts.groupStack();
d3.csv("data/h_barchart_data.csv", function(error, data) {
  var group = _.groupBy(data, function(d) { return d.category })
  layers = _.map(group, function(d, category) {
    return _.map(d, function(o) { return {x: o.yAxis, y: o.value++}; });
  });
  console.log(layers);

  d3.select("#groupStack").datum(layers).call(groupStack);
});

