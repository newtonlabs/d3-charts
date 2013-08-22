/*jslint browser: true*/
/*global $, jQuery, d3, _*/

if (d3.charts === null || typeof(d3.charts) !== "object") { d3.charts = {}; }

// Based on http://bost.ocks.org/mike/chart/
this.d3.charts.heatmap = function() {
 'use strict';

  var width = 960,
    height = 500,
    controlHeight = 50,
    margin = { top: 50, right: 0, bottom: 100, left: 130 },
    color = ["red","green","yellow"], // alternatively colorbrewer.YlGnBu[9]
    buckets = 3;

  function my(selection) {
    var chartWidth   = width  - margin.left - margin.right,
        chartHeight  = height - margin.top  - margin.bottom,
        chartHeight2 = controlHeight;

        // x  = d3.time.scale().range([0, chartWidth]),
        // x2 = d3.time.scale().range([0, chartWidth]),
        // y  = d3.scale.linear().range([chartHeight, 0]),
        // y2 = d3.scale.linear().range([chartHeight2, 0]),
        // xAxis  = d3.svg.axis().scale(x).orient("bottom"),
        // xAxis2 = d3.svg.axis().scale(x2).orient("bottom"),
        // yAxis  = d3.svg.axis().scale(y).orient("left");


    selection.each(function(data) {
      console.log(data);
      // Maybe a scale here?
      var gridSize     = Math.floor(chartWidth / data[0].data.length);
      var legendElementWidth = gridSize*2;

      var svg = d3.select(this).append("svg")
        .attr("width",  chartWidth  + margin.left + margin.right)
        .attr("height", chartHeight + margin.top  + margin.bottom);

      svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .append("rect")
        .attr("height", chartHeight)
        .attr("width", chartWidth)
        .attr("style", "fill:blue;stroke:gray;stroke-width:2;fill-opacity:0.1;stroke-opacity:0.9");


        //     rows = this.getRows(Object.keys(data[0])),
        //     columns = this.getColumns(data);

      //   for(var j=0; j<rows.length; j++){
      //     var heatMap = svg.selectAll(".cell"+j)
      //       .data(data)
      //       .enter().append("rect")
      //       .attr("x", function(d,i) { return i * gridSize; })
      //       .attr("y", function(d,i) { return j * gridSize; })
      //       .attr("rx", 10)
      //       .attr("ry", 10)
      //       .attr("class", "cell bordered")
      //       .attr("width", gridSize)
      //       .attr("height", gridSize)
      //       // .style("fill", colors[0]);
      //       .style("fill", function(d) {
      //         return "green";
      //       });
      //   }


      //   return svg;
      // },
      // getRows:function(data){
      //   var arr = [];
      //   for(var i=0; i<data.length; i++){
      //     if(data[i]!== "id" && data[i]!=="name"){
      //       arr.push(data[i])
      //     }
      //   }
      //   return arr;
      // },
      // getColumns:function(data){
      //   var arr = [];
      //   for(var i=0; i<data.length; i++){
      //     arr.push(data[i].name);
      //   }
      //   return arr;
      // },
      // updateColor:function(item){
      //   item.selectAll(".cell").transition().duration(1000).style("fill","red");
      // },
      // updateDimensions: function(w,h){
      //   svg.attr("width",w).attr("height",h);
      // }
    // };

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

  return my;
};
