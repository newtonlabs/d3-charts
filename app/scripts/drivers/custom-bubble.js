var bubble = d3.charts.customBubble()
d3.tsv("data/bubble_simple.tsv", function(error, data) {
  // data = d3.utilities.transformSet(data);
  // var group = _.groupBy(data, function(d) { console.log(d);return d.category })
  // layers = _.map(group, function(d, category) {
  //   return _.map(d, function(o) { return {x: o.yAxis, y: o.value++, category: category, color: o.color}; });
  // });

  d3.select("#custom-bubble").datum(data).call(bubble);
});

