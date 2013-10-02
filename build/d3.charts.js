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
this.d3.charts.filter = function() {
  'use strict';
  var width = 960,
  height = 500,
  svg = {};

  function my(selection) {
    selection.each(function(data) {
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
      var width = 960,
      height = 500,
      svg = {},
      margin = {top: 40, right: 10, bottom: 20, left: 100};

  function my(selection) {
    var chartWidth    = width  - margin.left - margin.right,
        chartHeight   = height - margin.top  - margin.bottom;

    selection.each(function(data) {
      var stack = d3.layout.stack(),
          layers = stack(data),
          labels = _.map(layers[0], function(d) { return d.x; }),
          yStackMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); });

      var y = d3.scale.ordinal()
          .domain(labels)
          .rangeRoundBands([0, chartHeight], .08);

      var x = d3.scale.linear()
          .domain([0, yStackMax])
          .range([0, chartWidth]);

      var color = d3.scale.linear()
          .domain([0, layers.length - 1])
          .range(["#aad", "#556"]);

      var xAxis = d3.svg.axis()
          .scale(x)
          .tickSize(0)
          .tickPadding(6)
          .orient("bottom");

      var yAxis = d3.svg.axis()
          .scale(y)
          .tickSize(0)
          .tickPadding(6)
          .orient("left");

      svg = d3.select(this).append("svg")
          .attr("class", "groupStack")
          .attr("width",  chartWidth  + margin.left + margin.right)
          .attr("height", chartHeight + margin.top  + margin.bottom)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
          .attr("class", "groupStack");

      var layer = svg.selectAll(".layer")
          .data(layers)
        .enter().append("g")
          .attr("class", "layer")
          .style("fill", function(d, i) { return color(i); });

      var rect = layer.selectAll("rect")
          .data(function(d) { return d; })
        .enter().append("rect")
          .attr("x", 0)
          .attr("y", function(d) { return y(d.x); })
          .attr("width", 0)
          .attr("height", y.rangeBand())

      rect.transition()
          .delay(function(d, i) { return i * 10; })
          .attr("x", function(d) { return x(d.y0); })
          .attr("width", function(d) { return x(d.y); });

      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + chartHeight + ")")
        .call(xAxis);

      svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);
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
this.d3.charts.heatmap = function() {
 'use strict';

  var width = 960,
    height = 500,
    controlHeight = 50,
    svg = {},
    margin = { top: 140, right: 10, bottom: 10, left: 200 };

  // Rewrite with native reduce
  var uniqueProperties = function(data, property) {
    return _.reduce(data, function(memo, d) {
      if (! memo.filter(function(o) { return d[property] === o;}).length) {
        memo.push(d[property]);
      }
      return memo;
    },[]);
  };

  function my(selection) {
    var chartWidth    = width  - margin.left - margin.right,
        chartHeight   = height - margin.top  - margin.bottom,
        chartHeight2  = controlHeight;

    var drawHeatmap = function(heatmap, data) {
      var rows    = uniqueProperties(data, 'xAxis');
      var columns = uniqueProperties(data, 'yAxis');

      var x = d3.scale.ordinal().domain(rows).rangeRoundBands([0, chartWidth], 0, 0);
      var y = d3.scale.ordinal().domain(columns).rangeRoundBands([0, chartHeight], 0, 0);

      var yAxis = d3.svg.axis().scale(y).orient("left");
      var xAxis = d3.svg.axis().scale(x).orient("top");

      var rect  = heatmap.selectAll("g.heatmap rect").data(data);

      rect.enter().append("rect")
        .attr("class", "square")
        .attr("style", function(d) {return "fill:"+d.color});

      rect
        .attr("x", function(d) { return x(d.xAxis);})
        .attr("y", function(d) { return y(d.yAxis);})
        .attr("rx", 0)
        .attr("ry", 0)
        .attr("width", x.rangeBand())
        .attr("height", y.rangeBand())
        .transition().style("fill", function(d) {return d.color;});

      rect.exit().remove();

      var value = heatmap.selectAll("g.heatmap .cell.value").data(data);

      value.enter().append("text");

      value
        .attr("text-anchor", "middle")
        .attr("x", function(d) { return x(d.xAxis);})
        .attr("y", function(d) { return y(d.yAxis);})
        .attr("dy", function() { return y.rangeBand()/2;})
        .attr("dx", function() { return x.rangeBand()/2;})
        .attr('class', 'cell value')
        .text(function(d) {return d.value;} );

      value.exit().remove();

      heatmap.selectAll(".x.axis").data(rows).enter().append("g")
        .attr("class", "x axis");
      heatmap.select(".x.axis").transition().call(xAxis);

      heatmap.selectAll(".y.axis").data(rows).enter().append("g")
        .attr("class", "y axis");
      heatmap.select(".y.axis").transition().call(yAxis);

      heatmap.select(".y.axis")
        .selectAll("g")
          .append("svg:foreignObject")
              .attr("width",'150px')
              .attr("height",'40px')
              .attr("x", -160)
              .attr("y", -20)
              .attr("style","text-align: right;")
          .append("xhtml:div")
              .html(function(schema) {return schema;});

      heatmap.selectAll(".y.axis g text").remove();

    };

    var setMetaData = function(meta, clicked) {
      var category = meta.selectAll('category').data([clicked]);
      category.enter().append("category");
      category.text(function(d) { return d;});
    }

    selection.each(function(data) {
      var categories = uniqueProperties(data, 'name');
      var x2 = d3.scale.ordinal().domain(categories).rangeRoundBands([0, chartWidth], 0.2, 0.2);
      var invertx2 = d3.scale.quantize().domain([0, chartWidth]).range(categories);
      var xAxis2 = d3.svg.axis().scale(x2).orient("top").tickSize([0]);

      svg = d3.select(this).append("svg")
        .attr("class", "heatmap")
        .attr("width",  chartWidth  + margin.left + margin.right)
        .attr("height", chartHeight + margin.top  + margin.bottom);

      var heatmap = svg.append("g").attr("class", "heatmap")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var meta = svg.append("meta-data");

      var brushended = function() {
        if (!d3.event || !d3.event.sourceEvent) return; // only transition after input
        var clicked = invertx2(brush.extent()[0]);
        var brushStart = x2(clicked);
        var brushEnd   = brushStart + x2.rangeBand();

        var chartData = _.find(data, function(d) {return d.name == clicked}).data;

        drawHeatmap(heatmap, chartData);
        setMetaData(meta, clicked);

        d3.select(this).transition()
          .call(brush.extent([brushStart, brushEnd]))
          .call(brush.event);
      };

      var brush = d3.svg.brush()
        .x(x2)
        .on("brushend", brushended);

      drawHeatmap(heatmap, data[0].data);

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


/*jslint browser: true*/
/*global $, jQuery, d3, _*/

if (d3.charts === null || typeof(d3.charts) !== "object") { d3.charts = {}; }

// Based on http://bost.ocks.org/mike/chart/
this.d3.charts.timeseries = function() {
 'use strict';

  var width = 960,
    height = 500,
    controlHeight = 50,
    xAxisHeight = 30,
    margin = {top: 25,  right: 10, bottom: 100, left: 80},
    dataRadius = 4,
    svg = {};
    //color = d3.scale.category10();

  function my(selection) {
    var target;
    var hasTarget = function(){
      return typeof(target) !== 'undefined';
    }

    var padDomain = function(upperRange, upperDomain, pad) {
      return (pad / upperRange * upperDomain);
    }

    var chartWidth   = width  - margin.left - margin.right,
        chartHeight  = height - margin.top  - margin.bottom,
        chartHeight2 = controlHeight,
        x  = d3.time.scale().range([0, chartWidth]),
        x2 = d3.time.scale().range([0, chartWidth]),
        y  = d3.scale.linear().range([chartHeight, 0]),
        y2 = d3.scale.linear().range([chartHeight2, 0]),
        xAxis  = d3.svg.axis().scale(x).orient("bottom"),
        xAxis2 = d3.svg.axis().scale(x2).orient("bottom"),
        yAxis  = d3.svg.axis().scale(y).orient("left");

    selection.each(function(data) {
      var lowerDomain = d3.min(data, function(d) { return d3.min(d.data, function(c) {return c.value; }); });
      var upperDomain = d3.max(data, function(d) { return d3.max(d.data, function(c) {return c.value; }); });
      var padding = padDomain(y.range()[0], upperDomain, dataRadius * 2);

      x.domain(d3.extent(data[0].data, function(d) { return d.date; }));
      y.domain([lowerDomain - padding, upperDomain + padding]);
      x2.domain(x.domain());
      y2.domain(y.domain());

      var line = d3.svg.line()//.interpolate("basis")
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.value); });

      var line2 = d3.svg.line()//.interpolate("basis")
        .x(function(d) { return x2(d.date); })
        .y(function(d) { return y2(d.value); });

      if (typeof(data[0].data[0].target) !== 'undefined') {
        target = Number(data[0].data[0].target);
      }

      svg = d3.select(this).append("svg")
        .attr("class", "timeseries")  //for namespacing css
        .attr("width",  chartWidth  + margin.left + margin.right)
        .attr("height", chartHeight + margin.top  + margin.bottom);

      svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", chartWidth)
        .attr("height", chartHeight);

      var focus = svg.append("g")
        .attr("class", "chart1")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var brushing = function() {
        x.domain(brush.empty() ? x2.domain() : brush.extent());
        var dataInDomain = _.filter(data[0].data, function(d) {
          return (d.date >= x.domain()[0] && d.date <= x.domain()[1])
        })

        focus.selectAll("path").data(data).attr("d", function(d) {return line(d.data);});
        focus.selectAll("circle").data(data[0].data)
          .attr("cx", function(d) { return x(d.date); })
          .attr("cy", function(d) { return y(d.value); });

        // if (dataInDomain.length < 20) {
        //   focus.selectAll(".bubbletext").data(data[0].data)
        //     .attr("x", function(d) { return x(d.date);})
        //     .attr("y", function(d) { return y(d.value);})
        //     .text(function(d) {return d.value;} );
        // }
        // else {
        //   focus.selectAll(".bubbletext").data([]).exit().text("");
        // }

        focus.select(".x.axis").call(xAxis);
      }

      var brush = d3.svg.brush().x(x2)
        .on("brush", brushing);

      var context = svg.append("g")
        .attr("class", "chart2")
        .attr("transform", "translate(" + margin.left + "," + (chartHeight + margin.top + xAxisHeight)  + ")");

      focus.append("rect")
        .attr("class","focus")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", chartWidth)
        .attr("height", chartHeight)

      context.append("rect")
        .attr("class","context")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", chartWidth)
        .attr("height", chartHeight2)

      if (hasTarget()) {
        focus.append("line")
          .attr("class", "target")
          .attr("x1", 0)
          .attr("y1", y(target))
          .attr("x2", chartWidth)
          .attr("y2", y(target));
      }

      focus.selectAll("path").data(data).enter().append("path")
        .attr("clip-path", "url(#clip)")
        .attr("class", "line")
        .attr("d", function(d) {return line(d.data); });

      focus.selectAll("circle")
        .data(data[0].data).enter().append("circle")
        .attr("class", "circle")
        .attr("clip-path", "url(#clip)")
        .style("stroke", function(d) { return d.color; })
        .attr("cx", function(d) { return x(d.date); })
        .attr("cy", function(d) { return y(d.value); })
        .attr("r", dataRadius);

      // focus.selectAll("text")
      //   .data(data[0].data).enter().append("text")
      //   .attr("text-anchor", "middle")
      //   .attr("clip-path", "url(#clip)")
      //   .attr("x", function(d) { return x(d.date);})
      //   .attr("y", function(d) { return y(d.value);})
      //   .attr("class", "bubbletext")
      //   // .text(function(d) {return d.value;} );

      focus.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + chartHeight + ")")
        .call(xAxis);
          
      focus.append("svg:g")
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

      focus.selectAll(".y.axis g text").remove();          

      context.selectAll("path").data(data).enter().append("path")
        .attr("class", "timeline")
        .attr("d", function(d) { return line2(d.data); });

      context.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + chartHeight2 + ")")
        .call(xAxis2);

      var brushStart = x2.domain()[0];
      var brushEnd   = new Date();
      // brushEnd.setTime(brushStart.getTime() + (24 * 60 * 60 * 1000 * 30)); // 30 days
      brush.extent([x2.domain()[0], x2.domain()[1]]);

      context.append("g")
        .attr("class", "x brush")
        .call(brush)
        .selectAll("rect")
        .attr("height", chartHeight2);

      // brushing();

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

if (d3.utilities === null || typeof(d3.utilities) !== "object") { d3.utilities = {}; }

// Based on http://bost.ocks.org/mike/chart/
this.d3.utilities = {
  uniqueProperties: function(data, property) {
    return _.reduce(data, function(memo, d) {
      if (! memo.filter(function(o) { return d[property] === o;}).length) {
        memo.push(d[property]);
      }
      return memo;
    },[]);
  }
}