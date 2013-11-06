var groupStack = d3.charts.groupStack().vertical(undefined).title('werd');
d3.csv("data/groupstack.csv", function(error, data) {
//   data = [
// {"category":"Complete","yAxis":"Reactive Reloads","value":"0","color":""},
// {"category":"On Track","yAxis":"Reactive Reloads","value":"0","color":""},
// {"category":"Complete","yAxis":"Proactive Reloads","value":"0","color":""},
// {"category":"On Track","yAxis":"Proactive Reloads","value":"800","color":""},
// {"category":"Complete","yAxis":"Capability Gaps","value":"3","color":""},
// {"category":"On Track","yAxis":"Capability Gaps","value":"14","color":""},
// {"category":"Complete","yAxis":"Margin Recovery","value":"0","color":""},
// {"category":"On Track","yAxis":"Margin Recovery","value":"0","color":""},
// {"category":"Complete","yAxis":"Network Changes","value":"60","color":""},
// {"category":"On Track","yAxis":"Network Changes","value":"569","color":""}];
  var group = _.groupBy(data, function(d) { return d.category })
  // console.log(group);
  layers = _.map(group, function(d, category) {
    return _.map(d, function(o) { return {x: o.yAxis, y: o.value++, category: category, color: o.color}; });
  });
  // console.log('layers', layers);


  d3.select("#groupStack").datum(layers).call(groupStack);
  d3.select("#groupStack_empty").datum(undefined).call(groupStack);
  groupStack.vertical(true);
  d3.select("#groupStack_vertical").datum(layers).call(groupStack);
  d3.select("#groupStack_vertical_empty").datum(undefined).call(groupStack);
});

