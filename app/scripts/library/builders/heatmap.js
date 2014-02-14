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