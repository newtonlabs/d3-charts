/*jslint browser: true*/
/*global $, jQuery, d3, _*/

if (d3.charts === null || typeof(d3.charts) !== "object") { d3.charts = {}; }

// Based on http://bost.ocks.org/mike/chart/
this.d3.charts.barchart = function() {
  'use strict';

  var width = 1200,
  height = 400,
  svg = {},
  margin = { top: 50, right: 20, bottom: 0, left: 75 };
  //color = d3.scale.category20();

  function my(selection) {
    var target;

    var hasTarget = function(){
      return typeof(target) !== 'undefined';
    }

    var chartWidth  = width - margin.left - margin.right,
        chartHeight = height - margin.top  - margin.bottom;

    var x0 = d3.scale.ordinal()
      .rangeRoundBands([0, width], .3);

    var x1 = d3.scale.ordinal();

    var y = d3.scale.linear()
      .range([chartHeight, 0]);

    var xAxis = d3.svg.axis()
      .scale(x0)
      .orient("bottom");

    var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");

    selection.each(function(data) {
      var groups = d3.keys(data[0]).filter(function(key) { return ((key !== "xAxis") && (key !== "yAxis") && (key !== "target") && (key !== "group")); });

      svg = d3.select(this).append("svg")
        .attr("class", "barchart")  //for namespacing css
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

      var context = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      data.forEach(function(d) {
        d.group = groups.map(function(name) { return {name: name, value: +d[name].value, color: d[name].color}; });
      });

      x0.domain(data.map(function(d) { return d.xAxis; }));
      x1.domain(groups).rangeRoundBands([0, x0.rangeBand()]);

      var d3Min = d3.min(data, function (d) {
        return d3.min(d.group, function (d) {
          return d.value;
        });
      });
      if (d3Min > 0)
        d3Min = 0;

      var d3Max = d3.max(data, function (d) {
        return d3.max(d.group, function (d) {
          return d.value;
        });
      });

      if (typeof(data[0].target) !== 'undefined') {
        target = Number(data[0].target);
      }
      if (hasTarget() && d3Max < target) {
        d3Max = target;
      }

      y.domain([ d3Min,d3Max ]);

      var xAxisTransform =  chartHeight;
      if(d3Min < 0 && 0 < d3Max) {
        xAxisTransform = chartHeight * (d3Max / (d3Max - d3Min));
      }

      var cat = context.selectAll(".cat")
        .data(data)
        .enter().append("g")
        .attr("class", "g")
        .attr("transform", function(d) { return "translate(" + x0(d.xAxis) + ",0)"; });

      cat.selectAll("rect")
        .data(function(d) { return d.group; })
        .enter().append("rect")
        .attr("width", x1.rangeBand())
        .attr("x", function(d) { return x1(d.name); })
        .attr("y", function (d) {
          if(d.value < 0)
            return y(0);
          return y(d.value);
        })
        .attr("height", function (d) {
          if(d.value < 0) {
            return y(d.value+d3Max);
          }
          return chartHeight - y(d.value+d3Min);
        })
        .style("fill", function(d) { return d.color; });

      context.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + xAxisTransform + ")") // this line moves x-axis
        .call(xAxis);
        
      context.append("svg:g")
        .attr("class", "y axis")
        .call(yAxis)
      .selectAll("g")
        .append("svg:foreignObject")
            .attr("width",'150px')
            .attr("height",'40px')
            .attr("x", -160)
            .attr("y", -20)
            .attr("style","text-align: right;")
        .append("xhtml:div")
            .html(function(schema) {return schema;});

      context.selectAll(".y.axis g text").remove();

      context.select(".y.axis")
        .append("text")
        .attr("y", -20)
        .style("text-anchor", "start")
        .text(data[0].yAxis);      

      if (hasTarget()) {
        var line = context.append("line")
          .attr("class", "target")
          .attr("x1", 0)
          .attr("y1", y(target))
          .attr("x2", width)
          .attr("y2", y(target));
      };

      // console.log(data);

      // cat.selectAll("text")
      //   .data(function(d) {return d.group}).enter().append("text")
      //   .attr("text-anchor", "middle")
      //   .attr("x", function (d) {return x1(d.name);})
      //   .attr("y", function (d) {return y(d.value);})
      //   // .attr("dx", function (d) {return x1(d.name);})
      //   .attr("dy", function (d) {return (d.value < 20) ? 15 : -5})
      //   .attr("class", "bartext")
      //   .text(function(d) {return d.value});

      // var legend = svg.selectAll(".legend")
      // .data(groups.slice().reverse())
      // .enter().append("g")
      // .attr("class", "legend")
      // .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

      // legend.append("rect")
      // .attr("x", width - 18)
      // .attr("width", 18)
      // .attr("height", 18)
      // .style("fill", color);

      // legend.append("text")
      // .attr("x", width - 24)
      // .attr("y", 9)
      // .attr("dy", ".35em")
      // .style("text-anchor", "end")
      // .text(function(d) { return d; });
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

/*jslint browser: true*/
/*global $, jQuery, d3, _*/

if (d3.charts === null || typeof(d3.charts) !== "object") { d3.charts = {}; }

// Based on http://bost.ocks.org/mike/chart/
this.d3.charts.chartTitle = function() {
 'use strict';

  var x = 0,
    y = 0,
    titleText = 'Lorem',
    subTitleText = 'Ipsum';

  function my(selection) {
    selection.each(function(data) {
      var title = selection.append("g").attr("class", "chart-title");
      title.attr("transform", "translate(" + x + "," + y + ")" );
      title.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .attr("class", "header")
        .text(titleText);

      title.append("text")
        .attr("x", 0)
        .attr("y", 15)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(subTitleText);
    });
  }

  // Getters and Setters
  my.x = function(value) {
    if (!arguments.length) { return x; }
    x = value;
    return my;
  };

  my.y = function(value) {
    if (!arguments.length) { return y; }
    y = value;
    return my;
  };

  my.title = function(value) {
    if (!arguments.length) { return titleText; }
    titleText = value;
    return my;
  };

  my.subTitle = function(value) {
    if (!arguments.length) { return subTitleText; }
    subTitleText = value;
    return my;
  }


  return my;
};

/*jslint browser: true*/
/*global $, jQuery, d3, _*/

if (d3.charts === null || typeof(d3.charts) !== "object") { d3.charts = {}; }

// Based on http://bost.ocks.org/mike/chart/
this.d3.charts.filter = function() {
  'use strict';
  var width = 960,
  height = 500,
  svg = {};

  function my(selection) {
    selection.each(function(data) {
      data.unshift("Select");
      svg = d3.select(this).append("div");
      var select = svg.append("select");
      var options = select.selectAll("option").data(data);
      options.enter().append("option")
        .attr("value", function(d) { return d; })
        .attr("subcategory", function(d) { return d; })
        .text(function(d) { return d; });

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

/*jslint browser: true*/
/*global $, jQuery, d3, _*/

if (d3.charts === null || typeof(d3.charts) !== "object") { d3.charts = {}; }

// Based on http://bost.ocks.org/mike/chart/
this.d3.charts.groupStack = function() {
  'use strict';
  var width = 1024,
  height = 500,
  svg = {},
  margin = {top: 10, right: 184, bottom: 20, left: 168},
  titleText = "STACKED BAR CHART EXAMPLE",
  subTitleText = "Subtext as needed",
  vertical = false,
  titleMargin = {top: 40};

  var my = function(selection) {
    var chartWidth,
        chartHeight,
        categories,
        yStackMax,
        chart,
        layers,
        labels,
        chartData = [],
        y = d3.scale.ordinal(),
        x = d3.scale.linear(),
        xAxis  = d3.svg.axis(),
        yAxis  = d3.svg.axis(),
        color  = d3.scale.ordinal(),
        legend = d3.charts.legend(),
        noData = d3.charts.noData(),
        format = d3.format(".3s"),
        stack  = d3.layout.stack(),
        title  = d3.charts.chartTitle();

    var initialize = function(selection, data) {
      if (_.isEmpty(data)) {
        initializeWithOutData();
      } else {
        initializeWithData(data);
      }
      initializeDimensions(selection);
    }

    var initializeWithData = function(data) {
      chartData = data;
      layers = stack(chartData);
      labels = _.map(layers[0], function(d) { return d.x; });
      categories = _.reduce(layers, function(memo, d) { memo.push(d[0].category); return memo}, []);
      yStackMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); });

      y.domain(labels);
      x.domain([0, yStackMax]);
      color.domain(categories).range(d3.utilities.stackColors);
      legend.color(color);
    }

    var initializeWithOutData = function() {
      chartData = [];
      layers = [];
      labels = _.map(_.range(7), function(d) {return ("Label - " + d)});
      categories = [];

      y.domain(labels);
    }

    var initializeDimensions = function(selection) {
      // TODO ... -40?
      chartWidth  = width  - margin.left - margin.right - 40;
      chartHeight = height - margin.top  - margin.bottom - titleMargin.top;

      svg = d3.select(selection).append("svg")
          .attr("class", "groupStack")
          .attr("width",  chartWidth  + margin.left + margin.right + 40)
          .attr("height", chartHeight + margin.top  + margin.bottom + titleMargin.top)

      chart = svg.append("g")
          .attr("transform", "translate(" + margin.left + "," + (margin.top + titleMargin.top) + ")")
          .attr("class", "groupStack");
    }

    var drawChart = function() {
      if (vertical) {
        drawChartVertical();
      } else {
        drawChartHorizontal();
      }
    }

    var drawChartVertical = function() {
      y.rangeRoundBands([0,chartWidth], 0.2);
      x.range([chartHeight,0]);

      // For sanity
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
          .attr("class", "vertical y axis")
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
          .attr("width", verticalX.rangeBand())

      rect
          .transition()
          .delay(function(d, i) { return i * 40; })
          .attr("y", function(d) {return verticalY(d.y0 + d.y);})
          .attr("height", function(d) { return verticalY(d.y0) - verticalY(d.y0 + d.y)});

      var text = chart.selectAll(".value")
          .data(lastLayer(layers))
          .enter().append("text")
          .attr("text-anchor", "middle")
          .attr("y", function(d) {return (verticalY(d.y0 + d.y)) - 4 ; })
          .attr("x", function(d) { return verticalX(d.x)+verticalX.rangeBand()/2; })
          .attr("class","value")
          .text(function(d, i) { return format(d.y+d.y0); });
    }

    var lastLayer = function(layers) {
      return _.isEmpty(layers) ? [] : _.last(layers);
    }

    var drawChartHorizontal = function() {

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

      chart.append("g").attr("class", "horizontal y axis").call(yAxis);

      var gx = chart.append("g")
        .attr("class", "horizontal x axis")
        .attr("transform", "translate(0," + chartHeight + ")")
        .call(xAxis);
      gx.selectAll("g").classed("gridline", true);
      gx.selectAll("text").attr("x", 18)

      var layer = chart.selectAll(".layer")
          .data(layers)
          .enter().append("g")
          .attr("class", "layer")
          .style("fill", function(d, i) {return color(d[0].category); });

      var rect = layer.selectAll("rect")
          .data(function(d) { return d; })
          .enter().append("rect")
          .attr("x", 0)
          .attr("y", function(d) { return y(d.x); })
          .attr("width", 0)
          .attr("height", y.rangeBand())

      rect
          .transition()
          .delay(function(d, i) { return i * 40; })
          .attr("x", function(d) { return x(d.y0); })
          .attr("width", function(d) { return x(d.y); });

      var text = chart.selectAll(".value")
          .data(lastLayer(layers))
          .enter().append("text")
          .attr("x", function(d) { return x(d.y + d.y0)+5; })
          .attr("y", function(d) { return y(d.x)+y.rangeBand()/2+4; })
          .attr("class","value")
          .text(function(d, i) { return format(d.y+d.y0); });
    }

    var drawTitle = function() {
      title.title(titleText).subTitle(subTitleText);
      title.x(16).y(margin.top);
      svg.call(title);
    }

    var drawLegend = function() {
      legend
          .y(margin.top + titleMargin.top)
          .x(chartWidth + 30 + margin.right);

      svg.datum(categories).call(legend);
    }

    var drawNoData = function() {
      noData.x((chartWidth)/2).y(chartHeight/2);
      svg.call(noData);
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

  my.vertical = function(value) {
    if (!arguments.length) { return vertical; }
    vertical = value;
    return my;
  };



  return my;
};

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
          .attr('class', 'cell value ' + cellFont)
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


  return my;
};


/*jslint browser: true*/
/*global $, jQuery, d3, _*/

if (d3.charts === null || typeof(d3.charts) !== "object") { d3.charts = {}; }

// Based on http://bost.ocks.org/mike/chart/
this.d3.charts.legend = function() {
 'use strict';

  var x = 0,
    y = 0,
    color =  d3.scale.category10(),
    click = undefined

  function my(selection) {
    selection.each(function(data) {
      var legendBox = selection.append("g")
        .attr("class", "legend-container")
        .attr("transform", "translate(" + x + "," + y + ")");

      var legend = legendBox.selectAll(".legend")
        .data(data)
        .enter().append("g")
        .attr("class", "legend")


      legend.append("rect")
        .attr("x", 0)
        .attr("y", function(d,i) {return (i * 28)})
        .attr("width", 17)
        .attr("height", 17)
        .attr("fill", function(d) { return color(d); });

      legend.append("text")
        .attr("x", 25)
        .attr("y", function(d,i) {return (i * 28) + 9})
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(function(d) { return d; });

      if (click) {
        legendBox.selectAll("g")
          .attr("style", "cursor: pointer;")
          .on("click", click);
      }
    });
  }

  // Getters and Setters
  my.x = function(value) {
    if (!arguments.length) { return x; }
    x = value;
    return my;
  };

  my.y = function(value) {
    if (!arguments.length) { return y; }
    y = value;
    return my;
  };

  my.color = function(value) {
    if (!arguments.length) { return color; }
    color = value;
    return my;
  };

  my.click = function(value) {
    if (!arguments.length) { return click; }
    click = value;
    return my;
  }


  return my;
};

/*jslint browser: true*/
/*global $, jQuery, d3, _*/

if (d3.charts === null || typeof(d3.charts) !== "object") { d3.charts = {}; }

// Based on http://bost.ocks.org/mike/chart/
this.d3.charts.noData = function() {
 'use strict';

  var x = 0,
    y = 0;

  function my(selection) {
    selection.each(function(data) {
      var noData = selection.append("g")
          .attr("class", "no-data-found")
          .attr("transform", "translate(" + x + "," + y +")");

      noData.append("rect")
          .attr("x", 0)
          .attr("y", 0)
          .attr("height", '100px')
          .attr("width", '300px')

      noData.append("text")
          .attr("x", 150)
          .attr("y", 55)
          .text("NO DATA FOUND");
    });
  }

  // Getters and Setters
  my.x = function(value) {
    if (!arguments.length) { return x; }
    x = value;
    return my;
  };

  my.y = function(value) {
    if (!arguments.length) { return y; }
    y = value;
    return my;
  };

  return my;
};

/*jslint browser: true*/
/*global $, jQuery, d3, _*/

if (d3.charts === null || typeof(d3.charts) !== "object") { d3.charts = {}; }

// Based on http://bost.ocks.org/mike/chart/
this.d3.charts.plotmap = function() {
 'use strict';

  var width  = 1000,
      height = 600,
      controlHeight = 30,
      rowFont = 'small',
      columnFont = 'small',
      cellFont = 'small',
      fixedRowHeight,
      fixedColumnWidth,
      svg = {},
      legend = [],
      chartData = [],
      margin = {top: 10, right: 184, bottom: 20, left: 168},
      titleMargin = {top: 30},
      rowTitleMargin = {top: 60},
      titleText = "HEATMAP CHART EXAMPLE",
      subTitleText = "Subtext as needed";

  function my(selection) {
    var chartWidth,
        chartHeight,
        plotmap,
        columns,
        rows,
        categories,
        subcategories,
        categorySelect,
        x  = d3.scale.ordinal(),
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
      }

      if (fixedColumnWidth) {
        chartWidth = fixedColumnWidth * x.domain().length;
        x.rangeRoundBands([0, chartWidth]);
        x2.rangeRoundBands([0, chartWidth]);
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
      plotmap = svg.append("g").attr("class", "heatmap")
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

    var drawChart = function() {
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
      var rect  = heatmap.selectAll("g.heatmap .square").data(data);
      rect.enter().append("rect")
          .attr("class", "square")
          .attr("style", function(d) {return "fill:"+d.color; });
      rect
          .attr("x", function(d) { return x(d.xAxis);})
          .attr("y", function(d) { return y(d.yAxis);})
          .attr("rx", 0)
          .attr("ry", 0)
          .attr("width", x.rangeBand())
          .attr("height", y.rangeBand())
          .transition()
          .style("fill", function(d) {return d.color;});
      rect.exit().remove();

      // Enter, Update, Exit text values
      // var cellFont = d3.scale.linear().domain([0,10000, 125000, 250000]).range(['small', 'small', 'medium', 'large']);
      // var area = x.rangeBand() * y.rangeBand();
      var value = heatmap.selectAll("g.heatmap .cell.value").data(data);

      value.enter().append("text");
      value
          .attr("text-anchor", "middle")
          .attr("x", function(d) { return x(d.xAxis);})
          .attr("y", function(d) { return y(d.yAxis);})
          .attr("dy", function() { return y.rangeBand()/2 + 4;})
          .attr("dx", function() { return x.rangeBand()/2;})
          .attr('class', 'cell value ' + cellFont)
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
      drawChart();
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

  my.plotType = function(value) {
    if (!arguments.length) { return plotType; }
    plotType = value;
    return my;
  }


  return my;
};


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
          .attr("class", "x axis")
          .attr("transform", "translate(0," + y(y.domain()[0]) + ")")
          .call(xAxis);

//      yAxis with huge ticks for gridlines
      yAxis.tickSize(chartWidth);

      var gy = focus.append("svg:g")
          .attr("class", "y axis")
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
          .attr("class", "x axis")
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
/*jslint browser: true*/
/*global $, jQuery, d3, _*/

if (d3.utilities === null || typeof(d3.utilities) !== "object") { d3.utilities = {}; }

this.d3.helpers = {
  timeFormat: function(formats) {
    return function(date) {
      var i = formats.length - 1, f = formats[i];
      while (!f[1](date)) f = formats[--i];
      return f[0](date);
    };
  }
}

this.d3.utilities = {
  uniqueProperties: function(data, property) {
    return _.reduce(data, function(memo, d) {
      if (! memo.filter(function(o) { return d[property] === o;}).length) {
        memo.push(d[property]);
      }
      return memo;
    },[]);
  },

  colorWheel: ['#F3504F', '#F28A00', '#F1C40E', '#57D68D', '#15A085', '#00237E', '#3398DB', '#74DDE8', '#9B59B6', '#661C79'],
  // stackColors: ['#85C1E9', '#00227D'],
  stackColors: ['#00237E', '#3398DB', '#85C1E9', '#C7DFF1', '#00227D'],

  customTimeFormat: d3.helpers.timeFormat([
    [d3.time.format("%Y"), function() { return true; }],
    [d3.time.format("%b"), function(d) { return d.getMonth(); }],
    [d3.time.format("%b %d"), function(d) { return d.getDate() != 1; }],
    [d3.time.format("%a %d"), function(d) { return d.getDay() && d.getDate() != 1; }],
    [d3.time.format("%I %p"), function(d) { return d.getHours(); }],
    [d3.time.format("%I:%M"), function(d) { return d.getMinutes(); }],
    [d3.time.format(":%S"), function(d) { return d.getSeconds(); }],
    [d3.time.format(".%L"), function(d) { return d.getMilliseconds(); }]
  ]),

  padDomain: function(upperRange, upperDomain, pad) {
    return (pad / upperRange * upperDomain);
  },

  resizeHandles: function(d, height) {
    var e = +(d == "e"),
        x = e ? 1 : -1,
        y = height / 3;
    return "M" + (.5 * x) + "," + y
        + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6)
        + "V" + (2 * y - 6)
        + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y)
        + "Z"
        + "M" + (2.5 * x) + "," + (y + 6)
        + "V" + (2 * y - 6)
        + "M" + (4.5 * x) + "," + (y + 6)
        + "V" + (2 * y - 6);
  },

  comma: d3.format(","),
}

