var child = d3.charts.childchart().color('red').stroke('black');
d3.select("#childchart").datum([10,10,10]).call(child);
