var tablechart = d3.charts.tablechart();
d3.csv("../data/heatmap.csv", function(error, data) {
  // Maintain order from the JSON object
  // var scrubbed = _.reduce(data, function(memo, obj) {

  //   var category = _.find(memo, function(d) {return d.name == obj.category});

  //   if (category) {
  //     populate(category, obj)
  //   }
  //   else {
  //     category = {};
  //     category.name = obj.category;
  //     category.data = [];
  //     memo.push(category);
  //   }

  //   return memo
  // },[]);

  d3.select("#tablechart").datum([]).call(tablechart);
  // d3.select("#heatmap_empty").datum([]).call(heatmapChart);
});