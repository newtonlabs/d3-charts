var filter = d3.charts.filter().subtitle('blah');
// filter.selected('Total');
d3.csv("data/stacked.csv", function(error, data) {
  data = d3.utilities.transformSet(data);
  var subcategories = d3.utilities.uniqueProperties(data,'subcategory')
  filter.width();
  d3.select("#filter").datum(subcategories).call(filter);
});

