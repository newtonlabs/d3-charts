if (d3.charts === null || typeof(d3.charts) !== 'object') { d3.charts = {}; }

d3.charts.tablechartBuilder = function(selection, data, config) {
  'use strict';

  var builder = d3.charts.baseBuilder(selection, data, config),
      x = d3.scale.ordinal(),
      y = d3.scale.ordinal(),
      miniX = d3.time.scale(),
      miniY = d3.scale.linear(),
      line = d3.svg.line(),
      legend = d3.charts.legend(),
      categories,
      subcategories;

  builder.draw = function() {
    var empty = _.isEmpty(data);

    builder.setupSvg();
    builder.setupChart();
    builder.setupGraphic();
    empty ? setupNoData() : setupData();

    drawTable();

    if (empty) { builder.drawNoDataLabel(); }
    if (config.svgArea) { builder.svgArea(); }
    if (config.titleOn) { builder.drawTitle(); }
    if (config.chartArea) { builder.chartArea(); }
    if (config.graphicArea) { builder.graphicArea(); }
  };

  // TODO: If even necessary, no requests for no table tablechart
  var setupNoData = function() {
  }

  var setupData = function() {
    categories = d3.utilities.uniqueProperties(data, 'category');
    subcategories = d3.utilities.uniqueProperties(data, 'subcategory');

    y.domain(categories).rangeRoundBands([0,builder.graphicHeight()], 0.2, 0);
    x.domain(subcategories).rangeRoundBands([0,builder.graphicWidth()], 0.2, 0);

    miniX.domain(d3.extent(data, function(d) { return d.date }));
    miniY.domain(d3.extent(data, function(d) { return d.value }));
    miniY.range([y.rangeBand(), 0]);
    miniX.range([0, x.rangeBand()]);
  }

  var drawTable = function() {
    drawRowColumnLabels();
    drawMiniCharts();
  }

  var drawMiniCharts = function() {
    _.each(categories, function(category) {
      _.each(subcategories, function(subcategory) {
        drawMiniChart(category, subcategory)
      });
    });
  }

  var drawMiniChart = function(category, subcategory) {
    if (config.chartType === 'line') {
      drawSparkline(category, subcategory);
    }
    else {
      alert('Chart type ' + config.chartType + ' not supported');
    }
  }

  var drawZoomSparkLine = function(d) {
    d3.select("#popup").remove();

    var padding = 15,
        chartPadding = 32,
        height = builder.graphicHeight() - (padding * 2),
        width = builder.graphicWidth() - (padding * 2),
        zoomWidth = width - (chartPadding * 2),
        zoomHeight = height - (chartPadding * 2),
        zoomLine = d3.svg.line(),
        zoomX = d3.time.scale(),
        zoomY = d3.scale.linear(),
        extent = d3.extent(d, function(o) { return o.value }),
        current = _.last(d);


    var domainPadding = d3.utilities.padDomain(zoomHeight, miniY.domain()[1], 20);
    zoomX.domain(miniX.domain()).range([0,zoomWidth]);
    zoomY.domain([
            miniY.domain()[0] - domainPadding,
            miniY.domain()[1] + domainPadding])
        .range([zoomHeight,0]);

    zoomLine.interpolate("cardinal").tension(0.88)
        .x(function(d) { return zoomX(d.date); })
        .y(function(d) { return zoomY(d.value); });

    var zoom = builder.svg().append("g")
        .attr("transform", "translate(" + (builder.graphicMarginLeft() + padding) + "," +  (builder.graphicMarginTop() + padding) + ")")
        .attr("class", "zoom")
        .attr("id", "popup");

    zoom.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("rx", 8)
        .attr("height", height)
        .attr("width", width)
        .attr("fill", 'white')
        .attr("stroke", 'lightgray')
        .attr("stroke-width", '1px');

    var radius = 12;
    var close = zoom.append("g")
        .attr("transform", "translate(" + (width - radius - 18 ) + "," + (radius + 18)+ ")");

    var closeit = function() {
      zoom.remove();
    }

    close.append("circle")
        .attr("fill", 'white')
        .attr("stroke", '#cccccc')
        .attr('r', '15')
        .on('click', closeit)

    close.append('line').attr('fill', 'none').attr('stroke', '#cccccc').attr('stroke-width', 2).attr('x1',-5).attr('y1',-5).attr('x2',5).attr('y2',5).on('click', closeit)
    close.append('line').attr('fill', 'none').attr('stroke', '#cccccc').attr('stroke-width', 2).attr('x1',5).attr('y1',-5).attr('x2',-5).attr('y2',5).on('click', closeit)

    var zoomTitle = zoom.append("g")
        .attr("transform", "translate(" + padding + "," + (padding + 10) + ")");

    zoomTitle.append("text")
        .attr("class", "zoom-title")
        .text(d[0].category + " - " + d[1].subcategory);

    var xAxis = d3.svg.axis();
    var yAxis = d3.svg.axis();
    var zoomChart = zoom.append("g")
        .attr("transform", "translate(" + chartPadding + "," +  chartPadding + ")");

    xAxis.scale(zoomX).orient("bottom")
        .tickFormat(d3.utilities.customTimeFormat)
        .outerTickSize([0])
        .ticks(10);

    yAxis.scale(zoomY).orient("right").ticks(4);

    zoomChart.append("g")
        .attr("class", "x axis number")
        .attr("transform", "translate(0," + zoomY(zoomY.domain()[0]) + ")")
        .call(xAxis);

    yAxis.tickSize(zoomWidth);

    var gy = zoomChart.append("svg:g")
        .attr("class", "y axis number")
        .call(yAxis)

    gy.selectAll("g").classed("gridline", true);
    gy.selectAll("text").attr("x", -14).attr("dy", -4);

    zoomChart.append("svg:path")
        .attr('class', 'line')
        .style("stroke", 'steelblue')
        .attr('stroke-width', '2px')
        .attr("d", zoomLine(d));

    var currentPoint = zoomChart.append('g')
        .attr("class", "large-label")
        .attr("transform", "translate(" +  zoomX(current.date) + "," +  zoomY(current.value) + ")");

    currentPoint.append("circle")
        .attr("class", "circle")
        .style("fill", function(d) { return current.color; })
        .attr("stroke-width", '2')
        .attr("stroke", 'white')
        .attr("r", 18);

    currentPoint.append('text')
        .attr('stroke', 'white')
        .attr('fill', 'white')
        .attr('text-anchor', 'middle')
        .attr('dy', 6)
        .attr('class', 'current-value')
        .text(current.value);

    zoomChart.append('line')
      .attr('stroke', current.color)
      .attr('x1', zoomX.range()[0])
      .attr('y1', zoomY(current.target))
      .attr('x2', zoomX.range()[1])
      .attr('y2', zoomY(current.target));
  }

  var row = function(el, x, y, text1, text2) {
    el.append("text").attr("x", x).attr("y", y)
      .append("tspan")
        .text(text1)
      .append("tspan")
        .attr("x", 50)
        .text(text2);
  }

  var drawSparkline = function(category, subcategory) {
    var subData = (organizeData(category, subcategory)),
        lastData = _.last(subData);

    var focus = builder.graphic().append("g")
        .attr("class", "mini-chart")
        .attr("transform", "translate(" + x(subcategory) + "," + y(category) + ")")

    line.interpolate("cardinal").tension(0.88)
        .x(function(d) { return miniX(d.date); })
        .y(function(d) { return miniY(d.value); });

    focus.append("rect")
        .attr('fill', '#EDEDED') //TODO to make click bind easier
        .attr('height', y.rangeBand())
        .attr('width', x.rangeBand())
        .on("click", function(d) {drawZoomSparkLine(subData)});

    focus.append("svg:path")
        .attr('class', 'line')
        .style("stroke", 'steelblue')
        .attr("d", line(subData));

    if (!_.isEmpty(lastData)) {
      focus.append("circle")
          .attr("class", "circle")
          .style("fill", function(d) { return lastData.color; })
          .attr("cx", function(d) { return miniX(lastData.date); })
          .attr("cy", function(d) { return miniY(lastData.value); })
          .attr("r", 3);
    }
  }

  var organizeData = function(category, subcategory) {
    return _.select(data, function(d) { return d.category === category && d.subcategory === subcategory});
  }

  var drawRowColumnLabels = function() {
    var columns = builder.svg().append("g")
        .attr("class", "top-nav")
        .attr("transform", "translate(" + builder.graphicMarginLeft() + "," + builder.marginTop() + ")")

    var rows = builder.svg().append("g")
        .attr("class", "left-nav")
        .attr("transform", "translate(" + builder.marginLeft() + "," + builder.graphicMarginTop() + ")")

    if (config.topLabels) {
      var columnLabel = columns.selectAll("g.top-nav .text").data(x.domain());
      columnLabel.enter().append("svg:foreignObject").attr("class", "text").append("xhtml:div")
          .attr("class", "column-label ")// + columnFont)
          .attr("style", "height:" + config.margin.topLabel  + "px; width:" +x.rangeBand()+ "px;")
        .append("xhtml:div")
          .html(function(schema) {return schema;});;
      columnLabel
          .attr("width",  x.rangeBand())
          .attr("height", config.margin.topLabel)
          .attr("x", function(d) {return x(d)})
          .attr("y", 0)
      columnLabel.exit().remove();
    }

    if (config.leftLabels) {
      var rowLabel = rows.selectAll("g.left-nav .text").data(y.domain());
      rowLabel.enter().append("svg:foreignObject").attr("class", "text").append("xhtml:div")
          .attr("class", "row-label ") //+ rowFont)
        .append("xhtml:div")
          .html(function(schema) {return schema;});;
      rowLabel
          // TODO remove hard code 168
          .attr("width",  168)
          .attr("height", y.rangeBand())
          .attr("x", 0)
          .attr("y", function(d) {return y(d)})
          .attr("style", "line-height:"+y.rangeBand()+"px")
      rowLabel.exit().remove();
    }
  }

  return builder;
};