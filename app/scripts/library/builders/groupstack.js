if (d3.charts === null || typeof(d3.charts) !== 'object') { d3.charts = {}; }

d3.charts.groupStackBuilder = function(selection, data, config) {
  'use strict';

  var builder = d3.charts.baseBuilder(selection, data, config),
      layers,
      barTextPadding = 50,
      y = d3.scale.ordinal(),
      x = d3.scale.linear(),
      xAxis = d3.svg.axis(),
      yAxis = d3.svg.axis(),
      color = d3.scale.ordinal(),
      format = d3.format(".3s"),
      stack = d3.layout.stack(),
      legend = d3.charts.legend(),
      noData = d3.charts.noData(),
      title = d3.charts.chartTitle();

  builder.draw = function() {
    var empty = _.isEmpty(data);

    builder.setupMargins();
    builder.setupSvg();
    builder.setupChart();
    builder.setupGraphic();
    empty ? builder.setupNoData() : builder.setupData();

    config.vertical ? builder.drawVertical() : builder.drawHorizontal();
    if (empty) { builder.drawNoData();   }
    if (config.titleOn) { builder.drawTitle(); }
    if (config.legend) { builder.drawLegend(); }
    if (config.chartArea) { builder.chartArea(); }
    if (config.graphicArea) { builder.graphicArea(); }
  };

  builder.setupMargins = function() {
    if (config.vertical) { config.margin.leftLabel = barTextPadding; }
  }

  builder.setupNoData = function() {
    layers = [];
    color.domain(['TBD']).range(['#E6E6E6']);
    y.domain(_.map(_.range(7), function(d) {return ("Label - " + d)}));
    legend.color(color);
  }

  builder.setupData = function() {
    layers = stack(data);

    var yStackMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); }),
        padding = d3.utilities.padDomain(builder.graphicWidth(), yStackMax, barTextPadding);

    y.domain(_.map(layers[0], function(d) { return d.x; }));
    x.domain([0, (yStackMax + padding)]);
    color.domain(builder.categories()).range(builder.colors());
    legend.color(color);
  }

  builder.colors = function() {
    return _.reduce(layers, function(memo, d, i) {
      var color = d[0].color ? d[0].color : d3.utilities.stackColors[i];
      memo.push(color);
      return memo;
    }, []);
  }

  builder.categories = function() {
    if (_.isEmpty(layers)) {
      return ['TBD'];
    }
    return _.reduce(layers, function(memo, d) { memo.push(d[0].category); return memo}, []);
  }

  builder.barColor = function(d) {
    return _.isEmpty(d.color) ? color(d.category) : d.color;
  }

  builder.lastLayer = function(layers) {
    return _.isEmpty(layers) ? [] : _.last(layers);
  }

  builder.drawNoData = function() {
    noData.x((config.width - 300)/2).y(config.height/2 - 50);
    builder.svg().call(noData);
  }

  builder.legendItems = function() {
    return config.vertical ? builder.categories().slice().reverse() : builder.categories()
  }

  builder.drawLegend = function() {
    legend.y(builder.legendMarginTop()).x(builder.legendMarginLeft());
    builder.svg().datum(builder.legendItems()).call(legend);
  }

  builder.drawTitle = function() {
    title.title(config.title).subTitle(config.subtitle);
    title.x(builder.titleMarginLeft()).y(builder.titleMarginTop());
    builder.svg().call(title);
  }

  builder.isInt = function(d) {
    return d % 1 === 0;
  }

  builder.textFormat = function(d) {
    var number = d.y + d.y0;

    if (builder.isInt(number)) {
      if (number > 999) {
        return format(number);
      } else {
        return number;
      }
    } else {
      return format(number);
    }
  }

  builder.drawVertical = function() {
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
        .orient("right");

    vertical_xAxis.scale(verticalX)
        .tickSize(0)
        .orient("bottom");

    var gy = chart.append("g")
        .attr("class", "vertical y axis number")
        .attr("transform", "translate (-48,0)")
        .call(vertical_yAxis);

    gy.selectAll("g").classed("gridline", true);
    gy.selectAll("text").attr("x", 4).attr("dy", -4);

    var gx = chart.append("g")
      .attr("class", "vertical x axis")
      .attr("transform", "translate(0," + chartHeight + ")")
      .call(vertical_xAxis);

    var layer = chart.selectAll(".layer")
        .data(layers)
        .enter().append("g")
        .attr("class", "layer")
        .style("fill", function(d, i)  {return color(d[0].category); });

    var rect = layer.selectAll("rect")
        .data(function(d) { return d; })
        .enter().append("rect")
        .attr("y", chartHeight)
        .attr("x", function(d) { return verticalX(d.x); })
        .attr("height", 0)
        .attr("fill", builder.barColor)
        .attr("width", verticalX.rangeBand())

    rect
        .transition()
        .delay(function(d, i) { return i * 40; })
        .attr("y", function(d) {return verticalY(d.y0 + d.y);})
        .attr("height", function(d) { return verticalY(d.y0) - verticalY(d.y0 + d.y)});

    var text = chart.selectAll(".value")
        .data(builder.lastLayer(layers))
        .enter().append("text")
        .attr("text-anchor", "middle")
        .attr("y", function(d) {return (verticalY(d.y0 + d.y)) - 4 ; })
        .attr("x", function(d) { return verticalX(d.x)+verticalX.rangeBand()/2; })
        .attr("class","value")
        .text(builder.textFormat);
  }

  builder.drawHorizontal = function() {
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
        .orient("bottom");

    yAxis.scale(y)
        .tickSize(0)
        .orient("left");

    chart.append("g")
        .attr("class", "horizontal y axis")
        .call(yAxis);

    var gx = chart.append("g")
        .attr("class", "horizontal x axis number")
        .attr("transform", "translate(0," + chartHeight + ")")
        .call(xAxis);
    gx.selectAll("g").classed("gridline", true);
    gx.selectAll("text").attr("x", 18)

    var layer = chart.selectAll(".layer")
        .data(layers)
        .enter().append("g")
        .attr("class", "layer");

    var rect = layer.selectAll("rect")
        .data(function(d) { return d; })
        .enter().append("rect")
        .attr("x", 0)
        .attr("y", function(d) { return y(d.x); })
        .attr("width", 0)
        .attr("fill", builder.barColor)
        .attr("height", y.rangeBand())

    rect
        .transition()
        .delay(function(d, i) { return i * 40; })
        .attr("x", function(d) { return x(d.y0); })
        .attr("width", function(d) { return x(d.y); });

    var text = chart.selectAll(".value")
        .data(builder.lastLayer(layers))
        .enter().append("text")
        .attr("x", function(d) { return x(d.y + d.y0)+5; })
        .attr("y", function(d) { return y(d.x)+y.rangeBand()/2+4; })
        .attr("class","value")
        .text(builder.textFormat);
  }

  return builder;

};