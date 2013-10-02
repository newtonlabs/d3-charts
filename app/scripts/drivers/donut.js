var donut = d3.charts.donut();
d3.csv("data/donut_data.csv", function(error, data) {
  data.forEach(function(d) {
    d.population = +d.population;
  });

  d3.select("#groupStack").datum(data).call(donut);
});

