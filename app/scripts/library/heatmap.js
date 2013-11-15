/*jslint browser: true*/
/*global $, jQuery, d3, _*/

if (d3.charts === null || typeof(d3.charts) !== "object") { d3.charts = {}; }

// Based on http://bost.ocks.org/mike/chart/
this.d3.charts.heatmap = function() {
 'use strict';

  var width  = 1000,
      height = 600,
      controlHeight = 30,
      rowFont = 'small',
      columnFont = 'small',
      cellFont = 'small',
      fixedRowHeight,
      fixedColumnWidth,
      cellFontColor = 'white',
      svg = {},
      legend = [],
      margin = {top: 10, right: 184, bottom: 20, left: 168},
      titleMargin = {top: 30},
      rowTitleMargin = {top: 60},
      titleText = "HEATMAP CHART EXAMPLE",
      subTitleText = "Subtext as needed";

  function my(selection) {
    var chartWidth,
        chartHeight,
        heatmap,
        columns,
        rows,
        meta,
        categories,
        controls,
        categorySelect,
        grouped = true,
        chartData = [],
        x  = d3.scale.ordinal(),
        x2 = d3.scale.ordinal(),
        y  = d3.scale.ordinal(),
        noData = d3.charts.noData(),
        d3legend = d3.charts.legend(),
        title    = d3.charts.chartTitle();

    var topMargin  = function () {
      var top = margin.top + titleMargin.top + rowTitleMargin.top;
      top += grouped ? controlHeight : 0;
      return top;
    };

    var resetDimensions = function() {
      if (fixedRowHeight) {
        chartHeight = fixedRowHeight * y.domain().length;
        y.rangeRoundBands([0, chartHeight]);
        // svg.attr("height", chartHeight + topMargin() + margin.bottom);
      }

      if (fixedColumnWidth) {
        chartWidth = fixedColumnWidth * x.domain().length;
        x.rangeRoundBands([0, chartWidth]);
        x2.rangeRoundBands([0, chartWidth]);
        // svg.attr("width", chartWidth  + margin.left + margin.right);
      }
    }

    var initializeDimensions = function(selection) {
      chartWidth  = width - margin.left - margin.right;
      chartHeight = height - topMargin() - margin.bottom;
      x.rangeRoundBands([0, chartWidth]);
      x2.rangeRoundBands([0, chartWidth]);
      y.rangeRoundBands([0, chartHeight]);
      title.title(titleText).subTitle(subTitleText);

      // SVG Container
      svg = d3.select(selection).append("svg")
          .attr("class", "heatmap")
          .attr("width",  chartWidth  + margin.left + margin.right)
          .attr("height", chartHeight + topMargin() + margin.bottom);

      // Heatmap
      heatmap = svg.append("g").attr("class", "heatmap")
          .attr("transform", "translate(" + margin.left + "," + topMargin() + ")");

      // Row Labels
      columns = svg.append("g")
          .attr("class", "top-nav")
          .attr("transform", "translate(" + margin.left + "," + (topMargin() - rowTitleMargin.top) + ")")

      // Column Labels
      rows = svg.append("g")
          .attr("class", "left-nav")
          .attr("transform", "translate(" + (0) + "," + topMargin() + ")")

      // Group selection
      meta = svg.append("meta-data");

    }

    var initializeWithData = function(data) {
      chartData = data;
      categories = d3.utilities.uniqueProperties(data, 'name');
      x2.domain(categories);
      if (categories.length <= 1) { grouped = false; }
    }

    var initializeWithOutData = function() {
      grouped = false;
      chartData = [{data: []}];
      _.each(_.range(10), function(i) {
        _.each(_.range(10), function(k) {
          chartData[0].data.push({
            xAxis: ("Label " + k),
            yAxis: ("Label " + i),
            color: ("#ccc")
          });
        })
      })

      legend = [{name: 'TBD', color: '#ccc'}]

    }

    var drawChart = function(data) {
      categorySelect = function(clicked) {
        controls.select(".selected").attr("class","")
        controls.select("[category=\""+clicked+"\"]").attr("class","selected")

        var data = _.find(chartData, function(d) {return d.name == clicked}).data;
        drawHeatmap(data);
        setMetaData(clicked);
      }

      if (grouped) {
        drawControls(categories);
        categorySelect(categories[0])
      }
      else {
        drawHeatmap(chartData[0].data);
      }
    }

    var drawTitle = function() {
      title.x(16).y(margin.top);
      svg.call(title);
    }

    var drawHeatmap = function(data) {
      // Update domains with newest data set
      x.domain(d3.utilities.uniqueProperties(data, 'xAxis'));
      y.domain(d3.utilities.uniqueProperties(data, 'yAxis'));

      // Reset dimensions if the y.domain is fixed
      resetDimensions();

      // Enter, Update, Exit squares
      var cellColor = function(d) {
        return _.isEmpty(d.color) ? 'none' : d.color;
      }

      var rect  = heatmap.selectAll("g.heatmap .square").data(data);
      rect.enter().append("rect")
          .attr("class", "square")
          .attr("fill", cellColor);
      rect
          .attr("x", function(d) { return x(d.xAxis);})
          .attr("y", function(d) { return y(d.yAxis);})
          .attr("rx", 0)
          .attr("ry", 0)
          .attr("width", x.rangeBand())
          .attr("height", y.rangeBand())
          .transition()
          .style("fill", cellColor);
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
          .attr('class', 'cell value ' + cellFont + ' ' + cellFontColor)
          .text(function(d) {return d.value;} )
      value.exit().remove();

      rowColumnLabels();
    };

    var drawControls = function(categories) {
      controls = svg.append("g")
          .attr("class", "controls")
          .attr("transform", "translate(" + margin.left + "," + (topMargin() - rowTitleMargin.top - controlHeight) + ")")
      controls.append("rect")
          .attr("class", "border")
          .attr("x", 0)
          .attr("y", 0)
          .attr("rx", 4)
          .attr("ry", 4)
          .attr("width", chartWidth)
          .attr("height", controlHeight);

      var controlsBox = controls.selectAll(".text").data(categories).enter().append("g")
      controlsBox
          .attr("category", function(d) {return d})
        .append("rect")
          .attr("class", "control-box")
          .attr("x", function(d) {return x2(d)})
          .attr("y", 0)
          .attr("width", x2.rangeBand())
          .attr("height", controlHeight)
      controlsBox
        .append("text")
          .attr("x", function(d) {return (x2(d) + x2.rangeBand()/2)})
          .attr("y", 20)
          .attr("width", x2.rangeBand())
          .attr("height", controlHeight)
          .text(function(d) {return d})
          .attr("style", "cursor: pointer;")
          .on("click", categorySelect);
    }

    var setMetaData = function(clicked) {
      var category = meta.selectAll('category').data([clicked]);
      category.enter().append("category");
      category.text(function(d) { return d;});
    }

    var rowColumnLabels = function() {
      var columnLabel = columns.selectAll("g.top-nav .text").data(x.domain());
      columnLabel.enter().append("svg:foreignObject").attr("class", "text").append("xhtml:div")
          .attr("class", "column-label " + columnFont)
          .attr("style", "height:" + rowTitleMargin.top + "px; width:" +x.rangeBand()+ "px;")
        .append("xhtml:div")
          .html(function(schema) {return schema;});;
      columnLabel
          .attr("width",  x.rangeBand())
          .attr("height", rowTitleMargin.top)
          .attr("x", function(d) {return x(d)})
          .attr("y", function(d) {return y(y.domain()[0])})
      columnLabel.exit().remove();

      var rowLabel = rows.selectAll("g.left-nav .text").data(y.domain());
      rowLabel.enter().append("svg:foreignObject").attr("class", "text").append("xhtml:div")
          .attr("class", "row-label " + rowFont)
        .append("xhtml:div")
          .html(function(schema) {return schema;});;
      rowLabel
          .attr("width",  margin.left)
          .attr("height", y.rangeBand())
          .attr("x", function(d) {return x(x.domain()[0])})
          .attr("y", function(d) {return y(d)})
          .attr("style", "line-height:"+y.rangeBand()+"px")
      rowLabel.exit().remove();
    }

    var drawLegend = function() {
      var color  = d3.scale.ordinal()
          .domain(_.map(legend, function(d) {return d.name}))
          .range(_.map(legend, function(d) {return d.color}));
      var d3Legend = d3.charts.legend().color(color);

      d3Legend
          .y(topMargin())
          .x(chartWidth + 30 + margin.right);
      svg.datum(_.map(legend, function(d) { return d.name })).call(d3Legend);
    }

    var drawNoData = function() {
      noData.x((chartWidth)/2).y(chartHeight/2);
      svg.call(noData);
    }

    var initialize = function(selection, data) {
      if (_.isEmpty(data)) {
        data = [];
        initializeWithOutData();
      } else {
        initializeWithData(data);
      }
      initializeDimensions(selection);
    }

    selection.each(function(data) {
      initialize(this, data);
      drawChart(data);
      drawTitle();
      drawLegend();
      if (_.isEmpty(data)) { drawNoData();}
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

  my.legend = function(value) {
    if (!arguments.length) { return legend; }
    legend = value;
    return my;
  };

  my.rowFont = function(value) {
    if (!arguments.length) { return rowFont; }
    rowFont = value;
    return my;
  };

  my.columnFont = function(value) {
    if (!arguments.length) { return columnFont; }
    columnFont = value;
    return my;
  };

  my.cellFont = function(value) {
    if (!arguments.length) { return cellFont; }
    cellFont = value;
    return my;
  };

  my.fixedRowHeight = function(value) {
    if (!arguments.length) { return fixedRowHeight; }
    fixedRowHeight = value;
    return my;
  };

  my.fixedColumnWidth = function(value) {
    if (!arguments.length) { return fixedColumnWidth; }
    fixedColumnWidth = value;
    return my;
  };

  my.cellFontColor = function(value) {
    if (!arguments.length) { return cellFontColor; }
    cellFontColor = value;
    return my;
  };


  return my;
};

