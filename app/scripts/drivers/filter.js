var filter = d3.charts.filter();
d3.csv("data/groupstack.csv", function(error, data) {
  var subcategories = d3.utilities.uniqueProperties(data,'subcategory')
  filter.width();
  d3.select("#filter").datum(subcategories).call(filter);
});

