var chart = d3.charts.plotmap()
    // .title("something here")
    // .subtitle(undefined)
    // .fixedRowHeight(145)
    // .fixedColumnWidth(145)
    // .cellFont('medium')
    // .rowFont('medium')
    // .columnFont('medium')
    // .legend(legend);

d3.csv("../data/plotmap.csv", function(error, data) {
  var organizedData = _.reduce(data, function(memo, obj) {

    var cell = _.find(memo, function(d) {
      return (d.category == obj.category && d.subcategory == obj.subcategory)});

    if (cell) {
      cell.data.push({name: obj.yAxis, value: obj.value});
    } else {
      cell = {};
      cell.subcategory = obj.subcategory;
      cell.category    = obj.category;
      cell.data = [];
    }

    memo.push(cell);

    return memo
  },[]);

  d3.select("#plotmap").datum(organizedData).call(chart);
  d3.select("#plotmap_empty").datum(undefined).call(chart);
});
