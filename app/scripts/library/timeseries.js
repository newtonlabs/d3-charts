/*jslint browser: true*/
/*global $, jQuery, d3, _*/

if (d3.charts === null || typeof(d3.charts) !== "object") { d3.charts = {}; }

// Based on http://bost.ocks.org/mike/chart/
this.d3.charts.timeseries = function() {
 'use strict';

  var width = 1024,
    height = 500,
    controlHeight = 50,
    xAxisHeight = 30,
    margin = {top: 10,  right: 168, bottom: 70, left: 16},
    titleMargin = {top: 40},
    dataRadius = 4,
    svg = {},
    titleText = "TIME SERIES CHART EXAMPLE",
    subTitleText = "Subtext as needed",
    topDomainPadding = 30,
    dataPoints = false;

  function my(selection) {
    var chartWidth,
        chartHeight,
        series,
        focus,
        context,
        brushing,
        x  = d3.time.scale(),
        x2 = d3.time.scale(),
        y  = d3.scale.linear(),
        y2 = d3.scale.linear(),
        color  = d3.scale.ordinal(),
        legend = d3.charts.legend(),
        title  = d3.charts.chartTitle(),
        noData = d3.charts.noData(),
        brush  = d3.svg.brush(),
        xAxis  = d3.svg.axis(),
        xAxis2 = d3.svg.axis(),
        yAxis  = d3.svg.axis(),
        line   = d3.svg.line(),
        line2  = d3.svg.line();

    var hasTarget = function(){
      return typeof(target) !== 'undefined';
    }

    var initializeDimensions = function(selection) {
      chartWidth   = width  - margin.left - margin.right,
      chartHeight  = height - (margin.top + titleMargin.top)  - margin.bottom,
      x.range([0, chartWidth]),
      x2.range([0, chartWidth]),
      y.range([chartHeight, 0]),
      y2.range([controlHeight, 0]),
      xAxis.scale(x).orient("top").tickFormat(d3.utilities.customTimeFormat).outerTickSize([0]).ticks(8),
      xAxis2.scale(x2).orient("bottom").tickFormat(d3.utilities.customTimeFormat).outerTickSize([0]).ticks(12),
      yAxis.scale(y).orient("right").ticks(10),
      title.title(titleText).subTitle(subTitleText);

      svg = d3.select(selection).append("svg")
          .attr("class", "timeseries")  //for namespacing css
          .attr("width",  chartWidth  + margin.left + margin.right)
          .attr("height", chartHeight + (margin.top + titleMargin.top)  + margin.bottom);

      svg.append("defs").append("clipPath")
          .attr("id", "clip")
          .append("rect")
          .attr("width", chartWidth)
          .attr("height", chartHeight);
    }

    var initializeWithOutData = function() {
      var today   = new Date();
      var yearAgo = new Date();
      yearAgo.setDate(today.getDate() - 365);

      series = ['TBD'];
      color.domain([]).range(['#E6E6E6']);
      legend.color(color);
      x.domain([today, yearAgo]);
      y.domain(d3.extent(_.range(100)));
      x2.domain(x.domain());
      y2.domain(y.domain());
    }

    var initializeWithData = function(data) {
      var lowerDomain = d3.min(data, function(d) { return d3.min(d.data, function(c) {return c.value; }); }),
          upperDomain = d3.max(data, function(d) { return d3.max(d.data, function(c) {return c.value; }); }),
          topPadding    = d3.utilities.padDomain(y.range()[0], upperDomain, 30),
          bottomPadding = d3.utilities.padDomain(y.range()[0], upperDomain, 50);

      // Define globals based on data
      series  = _.reduce(data, function(memo, d) {memo.push(d.series); return memo;},[]);
      lowerDomain = lowerDomain - bottomPadding;
      upperDomain = upperDomain + topPadding;

      // Setup Functions with data
      color.domain(series).range(d3.utilities.colorWheel);
      legend.color(color);

      x.domain(d3.extent(
          _.flatten(data, function(d) { return d.data; }),
          function(d) { return d.date; }));

      // Add one minute to prevent infinite range errors if all the
      var endTime =  new Date(x.domain()[1].getTime() + 1*60000)
      x.domain([x.domain()[0], endTime])

      y.domain([lowerDomain, upperDomain]);
      x2.domain(x.domain());
      y2.domain(y.domain());
      line.interpolate("cardinal").tension(0.88)
          .x(function(d) { return x(d.date); })
          .y(function(d) { return y(d.value); });
      line2.interpolate("cardinal").tension(0.88)
          .x(function(d) { return x2(d.date); })
          .y(function(d) { return y2(d.value); });
    }

    var drawChart = function(data) {
      focus = svg.append("g")
          .attr("class", "chart1")
          .attr("transform", "translate(" + margin.left + "," + (margin.top + titleMargin.top) + ")");

      // xAxis
      focus.append("g")
          .attr("class", "x axis number")
          .attr("transform", "translate(0," + y(y.domain()[0]) + ")")
          .call(xAxis);

      // yAxis with huge ticks for gridlines
      yAxis.tickSize(chartWidth);

      var gy = focus.append("svg:g")
          .attr("class", "y axis number")
          .call(yAxis)

      gy.selectAll("g").classed("gridline", true);
      gy.selectAll("text").attr("x", 4).attr("dy", -4);
      // var zero = gy.selectAll("text").filter(function(d) { return d == 0; } );
      // if (! _.isEmpty(zero)) {d3.select(zero[0][0].previousSibling).attr("class", "zeroline"); }

      // Target line stuff
      // if (typeof(data[0].data[0].target) !== 'undefined') {
      //   target = Number(data[0].data[0].target);
      // }

      // if (hasTarget()) {
      //   focus.append("line")
      //       .attr("class", "target")
      //       .attr("x1", 0)
      //       .attr("y1", y(target))
      //       .attr("x2", chartWidth)
      //       .attr("y2", y(target));
      // }

      // Draw lines on the chart
      var chart = focus.append("g")
          .attr("class", "chart");

      chart.selectAll("path").data(data).enter().append("path")
          .attr("clip-path", "url(#clip)")
          .attr("class", "line")
          .style("stroke", function(d) {return color(d.series)})
          .style("stroke-width", "2px")
          .attr("series", function(d) {return d.series})
          .attr("d", function(d,i) {return line(d.data); })

      if (dataPoints) {
        chart.selectAll("circle")
            .data(_.flatten(data, 'data')).enter().append("circle")
            .attr("class", "circle")
            .attr("clip-path", "url(#clip)")
            .style("stroke", function(d) { return d.color; })
            .attr("cx", function(d) { return x(d.date); })
            .attr("cy", function(d) { return y(d.value); })
            .attr("r", dataRadius);
      }
      // Defined here so data is in the clojure
      brushing = function() {
        x.domain(brush.empty() ? x2.domain() : brush.extent());

        focus.selectAll("g.chart path").data(data).attr("d", function(d) {return line(d.data);});
        focus.selectAll("circle").data(_.flatten(data, 'data'))
            .attr("cx", function(d) { return x(d.date); })
            .attr("cy", function(d) { return y(d.value); });

        focus.select(".x.axis").call(xAxis);
      }
      drawControls(brushing,data);
    }

    var drawNoData = function() {
      noData.x((chartWidth -300)/2).y(chartHeight/2);
      svg.call(noData);
    }

    var drawControls = function(brushing, data) {
      context = svg.append("g")
          .attr("class", "chart2")
          .attr("transform", "translate(" + margin.left + "," + (chartHeight + margin.top + titleMargin.top)  + ")");

      brush.x(x2).on("brush", brushing);

      context.selectAll("path").data(data).enter().append("path")
          .attr("class", "minor line")
          .style("stroke-width", "1px")
          .attr("d", function(d) {return line2(d.data); })

      context.append("g")
          .attr("class", "x axis number")
          .attr("transform", "translate(0," + controlHeight + ")")
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

    var drawLegend = function() {

      var highlight = function(series) {
        var selection = "g.chart1 [series=\"" + series + "\"]";
        var highlight = focus.select(selection);
        var style = highlight.style("stroke-width") == "2px" ? "10px" : "2px";
        highlight.transition().style("stroke-width", style);
      }

      legend
          .click(highlight)
          .y(margin.top + titleMargin.top)
          .x(chartWidth + 30);
      svg.datum(series).call(legend);
    }

    var drawTitle = function() {
      title.x(margin.left).y(margin.top);
      svg.call(title);
    }

    var initialize = function(selection, data) {
      initializeDimensions(selection);

      if (_.isEmpty(data)) {
        initializeWithOutData();
      } else {
        initializeWithData(data);
      }
    }

    selection.each(function(data) {
      initialize(this, data);
      drawChart(data);
      drawTitle();
      drawLegend();
      if (_.isEmpty(data)) { drawNoData();}
    })
  }

   // Getters and Setters
  my.width = function(value) {
    if (!arguments.length) { return width; }
    width = value;
    return my;
  };

  my.height = function(value) {
    if (!arguments.length) { return height; }
    height = value;
    return my;
  };

  my.title = function(value) {
    if (!arguments.length) { return titleText; }
    titleText = value;
    return my;
  };

  my.subtitle = function(value) {
    if (!arguments.length) { return subTitleText; }
    subTitleText = value;
    return my;
  };

  my.svg = function() {
    return svg;
  };

  my.dataPoints = function(value) {
    if (!arguments.length) { return dataPoints; }
    dataPoints = value;
    return my;
  }

  return my;
}