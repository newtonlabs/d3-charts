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
this.d3.charts.donut = function() {
  'use strict';
      var width = 960,
      height = 500,
      svg = {},
      margin = {top: 40, right: 10, bottom: 20, left: 100};

  function my(selection) {
    var chartWidth    = width  - margin.left - margin.right,
        chartHeight   = height - margin.top  - margin.bottom;

    selection.each(function(data) {
      var width = 960,
      height = 500,
      radius = Math.min(width, height) / 2;

      var color = d3.scale.ordinal()
          .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

      var arc = d3.svg.arc()
          .outerRadius(radius - 10)
          .innerRadius(radius - 70);

      var pie = d3.layout.pie()
          .sort(null)
          .value(function(d) { return d.population; });

      var svg = d3.select("body").append("svg")
          .attr("width", width)
          .attr("height", height)
        .append("g")
          .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

      var g = svg.selectAll(".arc")
          .data(pie(data))
        .enter().append("g")
          .attr("class", "arc");

      // console.log("arc", arc());

      g.append("path")
          .attr("d", function(d) {arc})
          .style("fill", function(d) { return color(d.data.age); });

      g.append("text")
          .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
          .attr("dy", ".35em")
          .style("text-anchor", "middle")
          .text(function(d) { return d.data.age; });
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
  titleMargin = {top: 30};

  function my(selection) {
    var chartWidth    = width  - margin.left - margin.right - 40,
        chartHeight   = height - margin.top  - margin.bottom - titleMargin.top,
        format = d3.format(".3s"),
        title  = d3.charts.chartTitle().title(titleText).subTitle(subTitleText);

    selection.each(function(data) {
      var stack = d3.layout.stack(),
          layers = stack(data),
          labels = _.map(layers[0], function(d) { return d.x; }),
          categories = _.reduce(layers, function(memo, d) { memo.push(d[0].category); return memo}, []),
          yStackMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); });

      var y = d3.scale.ordinal()
          .domain(labels)
          .rangeRoundBands([0, chartHeight], .2);

      var x = d3.scale.linear()
          .domain([0, yStackMax])
          .range([0, chartWidth]);

      var color = d3.scale.ordinal()
          .domain(categories)
          .range(d3.utilities.stackColors);

      var legend  = d3.charts.legend().color(color);

      svg = d3.select(this).append("svg")
          .attr("class", "groupStack")
          .attr("width",  chartWidth  + margin.left + margin.right)
          .attr("height", chartHeight + margin.top  + margin.bottom + titleMargin.top)

      title.x(16).y(margin.top);
      svg.call(title);

      var bar = svg.append("g")
          .attr("transform", "translate(" + margin.left + "," + (margin.top + titleMargin.top) + ")")
          .attr("class", "groupStack");

      var xAxis = d3.svg.axis()
          .scale(x)
          .tickSize(-chartHeight)
          .tickPadding(3)
          .tickFormat(format)
          .outerTickSize([0])
          .orient("bottom");

      var yAxis = d3.svg.axis()
          .scale(y)
          .tickSize(0)
          .orient("left");

      bar.append("g")
        .attr("class", "y axis")
        .call(yAxis);

      var gx = bar.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + chartHeight + ")")
        .call(xAxis);

      gx.selectAll("g").classed("gridline", true);
      gx.selectAll("text").attr("x", 18)

      var layer = bar.selectAll(".layer")
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

      rect
          .transition()
          .delay(function(d, i) { return i * 40; })
          .attr("x", function(d) { return x(d.y0); })
          .attr("width", function(d) { return x(d.y); });


      var text = layer.selectAll("text")
          .data(_.last(layers))
          .enter().append("text")
          .attr("x", function(d) { return x(d.y + d.y0)+5; })
          .attr("y", function(d) { return y(d.y)+y.rangeBand()/2+4; })
          .attr("class","value")
          .text(function(d, i) { return format(d.y+d.y0); });

     // Build the legend
      legend
          .y(titleMargin.top)
          .x(chartWidth + 30 + margin.right);

      svg.datum(categories).call(legend);
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

  return my;
};

/*jslint browser: true*/
/*global $, jQuery, d3, _*/

if (d3.charts === null || typeof(d3.charts) !== "object") { d3.charts = {}; }

// Based on http://bost.ocks.org/mike/chart/
this.d3.charts.heatmap = function() {
 'use strict';

  var width = 1024,
      height = 500,
      controlHeight = 30,
      svg = {},
      margin = {top: 10, right: 184, bottom: 20, left: 168},
      titleMargin = {top: 30},
      rowTitleMargin = {top: 60},
      titleText = "HEATMAP CHART EXAMPLE",
      subTitleText = "Subtext as needed";

    var topMargin  = function () {
      var grouped = true;
      var top = margin.top + titleMargin.top + rowTitleMargin.top;
      top += grouped ? controlHeight : 0;
      return top;
    };

  function my(selection) {
    var chartWidth    = width  - margin.left - margin.right,
        chartHeight   = height - topMargin() - margin.bottom,
        x  = d3.scale.ordinal().rangeRoundBands([0, chartWidth]),
        x2 = d3.scale.ordinal().rangeRoundBands([0, chartWidth]),
        y  = d3.scale.ordinal().rangeRoundBands([0, chartHeight]),
        title    = d3.charts.chartTitle().title(titleText).subTitle(subTitleText),
        categorySelect = {},
        heatmap  = {},
        columns  = {},
        meta     = {},
        controls = {},
        rows     = {};

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
          .html(function(schema) {return schema;});;
      columnLabel
          .attr("width",  x.rangeBand())
          .attr("height", rowTitleMargin.top)
          .attr("x", function(d) {return x(d)})
          .attr("y", function(d) {return y(y.domain()[0])})
          .attr("style", "line-height:"+ rowTitleMargin.top +"px")
      columnLabel.exit().remove();

      var rowLabel = rows.selectAll("g.left-nav .text").data(y.domain());
     rowLabel.enter().append("svg:foreignObject").attr("class", "text").append("xhtml:div")
          .html(function(schema) {return schema;});;
      rowLabel
          .attr("width",  margin.left)
          .attr("height", y.rangeBand())
          .attr("x", function(d) {return x(x.domain()[0])})
          .attr("y", function(d) {return y(d)})
          .attr("style", "line-height:"+y.rangeBand()+"px")
      rowLabel.exit().remove();
    }

    selection.each(function(data) {
      // Setup functions now that we have data
      var categories = d3.utilities.uniqueProperties(data, 'name');
      x2.domain(categories)

      // Function on what to do with data after visualization is interacted
      categorySelect = function(clicked) {
        controls.select(".selected").attr("class","")
        controls.select("[category=\""+clicked+"\"]").attr("class","selected")

        var chartData = _.find(data, function(d) {return d.name == clicked}).data;
        drawHeatmap(chartData);
        setMetaData(clicked);
      }

      // SVG Container
      svg = d3.select(this).append("svg")
          .attr("class", "heatmap")
          .attr("width",  chartWidth  + margin.left + margin.right)
          .attr("height", chartHeight + topMargin() + margin.bottom);

      // Chart title
      title.x(16).y(margin.top);
      svg.call(title);

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

      // Controls
      if (categories.length > 1) {
        drawControls(categories);
        drawHeatmap(data[0].data);
      }
      else {
        drawHeatmap(data[0].data);
      }
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
        .attr("y", function(d,i) {return (i * 25) + y})
        .attr("width", 14)
        .attr("height", 14)
        .style("fill", function(d) { return color(d); });

      if (click) {
        legendBox.selectAll("rect")
          .attr("style", "text-decoration: underline;cursor: pointer;")
          .on("click", click)
          .style("fill", function(d) { return color(d); });
      }

      legend.append("text")
        .attr("x", 20)
        .attr("y", function(d,i) {return (i * 25) + y + 7})
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(function(d) { return d; });
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
          .call(yAxis)

      gy.selectAll("g").classed("gridline", true);
      gy.selectAll("text").attr("x", 4).attr("dy", -4);

      // Gray zero line
      if (lowerDomain < 0) {
        var zeroLine = y(0),
          bottomLine = y(lowerDomain);

        focus.append("rect")
            .attr("class", "zeroline")
            .attr("x", 0)
            .attr("y", zeroLine)
            .attr("height", bottomLine - zeroLine)
            .attr("width", chartWidth)
      }

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
  stackColors: ['#85C1E9', '#00227D'],

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

