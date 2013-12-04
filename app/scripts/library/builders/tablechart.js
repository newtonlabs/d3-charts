if (d3.charts === null || typeof(d3.charts) !== 'object') { d3.charts = {}; }

d3.charts.tablechartBuilder = function(selection, data, config) {
  'use strict';

  var builder = d3.charts.baseBuilder(selection, data, config);



  builder.draw = function() {
    var empty = _.isEmpty(data);
    // builder.setupMargins();
    // builder.setupSvg();
    // builder.setupChart();
    // builder.setupGraphic();
    // empty ? builder.setupNoData() : builder.setupData();
    // config.vertical ? builder.drawVertical() : builder.drawHorizontal();
    // if (empty) { builder.drawNoData();   }
    // if (config.titleOn) { builder.drawTitle(); }
    // if (config.legend) { builder.drawLegend(); }
    // if (config.chartArea) { builder.chartArea(); }
    // if (config.graphicArea) { builder.graphicArea(); }
  };

  return builder;

};