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
    svg = d3.select(selection).append('svg')
        .attr('class', config.className)
        .attr('width',  config.width)
        .attr('height', config.height);
  }

  builder.setupChart = function() {
    chart = svg.append('g')
        .attr('transform', 'translate('
            + builder.marginLeft() + ','
            + builder.marginTop() + ')')
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
    graphic = svg.append('g')
        .attr('transform', 'translate('
            + builder.graphicMarginLeft() + ','
            + builder.graphicMarginTop() + ')')
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
    return config.width - config.margin.legend + 8;
  }

  builder.titleMarginLeft = function() {
    return config.margin.left;
  }

  builder.titleMarginTop = function() {
    return config.margin.top;
  }

  builder.bottomLabel = function() {
    return config.margin.bottomLabel;
  }

  builder.drawNoDataLabel = function() {
    var noData = d3.charts.noData();

    noData.x((config.width - 300)/2).y(config.height/2 - 50);
    builder.svg().call(noData);
  }

  builder.drawTitle = function() {
    var title = d3.charts.chartTitle();

    title.title(config.title).subTitle(config.subtitle);
    title.x(builder.titleMarginLeft()).y(builder.titleMarginTop());
    builder.svg().call(title);
  }

  builder.svg = function() { return svg; }
  builder.chart = function() { return chart; }
  builder.graphic = function() { return graphic; }

  return builder;
};
if (d3.charts === null || typeof(d3.charts) !== 'object') { d3.charts = {}; }

d3.charts.bubbleBuilder = function(selection, data, config) {
  'use strict';

  var builder = d3.charts.baseBuilder(selection, data, config),
      categories,
      y = d3.scale.linear(),
      x = d3.scale.linear(),
      r = d3.scale.linear(),
      xAxis = d3.svg.axis(),
      yAxis = d3.svg.axis(),
      color = d3.scale.ordinal(),
      format = d3.format('.3s'),
      legend = d3.charts.legend();

  builder.draw = function() {
    var empty = _.isEmpty(data);

    builder.setupSvg();
    builder.setupChart();
    builder.setupGraphic();
    empty ? setupNoData() : setupData();

    drawBubbleChart();
    if (config.titleOn) { builder.drawTitle(); }
    if (empty) { builder.drawNoDataLabel(); }
    if (config.legend) { drawLegend(); }
    if (config.chartArea) { builder.chartArea(); }
    if (config.graphicArea) { builder.graphicArea(); }
  };

  var setupNoData = function() {
    color.domain(['TBD']).range(['#E6E6E6']);
    legend.color(color);
  }

  var setupData = function() {
    x.domain(d3.extent(data, function(d) { return parseFloat(d.xAxis); }));
    y.domain(d3.extent(data, function(d) { return parseFloat(d.yAxis); }));
    r.domain(d3.extent(data, function(d) { return d.value; })).nice();
    // TODO DEMO HACK FOR PADDING
    x.domain([x.domain()[0] - 3, x.domain()[1] + 3]);
    categories = d3.utilities.uniqueProperties(data, 'category');
    color.domain(categories).range(d3.utilities.colorWheel)
  }

  var drawLegend = function() {
    legend.color(color);
    legend.y(builder.legendMarginTop()).x(builder.legendMarginLeft());
    builder.svg().datum(categories).call(legend);
  }

  var drawBubbleChart = function() {
    var chartHeight = builder.graphicHeight(),
        chartWidth = builder.graphicWidth(),
        chart = builder.graphic();

    y.rangeRound([chartHeight,0]);
    x.rangeRound([0, chartWidth]);
    r.rangeRound([3,20])

    xAxis.scale(x)
        .tickSize(-chartHeight)
        .tickPadding(3)
        .tickFormat(format)
        .outerTickSize([0])
        .orient('bottom');

    yAxis.scale(y)
        .tickSize(0)
        .tickPadding(10)
        .orient('left');

    chart.append('g')
        .attr('class', 'horizontal y axis')
        .call(yAxis);

    var gx = chart.append('g')
        .attr('class', 'horizontal x axis number')
        .attr('transform', 'translate(0,' + chartHeight + ')')
        .call(xAxis);
    gx.selectAll('g').classed('gridline', true);
    gx.selectAll('text').attr('x', 18)

    var layer = chart.selectAll('.layer')
        .data(data)
        .enter().append('g')
        .attr('class', 'layer');

    var bubble = layer.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", function(d) { return r(d.value) })
      .attr("cx", function(d) {
        return x(d.xAxis); })
      .attr("cy", function(d) { return y(d.yAxis); })
      .attr("fill", function(d) { return color(d.category); });

  }

  return builder;
};
if (d3.charts === null || typeof(d3.charts) !== 'object') { d3.charts = {}; }

d3.charts.heatmapBuilder = function(selection, data, config) {
  'use strict';

  var builder = d3.charts.baseBuilder(selection, data, config),
      legend = d3.charts.legend(),
      noData = d3.charts.noData(),
      x = d3.scale.ordinal(),
      y = d3.scale.ordinal();

  builder.draw = function() {
    var empty = _.isEmpty(data);

    // setupLegend();
    builder.setupSvg();
    builder.setupChart();
    builder.setupGraphic();
    if (empty) { stubNoData(); }

    setupData();
    drawHeatmap();

    if (empty) { builder.drawNoDataLabel(); }
    if (config.legend) { drawLegend(); }
    if (config.svgArea) { builder.svgArea(); }
    if (config.titleOn) { builder.drawTitle(); }
    if (config.chartArea) { builder.chartArea(); }
    if (config.graphicArea) { builder.graphicArea(); }
  };

  // var setupLegend = function() {
  //   if(_.isEmpty(config.legendData)) {
  //     config.legend = false;
  //   } else {
  //     config.legend = true;
  //   }
  // }

  var stubNoData = function() {
    data = [{data: []}];
    _.each(_.range(10), function(i) {
      _.each(_.range(10), function(k) {
        data[0].data.push({xAxis: ('Label ' + k), yAxis: ('Label ' + i), color: ('#ccc')});
      })
    })

    setupData();
  }

  var setupData = function() {
    x.domain(d3.utilities.uniqueProperties(data[0].data, 'xAxis'));
    y.domain(d3.utilities.uniqueProperties(data[0].data, 'yAxis'));

    var chartWidth = config.fixedColumnWidth ? config.fixedColumnWidth * x.domain().length : builder.graphicWidth();
    var chartHeight = config.fixedRowHeight ? config.fixedRowHeight * y.domain().length : builder.graphicHeight();

    x.rangeRoundBands([0, chartWidth]);
    y.rangeRoundBands([0, chartHeight]);
  }

  var drawHeatmap = function() {
    drawRowColumnLabels();
    drawTable();
  }

  var cellColor = function(d) {
    return _.isEmpty(d.color) ? 'none' : d.color;
  }

  var drawTable = function() {
    var heatmap = builder.svg().append('g').attr('class', 'heatmap-grid')
        .attr('transform', 'translate(' + builder.graphicMarginLeft() + ',' + builder.graphicMarginTop() + ')');

    // TODO: data[0].data again
    var rect  = heatmap.selectAll('g.heatmap .square').data(data[0].data);
    rect.enter().append('rect')
        .attr('class', 'square')
        .attr('fill', cellColor);
    rect
        .attr('x', function(d) { return x(d.xAxis);})
        .attr('y', function(d) { return y(d.yAxis);})
        .attr('rx', 0)
        .attr('ry', 0)
        .attr('width', x.rangeBand())
        .attr('height', y.rangeBand())
        .transition()
        .style('fill', cellColor);
    rect.exit().remove();

    // TODO: data[0].data again
    var value = heatmap.selectAll('g.heatmap-grid .cell.value').data(data[0].data);
    value.enter().append('text');
    value
        .attr('text-anchor', 'middle')
        .attr('x', function(d) { return x(d.xAxis);})
        .attr('y', function(d) { return y(d.yAxis);})
        .attr('dy', function() { return y.rangeBand()/2 + 4;})
        .attr('dx', function() { return x.rangeBand()/2;})
        .attr('class', 'cell value ' + config.cellFont + ' ' + config.cellFontColor)
        .text(function(d) {return d.value;} )
    value.exit().remove();
  };

  var drawLegend = function() {
    var legend = d3.charts.legend()
        .y(builder.legendMarginTop())
        .x(builder.legendMarginLeft());
    var color  = d3.scale.ordinal()
        .domain(_.map(config.legendData, function(d) {return d.name}))
        .range(_.map(config.legendData, function(d) {return d.color}));

    legend.y(builder.legendMarginTop()).x(builder.legendMarginLeft()).color(color);
    builder.svg().datum(_.map(config.legendData, function(d) { return d.name })).call(legend);
  }

  var drawRowColumnLabels = function() {
    var columns = builder.svg().append('g')
        .attr('class', 'top-nav')
        .attr('transform', 'translate(' + builder.graphicMarginLeft() + ',' + builder.marginTop() + ')');

    var rows = builder.svg().append('g')
        .attr('class', 'left-nav')
        .attr('transform', 'translate(' + builder.marginLeft() + ',' + builder.graphicMarginTop() + ')');

    if (config.topLabels) {
      var columnLabel = columns.selectAll('g.top-nav .text').data(x.domain());
      columnLabel.enter().append('svg:foreignObject').attr('class', 'text').append('xhtml:div')
          .attr('class', 'column-label ' + config.columnFont)
          .attr('style', 'height:' + config.margin.topLabel   + 'px; width:' +x.rangeBand()+ 'px;')
        .append('xhtml:div')
          .html(function(schema) {return schema;});;
      columnLabel
          .attr('width',  x.rangeBand())
          .attr('height', config.margin.topLabel  )
          .attr('x', function(d) {return x(d)})
          .attr('y', function(d) {return y(y.domain()[0])})
      columnLabel.exit().remove();
    }

    if (config.leftLabels) {
      var rowLabel = rows.selectAll('g.left-nav .text').data(y.domain());
      rowLabel.enter().append('svg:foreignObject').attr('class', 'text').append('xhtml:div')
          .attr('class', 'row-label ' + config.rowFont)
          .attr('style', 'height:' + y.rangeBand()   + 'px; width:' +168+ 'px;')
        .append('xhtml:div')
          .html(function(schema) {return schema;});;
      rowLabel
          // TODO remove hard code 168
          .attr('width', 168)
          .attr('height', y.rangeBand())
          .attr('x', function(d) {return x(x.domain()[0])})
          .attr('y', function(d) {return y(d)})
          // .attr('style', 'line-height:'+y.rangeBand()+'px')
      rowLabel.exit().remove();
    }
  }

  return builder;
};
if (d3.charts === null || typeof(d3.charts) !== 'object') { d3.charts = {}; }

d3.charts.stackedBuilder = function(selection, data, config) {
  'use strict';

  var builder = d3.charts.baseBuilder(selection, data, config),
      layers,
      layerData,
      barTextPadding = 50,
      y = d3.scale.ordinal(),
      x = d3.scale.linear(),
      xAxis = d3.svg.axis(),
      yAxis = d3.svg.axis(),
      color = d3.scale.ordinal(),
      format = d3.format('.3s'),
      stack = d3.layout.stack(),
      legend = d3.charts.legend();

  builder.draw = function() {
    var empty = _.isEmpty(data);

    setupMargins();
    builder.setupSvg();
    builder.setupChart();
    builder.setupGraphic();
    empty ? setupNoData() : setupData();

    config.vertical ? drawVertical() : drawHorizontal();
    if (config.titleOn) { builder.drawTitle(); }
    if (empty) { builder.drawNoDataLabel(); }
    if (config.legend) { drawLegend(); }
    if (config.chartArea) { builder.chartArea(); }
    if (config.graphicArea) { builder.graphicArea(); }
  };

  var setupMargins = function() {
    if (config.vertical) { config.margin.leftLabel = barTextPadding; }
  }

  var setupNoData = function() {
    layers = [];
    layerData = [];
    color.domain(['TBD']).range(['#E6E6E6']);
    y.domain(_.map(_.range(7), function(d) {return ('Label - ' + d)}));
    legend.color(color);
  }

  var setupData = function() {
    layers = stack(data);
    layerData = config.stackLabels ? _.flatten(layers) : lastLayer(layers) ;

    var yStackMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); }),
        yGroupMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y; }); }),
        padding = d3.utilities.padDomain(builder.graphicWidth(), yStackMax, barTextPadding);

    if (config.grouped) {
      padding = d3.utilities.padDomain(builder.graphicWidth(), yGroupMax, barTextPadding);
      x.domain([0, (yGroupMax + padding)]);
    }
    else {
      padding = d3.utilities.padDomain(builder.graphicWidth(), yStackMax, barTextPadding);
      x.domain([0, (yStackMax + padding)]);
    }

    y.domain(_.map(layers[0], function(d) { return d.x; }));
    color.domain(categories()).range(colors());
    legend.color(color);
  }

  var colors = function() {
    return _.reduce(layers, function(memo, d, i) {
      var color = d[0].color ? d[0].color : d3.utilities.stackColors[i];
      memo.push(color);
      return memo;
    }, []);
  }

  var categories = function() {
    if (_.isEmpty(layers)) {
      return ['TBD'];
    }
    return _.reduce(layers, function(memo, d) { memo.push(d[0].category); return memo}, []);
  }

  var barColor = function(d) {
    return _.isEmpty(d.color) ? color(d.category) : d.color;
  }

  var lastLayer = function(layers) {
    return _.isEmpty(layers) ? [] : _.last(layers);
  }

  var legendItems = function() {
    if (config.vertical && !config.grouped) {
      return categories().slice().reverse();
    }
    return categories();
  }

  var drawLegend = function() {
    legend.y(builder.legendMarginTop()).x(builder.legendMarginLeft());
    builder.svg().datum(legendItems()).call(legend);
  }

  var isInt = function(d) {
    return d % 1 === 0;
  }

  var textFormat = function(d) {
    var number = config.stackLabels ? d.y :  d.y + d.y0;

    if (isInt(number)) {
      if (number > 999) {
        return format(number);
      } else {
        return number;
      }
    } else {
      return format(number);
    }
  }

  var drawVertical = function() {
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
        .orient('right');

    vertical_xAxis.scale(verticalX)
        .tickSize(0)
        .orient('bottom');

    var gy = chart.append('g')
        .attr('class', 'vertical y axis number')
        .attr('transform', 'translate (-48,0)')
        .call(vertical_yAxis);

    gy.selectAll('g').classed('gridline', true);
    gy.selectAll('text').attr('x', 4).attr('dy', -4);

    var gx = chart.append('g')
      .attr('class', 'vertical x axis')
      .attr('transform', 'translate(0,' + chartHeight + ')')
      .call(vertical_xAxis);

    var layer = chart.selectAll('.layer')
        .data(layers)
        .enter().append('g')
        .attr('class', 'layer')
        .style('fill', function(d, i)  {return color(d[0].category); });

    if (config.grouped) {
      var n = layers.length;

      var rect = layer.selectAll("rect")
          .data(function(d) { return d; })
          .enter().append('rect')
          .attr("x", function(d, i, j) { return verticalX(d.x) + verticalX.rangeBand() / n * j; })
          .attr('fill', barColor)
          .attr("width", verticalX.rangeBand() / n)
      rect
          .transition()
          .delay(function(d, i) { return i * 40; })
          .attr("y", function(d) { return verticalY(d.y); })
          .attr("height", function(d) { return chartHeight - verticalY(d.y); });

      var text = layer.selectAll('.value')
        .data(function(d) { return d; })
        .enter().append('text')
        .attr('text-anchor', 'middle')
        .attr('y', function(d) { return (verticalY(d.y)) - 4 ; })
        .attr("x", function(d, i, j) { return verticalX(d.x) + verticalX.rangeBand() / n * j + (verticalX.rangeBand() / n)/2; })
        .attr('class','h_value')
        .text(textFormat);
    }
    else {
      var rect = layer.selectAll('rect')
          .data(function(d) { return d; })
          .enter().append('rect')
          .attr('y', chartHeight)
          .attr('x', function(d) { return verticalX(d.x); })
          .attr('height', 0)
          .attr('fill', barColor)
          .attr('width', verticalX.rangeBand())

      rect
          .transition()
          .delay(function(d, i) { return i * 40; })
          .attr('y', function(d) {return verticalY(d.y0 + d.y);})
          .attr('height', function(d) { return verticalY(d.y0) - verticalY(d.y0 + d.y)});

      var text = chart.selectAll('.value')
        .data(layerData)
        .enter().append('text')
        .attr('text-anchor', 'middle')
        .attr('y', function(d) {return (verticalY(d.y0 + d.y)) - 4 ; })
        .attr('x', function(d) { return verticalX(d.x)+verticalX.rangeBand()/2; })
        .attr('class','value')
        .text(textFormat);
    }
  }

  var drawHorizontal = function() {
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
        .orient('bottom');

    yAxis.scale(y)
        .tickSize(0)
        .tickPadding(10)
        .orient('left');

    chart.append('g')
        .attr('class', 'horizontal y axis')
        .call(yAxis);

    var gx = chart.append('g')
        .attr('class', 'horizontal x axis number')
        .attr('transform', 'translate(0,' + chartHeight + ')')
        .call(xAxis);
    gx.selectAll('g').classed('gridline', true);
    gx.selectAll('text').attr('x', 18)

    var layer = chart.selectAll('.layer')
        .data(layers)
        .enter().append('g')
        .attr('class', 'layer');

    if (config.grouped) {
      var n = layers.length;

      var rect = layer.selectAll("rect")
          .data(function(d) { return d; })
          .enter().append('rect')
          .attr("y", function(d, i, j) { return y(d.x) + y.rangeBand() / n * j; })
          .attr('fill', barColor)
          .attr("height", y.rangeBand() / n)
      rect
          .transition()
          .delay(function(d, i) { return i * 40; })
          .attr("x", 0)
          .attr("width", function(d) { return x(d.y); });

      var text = layer.selectAll('.value')
          .data(function(d) { return d; })
          .enter().append('text')
          .attr('x', function(d) { return x(d.y)+5; })
          .attr("y", function(d, i, j) { return y(d.x) + y.rangeBand() / n * j + (y.rangeBand() / n)/2 + 4;  })
          .attr('class','h_value')
          .text(textFormat);
    }
    else {
      var rect = layer.selectAll('rect')
          .data(function(d) { return d; })
          .enter().append('rect')
          .attr('x', 0)
          .attr('y', function(d) { return y(d.x); })
          .attr('width', 0)
          .attr('fill', barColor)
          .attr('height', y.rangeBand())

      rect
          .transition()
          .delay(function(d, i) { return i * 40; })
          .attr('x', function(d) { return x(d.y0); })
          .attr('width', function(d) { return x(d.y); });

      var text = chart.selectAll('.value')
          .data(layerData)
          .enter().append('text')
          .attr('x', function(d) { return x(d.y + d.y0)+5; })
          .attr('y', function(d) { return y(d.x)+y.rangeBand()/2+4; })
          .attr('class','value')
          .text(textFormat);
    }
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
      categories,
      subcategories;

  builder.draw = function() {
    var empty = _.isEmpty(data);

    builder.setupSvg();
    builder.setupChart();
    builder.setupGraphic();
    empty ? setupNoData() : setupData();

    drawTable();

    if (config.titleOn) { builder.drawTitle(); }
    if (empty) { builder.drawNoDataLabel(); }
    if (config.svgArea) { builder.svgArea(); }
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
    d3.select('#popup').remove();

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

    zoomLine.interpolate('cardinal').tension(0.88)
        .x(function(d) { return zoomX(d.date); })
        .y(function(d) { return zoomY(d.value); });

    var zoom = builder.svg().append('g')
        .attr('transform', 'translate(' + (builder.graphicMarginLeft() + padding) + ',' +  (builder.graphicMarginTop() + padding) + ')')
        .attr('class', 'zoom')
        .attr('id', 'popup');

    zoom.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('rx', 8)
        .attr('height', height)
        .attr('width', width)
        .attr('fill', 'white')
        .attr('stroke', 'lightgray')
        .attr('stroke-width', '1px');

    var radius = 12;
    var close = zoom.append('g')
        .attr('transform', 'translate(' + (width - radius - 18 ) + ',' + (radius + 18)+ ')');

    var closeit = function() {
      zoom.remove();
    }

    close.append('circle')
        .attr('fill', 'white')
        .attr('stroke', '#cccccc')
        .attr('r', '15')
        .on('click', closeit)

    close.append('line').attr('fill', 'none').attr('stroke', '#cccccc').attr('stroke-width', 2).attr('x1',-5).attr('y1',-5).attr('x2',5).attr('y2',5).on('click', closeit)
    close.append('line').attr('fill', 'none').attr('stroke', '#cccccc').attr('stroke-width', 2).attr('x1',5).attr('y1',-5).attr('x2',-5).attr('y2',5).on('click', closeit)

    var zoomTitle = zoom.append('g')
        .attr('transform', 'translate(' + padding + ',' + (padding + 10) + ')');

    zoomTitle.append('text')
        .attr('class', 'zoom-title')
        .text(d[0].category + ' - ' + d[1].subcategory);

    var xAxis = d3.svg.axis();
    var yAxis = d3.svg.axis();
    var zoomChart = zoom.append('g')
        .attr('transform', 'translate(' + chartPadding + ',' +  chartPadding + ')');

    xAxis.scale(zoomX).orient('bottom')
        .tickFormat(d3.utilities.customTimeFormat)
        .outerTickSize([0])
        .ticks(10);

    yAxis.scale(zoomY).orient('right').ticks(4);

    zoomChart.append('g')
        .attr('class', 'x axis number')
        .attr('transform', 'translate(0,' + zoomY(zoomY.domain()[0]) + ')')
        .call(xAxis);

    yAxis.tickSize(zoomWidth);

    var gy = zoomChart.append('svg:g')
        .attr('class', 'y axis number')
        .call(yAxis)

    gy.selectAll('g').classed('gridline', true);
    gy.selectAll('text').attr('x', -14).attr('dy', -4);

    zoomChart.append('svg:path')
        .attr('class', 'line')
        .style('stroke', 'steelblue')
        .attr('stroke-width', '2px')
        .attr('d', zoomLine(d));

    var currentPoint = zoomChart.append('g')
        .attr('class', 'large-label')
        .attr('transform', 'translate(' +  zoomX(current.date) + ',' +  zoomY(current.value) + ')');

    currentPoint.append('circle')
        .attr('class', 'circle')
        .style('fill', function(d) { return current.color; })
        .attr('stroke-width', '2')
        .attr('stroke', 'white')
        .attr('r', 18);

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
    el.append('text').attr('x', x).attr('y', y)
      .append('tspan')
        .text(text1)
      .append('tspan')
        .attr('x', 50)
        .text(text2);
  }

  var drawSparkline = function(category, subcategory) {
    var subData = (organizeData(category, subcategory)),
        lastData = _.last(subData);

    var focus = builder.graphic().append('g')
        .attr('class', 'mini-chart')
        .attr('transform', 'translate(' + x(subcategory) + ',' + y(category) + ')')

    line.interpolate('cardinal').tension(0.88)
        .x(function(d) { return miniX(d.date); })
        .y(function(d) { return miniY(d.value); });

    focus.append('rect')
        .attr('fill', '#EDEDED') //TODO to make click bind easier
        .attr('height', y.rangeBand())
        .attr('width', x.rangeBand())
        .on('click', function(d) {drawZoomSparkLine(subData)});

    focus.append('svg:path')
        .attr('class', 'line')
        .style('stroke', 'steelblue')
        .attr('d', line(subData));

    if (!_.isEmpty(lastData)) {
      focus.append('circle')
          .attr('class', 'circle')
          .style('fill', function(d) { return lastData.color; })
          .attr('cx', function(d) { return (miniX(lastData.date) - 1); }) // padding for circle
          .attr('cy', function(d) { return miniY(lastData.value); })
          .attr('r', 3);
    }
  }

  var organizeData = function(category, subcategory) {
    return _.select(data, function(d) { return d.category === category && d.subcategory === subcategory});
  }

  var drawRowColumnLabels = function() {
    var columns = builder.svg().append('g')
        .attr('class', 'top-nav')
        .attr('transform', 'translate(' + builder.graphicMarginLeft() + ',' + builder.marginTop() + ')')

    var rows = builder.svg().append('g')
        .attr('class', 'left-nav')
        .attr('transform', 'translate(' + builder.marginLeft() + ',' + builder.graphicMarginTop() + ')')

    if (config.topLabels) {
      var columnLabel = columns.selectAll('g.top-nav .text').data(x.domain());
      columnLabel.enter().append('svg:foreignObject').attr('class', 'text').append('xhtml:div')
          .attr('class', 'column-label ')// + columnFont)
          .attr('style', 'height:' + config.margin.topLabel  + 'px; width:' +x.rangeBand()+ 'px;')
        .append('xhtml:div')
          .html(function(schema) {return schema;});;
      columnLabel
          .attr('width',  x.rangeBand())
          .attr('height', config.margin.topLabel)
          .attr('x', function(d) {return x(d)})
          .attr('y', 0)
      columnLabel.exit().remove();
    }

    if (config.leftLabels) {
      var rowLabel = rows.selectAll('g.left-nav .text').data(y.domain());
      rowLabel.enter().append('svg:foreignObject').attr('class', 'text').append('xhtml:div')
          .attr('class', 'row-label ') //+ rowFont)
        .append('xhtml:div')
          .html(function(schema) {return schema;});;
      rowLabel
          // TODO remove hard code 168
          .attr('width',  168)
          .attr('height', y.rangeBand())
          .attr('x', 0)
          .attr('y', function(d) {return y(d)})
          .attr('style', 'line-height:'+y.rangeBand()+'px')
      rowLabel.exit().remove();
    }
  }

  return builder;
};
if (d3.charts === null || typeof(d3.charts) !== 'object') { d3.charts = {}; }

d3.charts.templateBuilder = function(selection, data, config) {
  'use strict';

  var builder = d3.charts.baseBuilder(selection, data, config),
      legend = d3.charts.legend(),
      x = d3.scale.ordinal(),
      y = d3.scale.ordinal();

  builder.draw = function() {
    var empty = _.isEmpty(data);

    builder.setupSvg();
    builder.setupChart();
    builder.setupGraphic();
    if (empty) { stubNoData(); }

    setupData();
    drawChart();

    if (empty) { builder.drawNoDataLabel(); }
    if (config.legend) { drawLegend(); }
    if (config.svgArea) { builder.svgArea(); }
    if (config.titleOn) { builder.drawTitle(); }
    if (config.chartArea) { builder.chartArea(); }
    if (config.graphicArea) { builder.graphicArea(); }
  };

  var stubNoData = function() {
  }

  var setupData = function() {
  }

  var drawChart = function() {
  }

  var drawLegend = function() {
  }

  return builder;
};
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
      clipUrl = 'clip-'+d3.utilities.s4(),
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
    builder.svg().append('defs').append('clipPath')
        .attr('id', clipUrl)
        .append('rect')
        .attr('width', builder.graphicWidth())
        .attr('height', builder.graphicHeight());
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
    xAxis.scale(x).orient('top').tickFormat(d3.utilities.customTimeFormat).outerTickSize([0]).ticks(8).tickSize(3).tickPadding(2);
    yAxis.scale(y).orient('right').ticks(8);

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
    line.interpolate('cardinal').tension(0.70)
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.value); });
    line2.interpolate('cardinal').tension(0.70)
        .x(function(d) { return x2(d.date); })
        .y(function(d) { return y2(d.value); });
  }

  var drawChart = function() {
    focus = builder.svg().append('g')
        .attr('class', 'chart1')
        .attr('transform', 'translate(' + builder.graphicMarginLeft() + ',' + builder.graphicMarginTop() + ')');

    // xAxis
    focus.append('g')
        .attr('class', 'x axis number')
        .attr('transform', 'translate(0,' + y(y.domain()[0]) + ')')
        .call(xAxis);

    // yAxis with huge ticks for gridlines
    yAxis.tickSize(builder.graphicWidth());

    var gy = focus.append('svg:g')
        .attr('class', 'y axis number')
        .call(yAxis);

    gy.selectAll('g').classed('gridline', true);
    gy.selectAll('text').attr('x', 4).attr('dy', -4);

    // Draw lines on the chart
    var chart = focus.append('g')
        .attr('class', 'chart');

    chart.selectAll('path').data(data).enter().append('path')
        .attr('clip-path', 'url(#'+clipUrl+')')
        .attr('class', 'line')
        .style('stroke', function(d) {return color(d.series)})
        .style('stroke-width', '2px')
        .attr('series', function(d) {return d.series})
        .attr('d', function(d,i) {return line(d.data); })

    if (config.dataPoints) {
      chart.selectAll('circle')
          .data(_.flatten(data, 'data')).enter().append('circle')
          .attr('class', 'circle')
          .attr('clip-path', 'url(#clip)')
          .style('stroke', function(d) { return d.color; })
          .attr('cx', function(d) { return x(d.date); })
          .attr('cy', function(d) { return y(d.value); })
          .attr('r', dataRadius);
    }
  }

  var brushing = function() {
    x.domain(brush.empty() ? x2.domain() : brush.extent());

    focus.selectAll('g.chart path').data(data).attr('d', function(d) {return line(d.data);});
    focus.selectAll('circle').data(_.flatten(data, 'data'))
        .attr('cx', function(d) { return x(d.date); })
        .attr('cy', function(d) { return y(d.value); });

    focus.select('.x.axis').call(xAxis);
  }

  var drawControls = function() {
    var controlHeight = builder.bottomLabel() - 13;
    var context = builder.svg().append('g')
        .attr('class', 'chart2')
        .attr('transform', 'translate(' + (builder.graphicMarginLeft() + handlePadding) + ',' + (builder.graphicMarginTop() + builder.graphicHeight()) + ')');

    y2.range([controlHeight, 0]);
    x2.range([0, builder.graphicWidth() - (handlePadding*2)]);
    xAxis2.scale(x2)
        .orient('bottom')
        .tickFormat(d3.utilities.customTimeFormat)
        .outerTickSize([0])
        .tickSize(2)
        .tickPadding(0)
        .ticks(12);

    brush.x(x2).on('brush', brushing);

    context.selectAll('path').data(data).enter().append('path')
        .attr('class', 'minor line')
        .style('stroke-width', '1px')
        .attr('d', function(d) {return line2(d.data); })

    context.append('g')
        .attr('class', 'x axis number')
        .attr('transform', 'translate(0,' + controlHeight  + ')')
        .call(xAxis2);

    var brushStart = x2.domain()[0];
    var brushEnd   = new Date();
    brush.extent([x2.domain()[0], x2.domain()[1]]);

    var gBrush = context.append('g')
        .attr('class', 'x brush')
        .call(brush)

    gBrush.selectAll('rect').attr('height', controlHeight);
    gBrush.selectAll('.resize').append('path').attr('d',function(d) {
      return d3.utilities.resizeHandles(d, controlHeight);
    });
  }

  var highlight = function(series) {
    var selection = 'g.chart1 [series=\'' + series + '\']';
    var highlight = focus.select(selection);
    var style = highlight.style('stroke-width') == '2px' ? '10px' : '2px';
    highlight.transition().style('stroke-width', style);
  }

  var drawLegend = function() {
    legend.click(highlight).y(builder.legendMarginTop()).x(builder.legendMarginLeft());
    builder.svg().datum(series).call(legend);
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
        right: 0,
        bottom: 0,
        left: 0,
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
      .config('legend', false)
      .config('titleOn', true)

  chart.svg =  function() { return svgContainer; }

  return chart;
};

if (d3.charts === null || typeof(d3.charts) !== 'object') { d3.charts = {}; }

this.d3.charts.bubble = function() {
  'use strict';

  var chart  = d3.charts.baseChart()
      .config('chartArea', false)
      .config('graphicArea', false)
      .config('legend', true)
      .config('leftLabels', true)
      .config('bottomLabels', true)
      .config('titleOn', true)
      .config('vertical', false)
      .config('className', 'bubble')
      .builder(d3.charts.bubbleBuilder);

  return chart;
};

if (d3.charts === null || typeof(d3.charts) !== 'object') { d3.charts = {}; }

this.d3.charts.heatmap = function() {
  'use strict';

  var chart  = d3.charts.baseChart()
      .config('svgArea', false)
      .config('chartArea', false)
      .config('graphicArea', false)
      .config('legend', false)
      .config('leftLabels', true)
      .config('bottomLabels', false)
      .config('topLabels', true)
      .config('titleOn', true)
      .config('width', 900)
      .config('height', 500)
      .config('fixedColumnWidth', false)
      .config('fixedRowHeight', false)
      .config('cellFont', 'small')
      .config('rowFont', 'small')
      .config('columnFont', 'small')
      .config('cellFontColor', 'white')
      .config('className', 'heatmap')
      .config('legendData', false)
      .builder(d3.charts.heatmapBuilder);

  return chart;
};

if (d3.charts === null || typeof(d3.charts) !== 'object') { d3.charts = {}; }

this.d3.charts.stacked = function() {
  'use strict';

  var chart  = d3.charts.baseChart()
      .config('chartArea', false)
      .config('graphicArea', false)
      .config('legend', true)
      .config('leftLabels', true)
      .config('bottomLabels', true)
      .config('titleOn', true)
      .config('vertical', false)
      .config('className', 'stacked')
      .config('grouped', true)
      .config('stackLabels', false)
      .builder(d3.charts.stackedBuilder);

  return chart;
};

if (d3.charts === null || typeof(d3.charts) !== 'object') { d3.charts = {}; }

this.d3.charts.tablechart = function() {
  'use strict';

  var chart  = d3.charts.baseChart()
      .config('svgArea', false)
      .config('chartArea', false)
      .config('graphicArea', false)
      .config('legend', false)
      .config('leftLabels', true)
      .config('bottomLabels', false)
      .config('topLabels', true)
      .config('titleOn', true)
      .config('chartType', 'line')
      .config('className', 'tablechart')
      .config('width', 900)
      .config('height',500)
      .builder(d3.charts.tablechartBuilder);

  return chart;
};

if (d3.charts === null || typeof(d3.charts) !== 'object') { d3.charts = {}; }

this.d3.charts.template = function() {
  'use strict';

  var chart  = d3.charts.baseChart()
      .config('svgArea', true)
      .config('chartArea', true)
      .config('graphicArea', true)
      .config('legend', true)
      .config('leftLabels', true)
      .config('bottomLabels', true)
      .config('topLabels', true)
      .config('titleOn', true)
      .config('className', 'template')
      .config('width', 900)
      .config('height',500)
      .builder(d3.charts.templateBuilder);

  return chart;
};

if (d3.charts === null || typeof(d3.charts) !== 'object') { d3.charts = {}; }

this.d3.charts.timeseries = function() {
  'use strict';

  var chart  = d3.charts.baseChart()
      .config('svgArea', false)
      .config('chartArea', false)
      .config('graphicArea', false)
      .config('legend', true)
      .config('leftLabels', false)
      .config('bottomLabels', true)
      .config('topLabels', false)
      .config('titleOn', true)
      .config('className', 'timeseries')
      .config('width', 900)
      .config('height',500)
      .config('dataPoints',false)
      .config('zoomOff', false)
      .builder(d3.charts.timeseriesBuilder);

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
        var tspan = el.append("tspan").text(d).attr("text-anchor", "middle");
        if (i > 0) {
          tspan.attr('dx',0).attr('dy', '15');
        }
      })
    }
  },

  // Generic function for checking property existence
  has: function has(obj, prop) {
    if (typeof(obj) == "object") {
     return Object.prototype.hasOwnProperty.call(obj, prop);
    }
  },

  dictionary: function(obj, prop, transform) {
    if (this.has(transform, prop) && !_.isEmpty(transform[prop])) {
      return obj[transform[prop]]
    }
    return obj[prop];
  },

  commonProperties: ['xAxis', 'yAxis', 'category', 'subcategory', 'value', 'trend', 'color', 'target'],

  transform: function(obj, transform) {
    var util = this;
    return _.reduce(util.commonProperties, function(memo, d) {
      var value = util.dictionary(obj, d, transform);
      if (value)  { memo[d] = util.dictionary(obj, d, transform); }
      return memo;
    }, {});
  },

  transformSet: function(set, transform) {
    var util = this;
    return _.map(set, function(d) {return util.transform(d, transform)});
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

  s4: function() {
  return Math.floor((1 + Math.random()) * 0x10000)
             .toString(16)
             .substring(1);
  },

  comma: d3.format(","),
}

