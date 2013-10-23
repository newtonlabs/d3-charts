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
    titleMargin = {top: 30},
    dataRadius = 4,
    svg = {},
    titleText = "TIME SERIES CHART EXAMPLE",
    subTitleText = "Subtext as needed",
    dataPoints = false;

  function my(selection) {
    var target;
    var hasTarget = function(){
      return typeof(target) !== 'undefined';
    }

    var chartWidth   = width  - margin.left - margin.right,
        chartHeight  = height - (margin.top + titleMargin.top)  - margin.bottom,
        chartHeight2 = controlHeight,
        x  = d3.time.scale().range([0, chartWidth]),
        x2 = d3.time.scale().range([0, chartWidth]),
        y  = d3.scale.linear().range([chartHeight, 0]),
        y2 = d3.scale.linear().range([chartHeight2, 0]),
        xAxis  = d3.svg.axis().scale(x).orient("top").tickFormat(d3.utilities.customTimeFormat).outerTickSize([0]).ticks(8),
        xAxis2 = d3.svg.axis().scale(x2).orient("bottom").tickFormat(d3.utilities.customTimeFormat).outerTickSize([0]).ticks(12),
        yAxis  = d3.svg.axis().scale(y).orient("right").ticks(10),
        title  = d3.charts.chartTitle().title(titleText).subTitle(subTitleText);

    selection.each(function(data) {
      var lowerDomain = d3.min(data, function(d) { return d3.min(d.data, function(c) {return c.value; }); });
      var upperDomain = d3.max(data, function(d) { return d3.max(d.data, function(c) {return c.value; }); });
      var topPadding = d3.utilities.padDomain(y.range()[0], upperDomain, 0);
      var bottomPadding = d3.utilities.padDomain(y.range()[0], upperDomain, 60);
      var series  = _.reduce(data, function(memo, d) {memo.push(d.series); return memo;},[])
      var color   = d3.scale.ordinal().domain(series).range(d3.utilities.colorWheel);
      var legend  = d3.charts.legend().color(color);

      lowerDomain = lowerDomain - bottomPadding;
      upperDomain = upperDomain + topPadding;

      x.domain(d3.extent(data[0].data, function(d) { return d.date; }));
      y.domain([lowerDomain, upperDomain + topPadding + bottomPadding]);
      x2.domain(x.domain());
      y2.domain(y.domain());

      var line = d3.svg.line().interpolate("cardinal")
          .x(function(d) { return x(d.date); })
          .y(function(d) { return y(d.value); });

      var line2 = d3.svg.line().interpolate("cardinal")
          .x(function(d) { return x2(d.date); })
          .y(function(d) { return y2(d.value); });

      svg = d3.select(this).append("svg")
          .attr("class", "timeseries")  //for namespacing css
          .attr("width",  chartWidth  + margin.left + margin.right)
          .attr("height", chartHeight + (margin.top + titleMargin.top)  + margin.bottom);

      title.x(margin.left).y(margin.top);
      svg.call(title);

      // Create the main chart
      svg.append("defs").append("clipPath")
          .attr("id", "clip")
          .append("rect")
          .attr("width", chartWidth)
          .attr("height", chartHeight);

      var focus = svg.append("g")
          .attr("class", "chart1")
          .attr("transform", "translate(" + margin.left + "," + (margin.top + titleMargin.top) + ")");

      // xAxis
      focus.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + y(lowerDomain) + ")")
          .call(xAxis);

      // yAxis with huge ticks for gridlines
      yAxis.tickSize(chartWidth);

      var gy = focus.append("svg:g")
          .attr("class", "y axis")
          .attr("data", "blah")
          .call(yAxis)

      gy.selectAll("g").classed("gridline", true);
      gy.selectAll("text").attr("x", 4).attr("dy", -4);
      var zero = gy.selectAll("text").filter(function(d) { return d == 0; } );
      if (! _.isEmpty(zero)) {d3.select(zero[0][0].previousSibling).attr("class", "zeroline"); }

      // Gray zero line
      // if (lowerDomain < 0) {
      //   var zeroLine = y(0),
      //     bottomLine = y(lowerDomain);

      //   focus.append("rect")
      //       .attr("class", "zeroline")
      //       .attr("x", 0)
      //       .attr("y", zeroLine)
      //       .attr("height", bottomLine - zeroLine)
      //       .attr("width", chartWidth)
      // }

      // Target line stuff
      if (typeof(data[0].data[0].target) !== 'undefined') {
        target = Number(data[0].data[0].target);
      }

      if (hasTarget()) {
        focus.append("line")
            .attr("class", "target")
            .attr("x1", 0)
            .attr("y1", y(target))
            .attr("x2", chartWidth)
            .attr("y2", y(target));
      }

      // Draw lines on the chart
      var chart = focus.append("g")
          .attr("class", "chart");

      chart.selectAll("path").data(data).enter().append("path")
          .attr("clip-path", "url(#clip)")
          .attr("class", "line")
          .style("stroke", function(d) {return color(d.series)})
          .style("stroke-width", "2px")
          .attr("series", function(d) {return d.series})
          .attr("d", function(d) {return line(d.data); })

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

      // Draw the controls
      var context = svg.append("g")
          .attr("class", "chart2")
          .attr("transform", "translate(" + margin.left + "," + (chartHeight + margin.top + titleMargin.top)  + ")");

      var brushing = function() {
        x.domain(brush.empty() ? x2.domain() : brush.extent());
        var dataInDomain = _.filter(data[0].data, function(d) {
          return (d.date >= x.domain()[0] && d.date <= x.domain()[1])
        })

        focus.selectAll("g.chart path").data(data).attr("d", function(d) {return line(d.data);});
        focus.selectAll("circle").data(_.flatten(data, 'data'))
            .attr("cx", function(d) { return x(d.date); })
            .attr("cy", function(d) { return y(d.value); });

        focus.select(".x.axis").call(xAxis);
      }

      var brush = d3.svg.brush().x(x2)
          .on("brush", brushing);

      context.selectAll("path").data(data).enter().append("path")
          .attr("class", "minor line")
          .style("stroke-width", "1px")
          .attr("d", function(d) {return line2(d.data); })

      context.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + chartHeight2 + ")")
          .call(xAxis2);

      var brushStart = x2.domain()[0];
      var brushEnd   = new Date();
      brush.extent([x2.domain()[0], x2.domain()[1]]);

      var gBrush = context.append("g")
          .attr("class", "x brush")
          .call(brush)

      gBrush.selectAll("rect").attr("height", chartHeight2);
      gBrush.selectAll(".resize").append("path").attr("d",function(d) {
        return d3.utilities.resizeHandles(d, chartHeight2)
      });

      var highlight = function(series) {
        var selection = "g.chart1 [series=\"" + series + "\"]";
        var highlight = focus.select(selection);
        var style = highlight.style("stroke-width") == "2px" ? "10px" : "2px";
        highlight.transition().style("stroke-width", style);
      }

      // Build the legend
      legend
          .click(highlight)
          .y(titleMargin.top)
          .x(chartWidth + 30);

      svg.datum(series).call(legend);
    });
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
};
