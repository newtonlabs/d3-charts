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

if (d3.charts === null || typeof(d3.charts) !== 'object') { d3.charts = {}; }

d3.charts.baseBuilder = function(selection, data, config) {
  'use strict';

  var builder = {},
      svg,
      chart,
      graphic;

  builder.draw = function() {
    builder.setupSvg();
    builder.setupChart();
    builder.setupGraphic();

    if (config.svgArea) { builder.svgArea(); }
    if (config.chartArea) { builder.chartArea(); }
    if (config.graphicArea) {builder.graphicArea(); }
    if (config.testArea) { builder.addTestCircles(); }
  };

  builder.setupSvg = function(){
    svg = d3.select(selection).append("svg")
        .attr("class", config.className)
        .attr("width",  config.width)
        .attr("height", config.height);
  }

  builder.setupChart = function() {
    chart = svg.append("g")
        .attr("transform", "translate("
            + builder.marginLeft() + ","
            + builder.marginTop() + ")")
  }

  builder.chartArea = function() {
     chart.append('rect')
        .attr('height', builder.chartHeight())
        .attr('width', builder.chartWidth())
        .attr('x', 0)
        .attr('y', 0)
        .attr('stroke', 'steelblue')
        .attr('fill', 'none')
        .attr('stroke-width', '2px');
  }

  builder.setupGraphic = function() {
    graphic = svg.append("g")
        .attr("transform", "translate("
            + builder.graphicMarginLeft() + ","
            + builder.graphicMarginTop() + ")")
  }

  builder.svgArea = function() {
    svg.append('rect')
      .attr('height', config.height)
      .attr('width', config.width)
      .attr('x', 0)
      .attr('y', 0)
      .attr('stroke', 'gray')
      .attr('fill', 'none')
      .attr('stroke-width', '1px');
  }

  builder.graphicArea = function() {
    graphic.append('rect')
      .attr('height', builder.graphicHeight())
      .attr('width', builder.graphicWidth())
      .attr('x', 0)
      .attr('y', 0)
      .attr('stroke', 'red')
      .attr('fill', 'none')
      .attr('stroke-width', '2px');
  }

  builder.addTestCircles = function() {
    graphic.selectAll('circle').data([10,20,30]).enter()
        .append('circle')
        .attr('cy', function(d,i) { return (100*(i+1)); })
        .attr('cx', function(d,i) { return (125*(i+1)); })
        .attr('r', function(d) { return d; })
        .attr('stroke-width', '2px')
        .attr('fill', 'steelblue');
  }

  builder.graphicWidth = function() {
    if (config.leftLabels) {
      return builder.chartWidth() - config.margin.leftLabel;
    }
    return builder.chartWidth();
  }

  builder.graphicHeight = function() {
    if (config.bottomLabels && config.topLabels) {
      return builder.chartHeight() - config.margin.bottomLabel - config.margin.topLabel;
    }
    if (config.bottomLabels && !config.topLabels) {
      return builder.chartHeight() - config.margin.bottomLabel;
    }
    if (!config.bottomLabels && config.topLabels) {
      return builder.chartHeight() - config.margin.topLabel;
    }
    return builder.chartHeight();
  }

  builder.chartWidth = function() {
    if (config.legend) {
      return config.width - config.margin.left - config.margin.right - config.margin.legend;
    }
    return config.width - config.margin.left - config.margin.right;
  }

  builder.chartHeight = function() {
    if (config.titleOn) {
      return config.height - config.margin.top - config.margin.bottom - config.margin.title;
    }
    return config.height - config.margin.top - config.margin.bottom;
  }

  builder.marginLeft = function() {
    return config.margin.left;
  }

  builder.marginTop = function() {
    if (config.titleOn) {
      return config.margin.top + config.margin.title
    }
    return config.margin.top;
  }

  builder.graphicMarginTop = function() {
    if (config.topLabels) {
      return builder.marginTop() + config.margin.topLabel;
    }
    return builder.marginTop();
  }

  builder.graphicMarginLeft = function() {
    if (config.leftLabels) {
      return builder.marginLeft() + config.margin.leftLabel;
    }
    return builder.marginLeft();
  }

  builder.legendMarginTop = function() {
    return builder.graphicMarginTop();
  }

  builder.legendMarginLeft = function() {
    return config.width - config.margin.legend;
  }

  builder.titleMarginLeft = function() {
    return config.margin.left;
  }

  builder.titleMarginTop = function() {
    return config.margin.top;
  }

  builder.svg = function() { return svg; }
  builder.chart = function() { return chart; }
  builder.graphic = function() { return graphic; }

  return builder;

};
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
        .attr("class", "horizontal x axis")
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

    // y.domain(categories).rangeRoundBands([0,builder.graphicHeight()]);
    // x.domain(subcategories).rangeRoundBands([0,builder.graphicWidth()]);
    y.domain(categories).rangeRoundBands([0,builder.graphicHeight()], 0.2, 0);
    x.domain(subcategories).rangeRoundBands([0,builder.graphicWidth()], 0.2, 0);

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
        .attr("transform", "translate(" + (width - radius - 10 ) + "," + (radius + 10)+ ")");

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

    // zoomChart.append("rect")
    //     .attr("x", 0)
    //     .attr("y", 0)
    //     .attr("rx", 8)
    //     .attr("height", zoomHeight)
    //     .attr("width", zoomWidth)
    //     .attr("fill", 'white')
    //     .attr("stroke", 'lightgray')
    //     .attr("stroke-width", '1px');

    xAxis.scale(zoomX).orient("bottom")
        .tickFormat(d3.utilities.customTimeFormat)
        .outerTickSize([0])
        .ticks(10);

    yAxis.scale(zoomY).orient("right").ticks(4);

    zoomChart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + zoomY(zoomY.domain()[0]) + ")")
        .call(xAxis);

    yAxis.tickSize(zoomWidth);

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

    var currentPoint = zoomChart.append('g')
        .attr("transform", "translate(" +  zoomX(current.date) + "," +  zoomY(current.value) + ")");

    currentPoint.append("circle")
        .attr("class", "circle")
        .style("fill", function(d) { return current.color; })
        .attr("stroke-width", '2')
        .attr("stroke", 'white')
        .attr("r", 15);

    currentPoint.append('text')
        .attr('stroke', 'white')
        .attr('text-anchor', 'middle')
        .attr('dy', 4)
        .attr('class', 'current-value')
        .text(current.value);

    zoomChart.append('line')
      .attr('stroke', current.color)
      .attr('x1', zoomX.range()[0])
      .attr('y1', zoomY(current.target))
      .attr('x2', zoomX.range()[1])
      .attr('y2', zoomY(current.target));


    // var text = zoomChart.append("g")
    //     .attr("transform", "translate(" + (width + 35) + "," + 0 + ")");

    // // row(text, 0, 0, 'High', extent[1]);
    // // row(text, 0, 20, 'Low', extent[0]);
    // // row(text, 0, 40, 'Current', current.value);
    // // row(text, 0, 60, 'Target', d[0].target);
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

if (d3.charts === null || typeof(d3.charts) !== 'object') { d3.charts = {}; }

this.d3.charts.baseChart = function() {
  'use strict';

  var config = {},
      svgContainer,
      builder;

  var chart = function(selection) {
    selection.each(function(data) {
      var build = builder(this, data, config);
      build.draw();
      svgContainer = build.svg();
    })
  };

  chart.config = function(accessor, value) {
    if (!arguments.length) { return config; }

    if (value !== undefined) { config[accessor] = value; }

    chart[accessor] = function(value) {
      if (!arguments.length) { return config[accessor]; }
      config[accessor] = value;
      return chart;
    };

    return chart;
  };

  chart.builder = function(value) {
    if (!arguments.length) { return builder; }
    builder = value;
    return chart;
  };

  // Chart Global Defaults
  chart.config('width', 900)
      .config('height', 500)
      .config('title', "TITLE GOES HERE")
      .config('subtitle', "Subtitle goes here")
      .config('margin', {
        top: 8,
        right: 8,
        bottom: 8,
        left: 8,
        leftLabel: 168,
        bottomLabel: 40,
        topLabel: 60,
        legend: 168,
        title: 30 })
      .config('leftLabels', true)
      .config('bottomLabels', true)
      .config('topLabels', false)
      .config('chartArea', false)
      .config('graphicArea', false)
      .config('legend', true)
      .config('titleOn', true)

  chart.svg =  function() { return svgContainer; }

  return chart;
};

if (d3.charts === null || typeof(d3.charts) !== 'object') { d3.charts = {}; }

this.d3.charts.groupStack = function() {
  'use strict';

  // custom config and overides
  var chart  = d3.charts.baseChart()
      .config('chartArea', false)
      .config('graphicArea', false)
      .config('legend', true)
      .config('leftLabels', true)
      .config('bottomLabels', true)
      .config('titleOn', true)
      .config('vertical', false)
      .config('className', 'groupStack')
      .builder(d3.charts.groupStackBuilder);

  return chart;
};

if (d3.charts === null || typeof(d3.charts) !== 'object') { d3.charts = {}; }

this.d3.charts.tablechart = function() {
  'use strict';


  // custom config and overides
  var chart  = d3.charts.baseChart()
      .config('svgArea', false)
      .config('chartArea', false)
      .config('graphicArea', false)
      .config('legend', false)
      .config('leftLabels', true)
      .config('bottomLabels', true)
      .config('topLabels', true)
      .config('titleOn', true)
      .config('chartType', 'line')
      .config('className', 'tablechart')
      .config('width', 900)
      .config('height',500)
      .builder(d3.charts.tablechartBuilder);

  return chart;
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
this.d3.charts.groupStackOld = function() {
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

  linewrap: function(d) {
    var text = d.value;
    var el = d3.select(this);

    if (text) {
      var breaks = text.split("<br>");
      _.each(breaks, function(d, i) {
        console.log(d);
        var tspan = el.append("tspan").text(d).attr("text-anchor", "middle");
        if (i > 0) {
          tspan.attr('dx',0).attr('dy', '15');
        }
      })
    }
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

