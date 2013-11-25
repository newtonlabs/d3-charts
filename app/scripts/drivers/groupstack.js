var groupStack = d3.charts.groupStack().vertical(undefined).title('werd');
d3.csv("data/groupstack.csv", function(error, data) {
  var group = _.groupBy(data, function(d) { return d.category })
  layers = _.map(group, function(d, category) {
    return _.map(d, function(o) { return {x: o.yAxis, y: o.value++, category: category, color: o.color}; });
  });


  d3.select("#groupStack").datum(layers).call(groupStack);
  d3.select("#groupStack_empty").datum(undefined).call(groupStack);
  groupStack.vertical(true);
  d3.select("#groupStack_vertical").datum(layers).call(groupStack);
  d3.select("#groupStack_vertical_empty").datum(undefined).call(groupStack);
  console.log(groupStack.svg());
});

