var stacked = d3.charts.stacked().vertical(undefined);
d3.csv("data/stacked.csv", function(error, data) {
  data = d3.utilities.transformSet(data);
  var group = _.groupBy(data, function(d) { return d.category })
  layers = _.map(group, function(d, category) {
    return _.map(d, function(o) { return {x: o.yAxis, y: o.value++, category: category, color: o.color}; });
  });

  stacked.grouped(true);
  d3.select("#stacked").datum(layers).call(stacked);
  d3.select("#stacked-empty").datum(undefined).call(stacked);

  stacked.vertical(true).grouped(true);
  d3.select("#stacked-vertical").datum(layers).call(stacked);
  d3.select("#stacked-vertical-empty").datum(undefined).call(stacked);
});

