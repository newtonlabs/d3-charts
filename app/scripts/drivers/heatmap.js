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

var heatmapChart = d3.charts.heatmap().title("something here").subtitle(undefined).legend(legend);
// var heatmapChart = d3.charts.heatmap().title("something here").subtitle(undefined);
d3.csv("../data/heatMap_data.csv", function(error, data) {
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

  // console.log(scrubbed);

  d3.select("#heatmap").datum(scrubbed).call(heatmapChart);
});
