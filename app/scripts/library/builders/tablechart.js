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
      noData = d3.charts.noData(),
      title = d3.charts.chartTitle(),
      categories,
      subcategories;

  builder.draw = function() {
    var empty = _.isEmpty(data);

    builder.setupSvg();
    builder.setupChart();
    builder.setupGraphic();
    empty ? builder.setupNoData() : builder.setupData();

    builder.drawTable();
    if (empty) { builder.drawNoData(); }
    if (config.svgArea) { builder.svgArea(); }
    if (config.titleOn) { builder.drawTitle(); }
    if (config.chartArea) { builder.chartArea(); }
    if (config.graphicArea) { builder.graphicArea(); }
  };

  builder.setupNoData = function() {
    // layers = [];
    // color.domain(['TBD']).range(['#E6E6E6']);
    // y.domain(_.map(_.range(7), function(d) {return ("Label - " + d)}));
    // legend.color(color);
  }

  builder.setupData = function() {
    categories = d3.utilities.uniqueProperties(data, 'category');
    subcategories = d3.utilities.uniqueProperties(data, 'subcategory');

    y.domain(categories).rangeRoundBands([0,builder.graphicHeight()], 0.2);
    x.domain(subcategories).rangeRoundBands([0,builder.graphicWidth()], 0.2);

    miniX.domain(d3.extent(data, function(d) { return d.date }));
    miniY.domain(d3.extent(data, function(d) { return d.value }));
    miniY.range([y.rangeBand(), 0]);
    miniX.range([0, x.rangeBand()]);
  }


  builder.drawNoData = function() {
    // noData.x((config.width - 300)/2).y(config.height/2 - 50);
    // builder.svg().call(noData);
  }

  builder.drawTitle = function() {
    title.title(config.title).subTitle(config.subtitle);
    title.x(builder.titleMarginLeft()).y(builder.titleMarginTop());
    builder.svg().call(title);
  }

  builder.drawTable = function() {
    builder.drawRowColumnLabels();
    builder.drawMiniCharts();
  }

  builder.drawMiniCharts = function() {
    _.each(categories, function(category) {
      _.each(subcategories, function(subcategory) {
        builder.drawMiniChart(category, subcategory)
      });
    });
  }

  builder.drawMiniChart = function(category, subcategory) {
    if (config.chartType === 'line') {
      builder.drawSparkline(category, subcategory);
    }
    else {
      alert('Chart type ' + config.chartType + ' not supported');
    }
  }

  var zoomSparkLine = function(d) {
    d3.select("#popup").remove();

    var height = 180,
        width = builder.graphicWidth(),
        zoomWidth = width + 160,
        zoomHeight = height + 60,
        zoomLine = d3.svg.line(),
        zoomX = d3.time.scale(),
        zoomY = d3.scale.linear(),
        extent = d3.extent(d, function(o) { return o.value }),
        current = _.last(d);

    zoomX.domain(miniX.domain()).range([0,width]);
    zoomY.domain(miniY.domain()).range([height,0]);

    zoomLine.interpolate("cardinal").tension(0.88)
        .x(function(d) { return zoomX(d.date); })
        .y(function(d) { return zoomY(d.value); });

    var zoom = builder.svg().append("g")
        .attr("transform", "translate(" + 0 + "," +  (builder.graphicHeight()/2 - 20) + ")")
        .attr("class", "zoom")
        .attr("id", "popup");

    zoom.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("rx", 8)
        .attr("height", zoomHeight)
        .attr("width", zoomWidth)
        .attr("fill", 'white')
        .attr("stroke", 'lightgray')
        .attr("stroke-width", '2px')

    var xAxis = d3.svg.axis();
    var yAxis = d3.svg.axis();
    var zoomChart = zoom.append("g")
        .attr("transform", "translate(" + 30 + "," +  30 + ")");

    xAxis.scale(zoomX).orient("bottom")
        .tickFormat(d3.utilities.customTimeFormat)
        .outerTickSize([0])
        .ticks(7);

    yAxis.scale(zoomY).orient("right").ticks(4);

    zoomChart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + zoomY(zoomY.domain()[0]) + ")")
        .call(xAxis);

    yAxis.tickSize(width);

    var gy = zoomChart.append("svg:g")
        .attr("class", "y axis")
        .call(yAxis)

    gy.selectAll("g").classed("gridline", true);
    gy.selectAll("text").attr("x", -14).attr("dy", -4);

    zoomChart.append("svg:path")
        .attr('class', 'line')
        .style("stroke", 'steelblue')
        .attr('stroke-width', '2px')
        .attr("d", zoomLine(d));

    zoomChart.append("circle")
        .attr("class", "circle")
        .style("fill", function(d) { return current.color; })
        .attr("stroke-width", '2')
        .attr("stroke", 'white')
        .attr("cx", function(d) { return zoomX(current.date); })
        .attr("cy", function(d) { return zoomY(current.value); })
        .attr("r", 6);

    var text = zoomChart.append("g")
        .attr("transform", "translate(" + (width + 35) + "," + 0 + ")");

    row(text, 0, 0, 'High', extent[1]);
    row(text, 0, 20, 'Low', extent[0]);
    row(text, 0, 40, 'Current', current.value);

    var close = zoom.append("g")
        .attr("transform", "translate(" + zoomWidth + "," + 0 + ")");

    close.append("circle")
        .attr("fill", 'red')
        .attr('r', '6')
        .on('click', function() {
          zoom.remove();
        })
  }

  var row = function(el, x, y, text1, text2) {
    el.append("text").attr("x", x).attr("y", y)
      .append("tspan")
        .text(text1)
      .append("tspan")
        .attr("x", 50)
        .text(text2);
  }

  builder.drawSparkline = function(category, subcategory) {
    var subData = (builder.organizeData(category, subcategory)),
        lastData = _.last(subData);

    var focus = builder.graphic().append("g")
        .attr("class", "mini-chart")
        .attr("transform", "translate(" + x(subcategory) + "," + y(category) + ")")

    line.interpolate("cardinal").tension(0.88)
        .x(function(d) { return miniX(d.date); })
        .y(function(d) { return miniY(d.value); });

    focus.append("rect")
        // .attr('stroke', 'grey')
        .attr('fill', '#EDEDED') //TODO to make click bind easier
        .attr('height', y.rangeBand())
        .attr('width', x.rangeBand())
        .on("click", function(d) {zoomSparkLine(subData)});

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

  builder.organizeData = function(category, subcategory) {
    return _.select(data, function(d) { return d.category === category && d.subcategory === subcategory});
  }

  builder.drawRowColumnLabels = function() {
    var columns = builder.svg().append("g")
        .attr("class", "top-nav")
        .attr("transform", "translate(" + builder.graphicMarginLeft() + "," + builder.marginTop() + ")")

    var rows = builder.svg().append("g")
        .attr("class", "left-nav")
        .attr("transform", "translate(" + builder.marginLeft() + "," + builder.graphicMarginTop() + ")")

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

    var rowLabel = rows.selectAll("g.left-nav .text").data(y.domain());
    rowLabel.enter().append("svg:foreignObject").attr("class", "text").append("xhtml:div")
        .attr("class", "row-label ") //+ rowFont)
      .append("xhtml:div")
        .html(function(schema) {return schema;});;
    rowLabel
        .attr("width",  168)
        .attr("height", y.rangeBand())
        .attr("x", 0)
        .attr("y", function(d) {return y(d)})
        .attr("style", "line-height:"+y.rangeBand()+"px")
    rowLabel.exit().remove();
  }

  return builder;

};