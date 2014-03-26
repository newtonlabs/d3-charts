    var bubbles = function(el) {
      var margin = {top: 0, right: 0, bottom: 0, left: 0},
            width = 480,
            height = 100,
            offSetX = 65,
            offSetY = 10,
            data = _.range(5),
            links = _.range(4),
            x = d3.scale.ordinal().domain(data).rangePoints([0,426], 1.0);


      var svg = d3.select(el).append("svg")
          .attr("width", width + margin.right + margin.left)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var bubbleSet = svg.append("g")
          .attr("transform", "translate(" + offSetX + "," + offSetY + ")");

      bubbleSet.selectAll("line").data(links).enter().append("line")
          .attr("x1", function(d, i) { return x(d) })
          .attr("y1", 0)
          .attr("x2", function(d, i) { return (x(data[i+1]))})
          .attr("y2", 0)
          .attr("class", 'bubble-link')

      bubbleSet.selectAll("circle").data(data).enter().append("circle")
          .attr("cx", function(d) { return x(d)})
          .attr("cy", 0)
          .attr("r", 10)
          .attr("stroke", 'red')

    }

    bubbles('#bubbles1');
    bubbles('#bubbles2');