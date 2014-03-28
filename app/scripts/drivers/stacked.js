var stacked = d3.charts.stacked().vertical(undefined);
d3.csv("data/stacked.csv", function(error, data) {
  data = d3.utilities.transformSet(data);
  var group = _.groupBy(data, function(d) { return d.category });
  var sortIndex = group[data[0].category];

  layers = _.map(group, function(yAxises, category) {
    var layer = [];
    _.each(sortIndex, function(i) {
      var o = _.find(yAxises, function(yAxis) {return yAxis.yAxis === i.yAxis});
      layer.push({x: o.yAxis, y: o.value++, category: category, color: o.color})
    })
    return layer;
  });

  d3.select("#stacked").datum(layers).call(stacked);
  d3.select("#stacked-empty").datum(undefined).call(stacked);

  stacked.vertical(true);
  d3.select("#stacked-vertical").datum(layers).call(stacked);
  d3.select("#stacked-vertical-empty").datum(undefined).call(stacked);
});

