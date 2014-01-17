if (d3.charts === null || typeof(d3.charts) !== 'object') { d3.charts = {}; }

d3.charts.timeseriesBuilder = function(selection, data, config) {
  'use strict';

  var builder = d3.charts.baseBuilder(selection, data, config),
      legend = d3.charts.legend(),
      x = d3.time.scale(),
      x2 = d3.time.scale(),
      y = d3.scale.linear(),
      y2 = d3.scale.linear(),
      color = d3.scale.ordinal(),
      brush = d3.svg.brush(),
      xAxis = d3.svg.axis(),
      xAxis2 = d3.svg.axis(),
      yAxis = d3.svg.axis(),
      line = d3.svg.line(),
      line2 = d3.svg.line(),
      handlePadding = 8,
      clipUrl = "clip-"+d3.utilities.s4(),
      series,
      focus;

  builder.draw = function() {
    var empty = _.isEmpty(data);

    if (config.zoomOff) { turnOffZoom(); }

    builder.setupSvg();
    builder.setupChart();
    builder.setupGraphic();
    setupClip();

    if (config.titleOn) { builder.drawTitle(); }
    if (empty) { builder.drawNoDataLabel(); return;}

    setupData();
    drawChart();
    if (!config.zoomOff) { drawControls() };
    if (config.legend) { drawLegend(); }
    if (config.svgArea) { builder.svgArea(); }
    if (config.chartArea) { builder.chartArea(); }
    if (config.graphicArea) { builder.graphicArea(); }
  };

  var setupClip = function() {
    builder.svg().append("defs").append("clipPath")
        .attr("id", clipUrl)
        .append("rect")
        .attr("width", builder.graphicWidth())
        .attr("height", builder.graphicHeight());
  }

  var turnOffZoom = function() {
    config.bottomLabels = false;
  }

  // var stubNoData = function() {
  //   config.legend = false;
  //   var today   = new Date();
  //   var yearAgo = new Date();
  //   yearAgo.setDate(today.getDate() - 365);

  //   data = [{data: [{date: yearAgo, value:0}], series: 'TBD'}];

  //   _.each(_.range(365), function(i) {
  //     var date = new Date();
  //     date.setDate(yearAgo.getDate() + i);
  //     data[0].data.push({date: date, value: 0});
  //   })
  // }

  var setupData = function() {
    x.range([0, builder.graphicWidth()]);
    y.range([builder.graphicHeight(), 0]);
    xAxis.scale(x).orient("top").tickFormat(d3.utilities.customTimeFormat).outerTickSize([0]).ticks(8);
    yAxis.scale(y).orient("right").ticks(10);

    var lowerDomain = d3.min(data, function(d) { return d3.min(d.data, function(c) {return c.value; }); }),
    upperDomain = d3.max(data, function(d) { return d3.max(d.data, function(c) {return c.value; }); }),
    topPadding = d3.utilities.padDomain(y.range()[0], upperDomain, 30),
    bottomPadding = d3.utilities.padDomain(y.range()[0], upperDomain, 50);

    // Define globals based on data
    series = _.reduce(data, function(memo, d) {memo.push(d.series); return memo;},[]);
    var paddedLowerDomain = lowerDomain - bottomPadding;
    var paddedUpperDomain = upperDomain + topPadding;

    // Setup Functions with data
    color.domain(series).range(d3.utilities.colorWheel);
    legend.color(color);
    x.domain(d3.extent(
        _.flatten(data, function(d) { return d.data; }),
        function(d) { return d.date; }));

    // Add one minute to prevent infinite range errors if all the
    var endTime =  new Date(x.domain()[1].getTime() + 1*60000);
    x.domain([x.domain()[0], endTime]);
    y.domain([paddedLowerDomain, paddedUpperDomain]);
    x2.domain(x.domain());
    y2.domain([paddedLowerDomain, paddedUpperDomain]);
    line.interpolate("cardinal").tension(0.70)
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.value); });
    line2.interpolate("cardinal").tension(0.70)
        .x(function(d) { return x2(d.date); })
        .y(function(d) { return y2(d.value); });
  }

  var drawChart = function() {
    focus = builder.svg().append("g")
        .attr("class", "chart1")
        .attr("transform", "translate(" + builder.graphicMarginLeft() + "," + builder.graphicMarginTop() + ")");

    // xAxis
    focus.append("g")
        .attr("class", "x axis number")
        .attr("transform", "translate(0," + y(y.domain()[0]) + ")")
        .call(xAxis);

    // yAxis with huge ticks for gridlines
    yAxis.tickSize(builder.graphicWidth());

    var gy = focus.append("svg:g")
        .attr("class", "y axis number")
        .call(yAxis);

    gy.selectAll("g").classed("gridline", true);
    gy.selectAll("text").attr("x", 4).attr("dy", -4);

    // Draw lines on the chart
    var chart = focus.append("g")
        .attr("class", "chart");

    chart.selectAll("path").data(data).enter().append("path")
        .attr("clip-path", "url(#"+clipUrl+")")
        .attr("class", "line")
        .style("stroke", function(d) {return color(d.series)})
        .style("stroke-width", "2px")
        .attr("series", function(d) {return d.series})
        .attr("d", function(d,i) {return line(d.data); })

    if (config.dataPoints) {
      chart.selectAll("circle")
          .data(_.flatten(data, 'data')).enter().append("circle")
          .attr("class", "circle")
          .attr("clip-path", "url(#clip)")
          .style("stroke", function(d) { return d.color; })
          .attr("cx", function(d) { return x(d.date); })
          .attr("cy", function(d) { return y(d.value); })
          .attr("r", dataRadius);
    }
  }

  var brushing = function() {
    x.domain(brush.empty() ? x2.domain() : brush.extent());

    focus.selectAll("g.chart path").data(data).attr("d", function(d) {return line(d.data);});
    focus.selectAll("circle").data(_.flatten(data, 'data'))
        .attr("cx", function(d) { return x(d.date); })
        .attr("cy", function(d) { return y(d.value); });

    focus.select(".x.axis").call(xAxis);
  }

  var drawControls = function() {
    console.log('height', builder.graphicHeight());
    var controlHeight = builder.bottomLabel() - 13;
    var context = builder.svg().append("g")
        .attr("class", "chart2")
        .attr("transform", "translate(" + (builder.graphicMarginLeft() + handlePadding) + "," + (builder.graphicMarginTop() + builder.graphicHeight()) + ")");

    y2.range([controlHeight, 0]);
    x2.range([0, builder.graphicWidth() - (handlePadding*2)]);
    xAxis2.scale(x2)
        .orient("bottom")
        .tickFormat(d3.utilities.customTimeFormat)
        .outerTickSize([0])
        .tickSize(2)
        .tickPadding(0)
        .ticks(12);

    brush.x(x2).on("brush", brushing);

    context.selectAll("path").data(data).enter().append("path")
        .attr("class", "minor line")
        .style("stroke-width", "1px")
        .attr("d", function(d) {return line2(d.data); })

    context.append("g")
        .attr("class", "x axis number")
        .attr("transform", "translate(0," + controlHeight  + ")")
        .call(xAxis2);

    var brushStart = x2.domain()[0];
    var brushEnd   = new Date();
    brush.extent([x2.domain()[0], x2.domain()[1]]);

    var gBrush = context.append("g")
        .attr("class", "x brush")
        .call(brush)

    gBrush.selectAll("rect").attr("height", controlHeight);
    gBrush.selectAll(".resize").append("path").attr("d",function(d) {
      return d3.utilities.resizeHandles(d, controlHeight);
    });
  }

  var highlight = function(series) {
    var selection = "g.chart1 [series=\"" + series + "\"]";
    var highlight = focus.select(selection);
    var style = highlight.style("stroke-width") == "2px" ? "10px" : "2px";
    highlight.transition().style("stroke-width", style);
  }

  var drawLegend = function() {
    legend.click(highlight).y(builder.legendMarginTop()).x(builder.legendMarginLeft());
    builder.svg().datum(series).call(legend);
  }

  return builder;
};