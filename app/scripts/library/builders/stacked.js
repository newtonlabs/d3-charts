if (d3.charts === null || typeof(d3.charts) !== 'object') { d3.charts = {}; }

d3.charts.stackedBuilder = function(selection, data, config) {
  'use strict';

  var builder = d3.charts.baseBuilder(selection, data, config),
      layers,
      layerData,
      barTextPadding = 50,
      y = d3.scale.ordinal(),
      x = d3.scale.linear(),
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

    config.vertical ? drawVertical() : drawHorizontal();
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
    layerData = [];
    color.domain(['TBD']).range(['#E6E6E6']);
    y.domain(_.map(_.range(7), function(d) {return ('Label - ' + d)}));
    legend.color(color);
  }

  var setupData = function() {
    layers = stack(data);
    layerData = config.stackLabels ? _.flatten(layers) : lastLayer(layers) ;

    var yStackMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); }),
        yGroupMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y; }); }),
        padding = d3.utilities.padDomain(builder.graphicWidth(), yStackMax, barTextPadding);

    if (config.grouped) {
      padding = d3.utilities.padDomain(builder.graphicWidth(), yGroupMax, barTextPadding);
      x.domain([0, (yGroupMax + padding)]);
    }
    else {
      padding = d3.utilities.padDomain(builder.graphicWidth(), yStackMax, barTextPadding);
      x.domain([0, (yStackMax + padding)]);
    }

    y.domain(_.map(layers[0], function(d) { return d.x; }));
    color.domain(categories()).range(colors());
    legend.color(color);
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

  var barColor = function(d) {
    return _.isEmpty(d.color) ? color(d.category) : d.color;
  }

  var lastLayer = function(layers) {
    return _.isEmpty(layers) ? [] : _.last(layers);
  }

  var legendItems = function() {
    if (config.vertical && !config.grouped) {
      return categories().slice().reverse();
    }
    return categories();
  }

  var drawLegend = function() {
    legend.y(builder.legendMarginTop()).x(builder.legendMarginLeft());
    builder.svg().datum(legendItems()).call(legend);
  }

  var isInt = function(d) {
    return d % 1 === 0;
  }

  var textFormat = function(d) {
    var number = config.stackLabels ? d.y :  d.y + d.y0;

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

  var drawVertical = function() {
    var chartHeight = builder.graphicHeight(),
    chartWidth = builder.graphicWidth(),
    chart = builder.graphic();

    y.rangeRoundBands([0,chartWidth], 0.2);
    x.range([chartHeight,0]);

    var verticalX = y;
    var verticalY = x;
    var vertical_xAxis = yAxis;
    var vertical_yAxis = xAxis;

    vertical_yAxis.scale(verticalY)
        .tickSize(chartWidth)
        .tickPadding(3)
        .tickFormat(format)
        .outerTickSize([0])
        .orient('right');

    vertical_xAxis.scale(verticalX)
        .tickSize(0)
        .orient('bottom');

    var gy = chart.append('g')
        .attr('class', 'vertical y axis number')
        .attr('transform', 'translate (-48,0)')
        .call(vertical_yAxis);

    gy.selectAll('g').classed('gridline', true);
    gy.selectAll('text').attr('x', 4).attr('dy', -4);

    var gx = chart.append('g')
      .attr('class', 'vertical x axis')
      .attr('transform', 'translate(0,' + chartHeight + ')')
      .call(vertical_xAxis);

    var layer = chart.selectAll('.layer')
        .data(layers)
        .enter().append('g')
        .attr('class', 'layer')
        .style('fill', function(d, i)  {return color(d[0].category); });

    if (config.grouped) {
      var n = layers.length;

      var rect = layer.selectAll("rect")
          .data(function(d) { return d; })
          .enter().append('rect')
          .attr("x", function(d, i, j) { return verticalX(d.x) + verticalX.rangeBand() / n * j; })
          .attr('fill', barColor)
          .attr("width", verticalX.rangeBand() / n)
      rect
          .transition()
          .delay(function(d, i) { return i * 40; })
          .attr("y", function(d) { return verticalY(d.y); })
          .attr("height", function(d) { return chartHeight - verticalY(d.y); });

      var text = layer.selectAll('.value')
        .data(function(d) { return d; })
        .enter().append('text')
        .attr('text-anchor', 'middle')
        .attr('y', function(d) { return (verticalY(d.y)) - 4 ; })
        .attr("x", function(d, i, j) { return verticalX(d.x) + verticalX.rangeBand() / n * j + (verticalX.rangeBand() / n)/2; })
        .attr('class','h_value')
        .text(textFormat);
    }
    else {
      var rect = layer.selectAll('rect')
          .data(function(d) { return d; })
          .enter().append('rect')
          .attr('y', chartHeight)
          .attr('x', function(d) { return verticalX(d.x); })
          .attr('height', 0)
          .attr('fill', barColor)
          .attr('width', verticalX.rangeBand())

      rect
          .transition()
          .delay(function(d, i) { return i * 40; })
          .attr('y', function(d) {return verticalY(d.y0 + d.y);})
          .attr('height', function(d) { return verticalY(d.y0) - verticalY(d.y0 + d.y)});

      var text = chart.selectAll('.value')
        .data(layerData)
        .enter().append('text')
        .attr('text-anchor', 'middle')
        .attr('y', function(d) {return (verticalY(d.y0 + d.y)) - 4 ; })
        .attr('x', function(d) { return verticalX(d.x)+verticalX.rangeBand()/2; })
        .attr('class','value')
        .text(textFormat);
    }
  }

  var drawHorizontal = function() {
    var chartHeight = builder.graphicHeight(),
        chartWidth = builder.graphicWidth(),
        chart = builder.graphic();

    y.rangeRoundBands([0,chartHeight], 0.2);
    x.range([0, chartWidth]);

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
        .data(layers)
        .enter().append('g')
        .attr('class', 'layer');

    if (config.grouped) {
      var n = layers.length;

      var rect = layer.selectAll("rect")
          .data(function(d) { return d; })
          .enter().append('rect')
          .attr("y", function(d, i, j) { return y(d.x) + y.rangeBand() / n * j; })
          .attr('fill', barColor)
          .attr("height", y.rangeBand() / n)
      rect
          .transition()
          .delay(function(d, i) { return i * 40; })
          .attr("x", 0)
          .attr("width", function(d) { return x(d.y); });

      var text = layer.selectAll('.value')
          .data(function(d) { return d; })
          .enter().append('text')
          .attr('x', function(d) { return x(d.y)+5; })
          .attr("y", function(d, i, j) { return y(d.x) + y.rangeBand() / n * j + (y.rangeBand() / n)/2 + 4;  })
          .attr('class','h_value')
          .text(textFormat);
    }
    else {
      var rect = layer.selectAll('rect')
          .data(function(d) { return d; })
          .enter().append('rect')
          .attr('x', 0)
          .attr('y', function(d) { return y(d.x); })
          .attr('width', 0)
          .attr('fill', barColor)
          .attr('height', y.rangeBand())

      rect
          .transition()
          .delay(function(d, i) { return i * 40; })
          .attr('x', function(d) { return x(d.y0); })
          .attr('width', function(d) { return x(d.y); });

      var text = chart.selectAll('.value')
          .data(layerData)
          .enter().append('text')
          .attr('x', function(d) { return x(d.y + d.y0)+5; })
          .attr('y', function(d) { return y(d.x)+y.rangeBand()/2+4; })
          .attr('class','value')
          .text(textFormat);
    }
  }

  return builder;
};