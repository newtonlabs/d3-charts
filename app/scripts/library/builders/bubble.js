if (d3.charts === null || typeof(d3.charts) !== 'object') { d3.charts = {}; }

d3.charts.bubbleBuilder = function(selection, data, config) {
  'use strict';

  var builder = d3.charts.baseBuilder(selection, data, config),
      layers,
      barTextPadding = 50,
      y = d3.scale.linear(),
      x = d3.scale.linear(),
      r = d3.scale.linear(),
      xAxis = d3.svg.axis(),
      yAxis = d3.svg.axis(),
      color = d3.scale.ordinal(),
      format = d3.format('.3s'),
      stack = d3.layout.stack(),
      legend = d3.charts.legend();

  builder.draw = function() {
    var empty = _.isEmpty(data);
    
    setupMargins();
    builder.setupSvg();
    builder.setupChart();
    builder.setupGraphic();
    empty ? setupNoData() : setupData();

    drawBubbleChart();
    if (config.titleOn) { builder.drawTitle(); }
    if (empty) { builder.drawNoDataLabel(); }
    if (config.legend) { drawLegend(); }
    if (config.chartArea) { builder.chartArea(); }
    if (config.graphicArea) { builder.graphicArea(); }
  };

  var setupMargins = function() {
    if (config.vertical) { config.margin.leftLabel = barTextPadding; }
  }

  var setupNoData = function() {
    layers = [];
    color.domain(['TBD']).range(['#E6E6E6']);
    y.domain(_.map(_.range(7), function(d) {return ('Label - ' + d)}));
    legend.color(color);
  }

  var setupData = function() {
    console.log(data,"data")
    //layers = stack(data);

    // var yStackMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); }),
    //     padding = d3.utilities.padDomain(builder.graphicWidth(), yStackMax, barTextPadding);

    x.domain(d3.extent(data, function(d) { return d.sepalWidth; })).nice();
    y.domain(d3.extent(data, function(d) { return d.sepalLength; })).nice();
    r.domain(d3.extent(data, function(d) { return d.petalWidth; })).nice();
    // color.domain(categories()).range(colors());
    // legend.color(color);
  }

  var colors = function() {
    return _.reduce(layers, function(memo, d, i) {
      var color = d[0].color ? d[0].color : d3.utilities.stackColors[i];
      memo.push(color);
      return memo;
    }, []);
  }

  var categories = function() {
    if (_.isEmpty(layers)) {
      return ['TBD'];
    }
    return _.reduce(layers, function(memo, d) { memo.push(d[0].category); return memo}, []);
  }

  // var barColor = function(d) {
  //   return _.isEmpty(d.color) ? color(d.category) : d.color;
  // }

  // var lastLayer = function(layers) {
  //   return _.isEmpty(layers) ? [] : _.last(layers);
  // }

  var legendItems = function() {
    return config.vertical ? categories().slice().reverse() : categories()
  }

  var drawLegend = function() {
    legend.y(builder.legendMarginTop()).x(builder.legendMarginLeft());
    builder.svg().datum(legendItems()).call(legend);
  }

  var isInt = function(d) {
    return d % 1 === 0;
  }

  var textFormat = function(d) {
    var number = d.y + d.y0;

    if (isInt(number)) {
      if (number > 999) {
        return format(number);
      } else {
        return number;
      }
    } else {
      return format(number);
    }
  }


  var drawBubbleChart = function() {
    var chartHeight = builder.graphicHeight(),
        chartWidth = builder.graphicWidth(),
        chart = builder.graphic();

    y.range([chartHeight,0]);
    x.range([0, chartWidth]);
    r.range([3,20])

    var color = d3.scale.category10();

    xAxis.scale(x)
        .tickSize(-chartHeight)
        .tickPadding(3)
        .tickFormat(format)
        .outerTickSize([0])
        .orient('bottom');

    yAxis.scale(y)
        .tickSize(0)
        .tickPadding(10)
        .orient('left');

    chart.append('g')
        .attr('class', 'horizontal y axis')
        .call(yAxis);

    var gx = chart.append('g')
        .attr('class', 'horizontal x axis number')
        .attr('transform', 'translate(0,' + chartHeight + ')')
        .call(xAxis);
    gx.selectAll('g').classed('gridline', true);
    gx.selectAll('text').attr('x', 18)

    var layer = chart.selectAll('.layer')
        .data(data)
        .enter().append('g')
        .attr('class', 'layer');

    var bubble = layer.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", function(d){ 
        return r(d.petalWidth)
        //return 3.5 
      })
      .attr("cx", function(d) { return x(d.sepalWidth); })
      .attr("cy", function(d) { return y(d.sepalLength); })
      .style("fill", function(d) { return color(d.species); });

  }

  return builder;
};