/*jslint browser: true*/
/*global $, jQuery, d3, _*/

if (d3.charts === null || typeof(d3.charts) !== "object") { d3.charts = {}; }

// Based on http://bost.ocks.org/mike/chart/
this.d3.charts.heatmap = function() {
 'use strict';

  var width = 960,
    height = 400,
    controlHeight = 50,
    svg = {},
    margin = { top: 160, right: 10, bottom: 10, left: 200 };

  function my(selection) {
    var chartWidth    = width  - margin.left - margin.right,
        chartHeight   = height - margin.top  - margin.bottom,
        chartHeight2  = controlHeight,
        x  = d3.scale.ordinal().rangeRoundBands([0, chartWidth], 0, 0),
        x2 = d3.scale.ordinal().rangeRoundBands([0, chartWidth], 0.2, 0.2),
        y  = d3.scale.ordinal().rangeRoundBands([0, chartHeight], 0, 0),
        yAxis = d3.svg.axis().scale(y).orient("left"),
        xAxis = d3.svg.axis().scale(x).orient("top"),
        xAxis2   = d3.svg.axis().scale(x2).orient("top").tickSize([0]),
        invertx2 = d3.scale.quantize().domain([0, chartWidth]), //TODO use invert function
        heatmap = {},
        top = {},
        left = {},
        brush = d3.svg.brush().x(x2);

    var replaceAxis = function(heatmap) {
      heatmap.select(".y.axis")
        .selectAll("g")
          .append("svg:foreignObject")
              .attr("width",'150px')
              .attr("height",'40px')
              .attr("class", "htmlaxis")
              .attr("x", -160)
              .attr("y", -20)
              .attr("style","text-align: right;")
          .append("xhtml:div")
              .html(function(schema) {return schema;});

      heatmap.selectAll(".y.axis g text").remove();
    }

    var drawHeatmap = function(data) {
      // Update domains with newest data set
      x.domain(d3.utilities.uniqueProperties(data, 'xAxis'));
      y.domain(d3.utilities.uniqueProperties(data, 'yAxis'));

      // Enter, Update, Exit squares
      var rect  = heatmap.selectAll("g.heatmap .square").data(data);
      rect.enter().append("rect")
        .attr("class", "square")
        .attr("style", function(d) {return "fill:"+d.color; });
      rect
        .transition()
        .attr("x", function(d) { return x(d.xAxis);})
        .attr("y", function(d) { return y(d.yAxis);})
        .attr("rx", 0)
        .attr("ry", 0)
        .attr("width", x.rangeBand())
        .attr("height", y.rangeBand())
        .style("fill", function(d) {return d.color;});
      rect.exit().remove();

      // Enter, Update, Exit text values
      var value = heatmap.selectAll("g.heatmap .cell.value").data(data);
      value.enter().append("text");
      value
        .attr("text-anchor", "middle")
        .attr("x", function(d) { return x(d.xAxis);})
        .attr("y", function(d) { return y(d.yAxis);})
        .attr("dy", function() { return y.rangeBand()/2 + 4;})
        .attr("dx", function() { return x.rangeBand()/2;})
        .attr('class', 'cell value')
        .text(function(d) {return d.value;} );
      value.exit().remove();

      // Weird Enter, Update, Exit for Axis for HTML elements
      beautify();
      // heatmap.selectAll(".y.axis g .htmlaxis").remove();
      // heatmap.select(".y.axis").transition().call(yAxis);
      // heatmap.select(".x.axis").transition().call(xAxis);
      // replaceAxis(heatmap);
    };

    var drawControls = function(svg, brush) {
      // Brush controls
      var control = svg.append("g")
        .attr("class", "timeline")
        .attr("transform", "translate(" + margin.left + "," + 40  + ")");

      control.append("rect")
        .attr("height", chartHeight2)
        .attr("width",  chartWidth);

      control.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + chartHeight2 * 0.66 + ")")
        .call(xAxis2);

      control.append("g")
        .attr("class", "x brush")
        .call(brush)
        .call(brush.event)
        .selectAll("rect")
        .attr("y", 0)
        .attr("height", chartHeight2);
    }

    var setMetaData = function(meta, clicked) {
      var category = meta.selectAll('category').data([clicked]);
      category.enter().append("category");
      category.text(function(d) { return d;});
    }

    var beautify = function() {
      // Top Bar
      top.attr("transform", "translate(" + margin.left + "," + (margin.top - y.rangeBand()) + ")")

      var topBar = top.selectAll("g.top-nav .top").data(x.domain());

      topBar.enter().append("rect").attr("class", "top")

      topBar
        .transition()
        .attr("x", function(d) {return x(d)})
        .attr("y", function(d) {return y(y.domain()[0])})
        .attr("rx", 0)
        .attr("ry", 0)
        .attr("width",  x.rangeBand())
        .attr("height", y.rangeBand())
        .style("fill", function(d,i) {
          var n = i%2;
          return (n > 0) ? "lightgray" : "gray"
        });

      var topText = top.selectAll("g.top-nav .text").data(x.domain());

      topText.enter().append("svg:foreignObject").attr("class", "text").append("xhtml:div")
        .html(function(schema) {return schema;});;

      topText
        .attr("width",  x.rangeBand())
        .attr("height", y.rangeBand())
        .attr("x", function(d) {return x(d)})
        .attr("y", function(d) {return y(y.domain()[0])})
        .attr("style","text-align: center;")

      topBar.exit().remove();
      topText.exit().remove();

      // Left Bar
      left.attr("transform", "translate(" + (margin.left - x.rangeBand()) + "," + margin.top + ")")

      var leftBar = left.selectAll("g.left-nav .left").data(y.domain());

      leftBar.enter().append("rect").attr("class", "left")

      leftBar
        .transition()
        .attr("x", function(d) {return x(x.domain()[0])})
        .attr("y", function(d) {return y(d)})
        .attr("rx", 0)
        .attr("ry", 0)
        .attr("width",  x.rangeBand())
        .attr("height", y.rangeBand())
        .style("fill", function(d,i) {
          var n = i%2;
          return (n > 0) ? "lightgray" : "gray"
        });

      var leftText = left.selectAll("g.left-nav .text").data(y.domain());

      leftText.enter().append("svg:foreignObject").attr("class", "text").append("xhtml:div")
        .html(function(schema) {return schema;});;

      leftText
        .attr("width",  x.rangeBand())
        .attr("height", y.rangeBand())
        .attr("x", function(d) {return x(x.domain()[0])})
        .attr("y", function(d) {return y(d)})
        .attr("style","text-align: left;")

      leftBar.exit().remove();
      leftText.exit().remove();

    }

    selection.each(function(data) {

      var brushended = function() {
        // if (!d3.event || !d3.event.sourceEvent) return; // only transition after input
        var clicked    = invertx2(brush.extent()[0]);
        var brushStart = x2(clicked);
        var brushEnd   = brushStart + x2.rangeBand();

        var chartData = _.find(data, function(d) {return d.name == clicked}).data;

        drawHeatmap(chartData);
        setMetaData(meta, clicked);

        d3.select(this).transition()
          .call(brush.extent([brushStart, brushEnd]))
      };

      // Setup functions now that we have data
      var categories = d3.utilities.uniqueProperties(data, 'name');
      x2.domain(d3.utilities.uniqueProperties(data, 'name'))
      invertx2.range(categories);
      brush.on("brushend", brushended);

      svg = d3.select(this).append("svg")
        .attr("class", "heatmap")
        .attr("width",  chartWidth  + margin.left + margin.right)
        .attr("height", chartHeight + margin.top  + margin.bottom);

      heatmap = svg.append("g").attr("class", "heatmap")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      top  = svg.append("g").attr("class", "top-nav")
      left = svg.append("g").attr("class", "left-nav")

      var meta = svg.append("meta-data");

      // Axis stubs
      // heatmap.append("g").attr("class", "x axis").call(xAxis);
      // heatmap.append("g").attr("class", "y axis").call(yAxis);
      replaceAxis(heatmap);

      // Create heatmap
      drawHeatmap(data[0].data);

      // Controls
      if (categories.length > 1) {
        drawControls(svg, brush);
      }

      // beautify
      // beautify();

      brushended();

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

  my.svg = function() {
    return svg;
  };

  return my;
};

