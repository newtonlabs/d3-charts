var tablechart = d3.charts.template();
var data = [1,2,3];

d3.select("#template").datum(data).call(tablechart);
d3.select("#template-empty").datum([]).call(tablechart);
