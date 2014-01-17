var populate = function(category, obj) {
  var data = {
    xAxis: obj.xAxis,
    yAxis: obj.yAxis,
    color: obj.color,
    trend: obj.trend,
    value: obj.value,
    target: obj.target,
    id: obj.ID

  }
  category.data.push(data);
};

var legend = [
  {
    name: 'Threshold 1',
    color: '#a8c1e5'
  },
  {
    name: 'Threshold 2',
    color: '#6691d2'
  },
  {
    name: 'Threshold 3',
    color: '#d3e0f2'
  },
  {
    name: 'Threshold 4',
    color: '#2563bf'
  }
];

var heatmapChart = d3.charts.heatmap();
    // .title("something here")
    // .subtitle(undefined)
    // .fixedRowHeight(145)
    // .fixedColumnWidth(145)
    // .cellFont('medium')
    // .rowFont('medium')
    // .columnFont('medium')
    // .cellFontColor('black')
    // .legend(legend);

d3.csv("../data/heatmap.csv", function(error, data) {
  // Maintain order from the JSON object
  var scrubbed = _.reduce(data, function(memo, obj) {

    var category = _.find(memo, function(d) {return d.name == obj.category});

    if (category) {
      populate(category, obj)
    }
    else {
      category = {};
      category.name = obj.category;
      category.data = [];
      memo.push(category);
    }

    return memo
  },[]);

  heatmapChart.title('STANDARD TEST');
  d3.select("#heatmap").datum(scrubbed).call(heatmapChart);

  heatmapChart.legendData(legend).title('LEGEND TEST');
  d3.select("#heatmap-legend").datum(scrubbed).call(heatmapChart);

  heatmapChart.cellFont('medium')
        .rowFont('medium')
        .columnFont('medium')
        .cellFontColor('black')
        .legendData(undefined)
        .title('LARGE FONTS TEST')
  d3.select("#heatmap-fonts").datum(scrubbed).call(heatmapChart);

  heatmapChart.fixedRowHeight(145).fixedColumnWidth(145).title('FIXED DIMENSIONS TEST');
  d3.select("#heatmap-fixedwidth").datum(scrubbed).call(heatmapChart);

  heatmapChart.title('NO DATA TEST');
  d3.select("#heatmap-empty").datum([]).call(heatmapChart);
});


