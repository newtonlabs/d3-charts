window.canvas.tree = function() {
  var data = canvas.data;
  var nodeHeight = 60;
  var nodeWidth = 155;
  var nodeCurve = 3;
  var nodeSpace = 250;
  var truncAmount = 25;
  var nodeColor = '#ffffff';
  var nodeColorSelected = 'lightyellow';
  var deltaX = 85;
  var deltaY = 25;
  var leafColor = d3.scale.ordinal().domain(_.range(4)).range([
    '#85d3e5',
    '#85d3e5',
    '#1d4e97',
    '#1d4e97',
    '#2f347d'])
  var margin = {top: 0, right: 0, bottom: 0, left: 0},
      width = 1100
      height = 650;

  var i = 0,
      duration = 450,
      root;

  var round = function(num) {
    return Math.round(num * 100) / 100
  }
  var changed = function(d) {
    return round(d.delta_response * 100);
  }
  var current = function(d) {
    return round(d.response * 100);
  }
  var changeColor = function(d) {
    return (d.change > 0) ? 'green' : 'red'
  }
  var isLeaf = function(d) {
    if (d.depth === 3) {
      return true;
    }
    return false;
  }
  var strokeWidth = function(d) {
    return isLeaf(d.target) ? 2.5 : 2.5;
  }
  var strokeColor = function(d) {
    return isLeaf(d.target) ? leafColor(d.target.importance) : "#252626";
  }
  var borderColor = function(d) {
    return isLeaf(d) ? leafColor(d.importance) : "#252626";
  }

  String.prototype.trunc = String.prototype.trunc ||
    function(n){
      return this.length>n ? this.substr(0,n-1)+'...' : this;
    };

  var greatGrandChildren = function(parent) {
    return _.map(_.where(data, function(d) {
      return d.type == parent.type && d.quality_aspect == parent.quality_aspect && d.question !== 'Overall'
    }), function(d) {
      return {
        name: d.question,
        response: current(d),
        change: changed(d),
        importance: d.importance
      }
  })};

  var grandChildren = function(parent) {
    return _.map(_.where(data, function(d) {
      return d.type == parent.type && d.question === 'Overall'
    }), function(d) {
      return {
        name: d.quality_aspect,
        response: current(d),
        change: changed(d),
        children: greatGrandChildren(d)
      }
  })};

  var children = function() {
    return _.map(_.where(data, function(d) {
      return d.quality_aspect === 'Metro' || d.quality_aspect === 'NGPT'
    }), function(d) {
      return {
        name: d.quality_aspect,
        response: current(d),
        change: changed(d),
        children: grandChildren(d)
      }
  })};

  var treeData = {
    name: 'Overall',
    response: '85',
    change: '5',
    children: children()
  }

  var draw = function() {
    root = treeData;
    root.x0 = height / 2;
    root.y0 = 0;

    function collapse(d) {
      if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
      }
    }

    root.children.forEach(collapse);
    update(root);
  }

  function click(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    isLeaf(d) ? console.log('d', d) : update(d);
  }

  function update(source) {
    // Compute the new tree layout.
    var nodes = tree.nodes(root).reverse(),
        links = tree.links(nodes);

    // Normalize for fixed-depth.
    nodes.forEach(function(d) {
      d.y = d.depth * nodeSpace;
    });

    // Update the nodes…
    var node = svg.selectAll("g.node")
        .data(nodes, function(d) { return d.id || (d.id = ++i); });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + (source.y0) + "," + (source.x0 - nodeHeight/2) + ")"; })
        .on("click", click);

    nodeEnter.append("rect")
        .attr('height', nodeHeight)
        .attr('width', nodeWidth)
        .attr('rx', nodeCurve)
        .attr('ry', nodeCurve)
        .attr('stroke-width', "2.5")
        .style("fill", color)

    nodeEnter.append("text")
        .attr("x", function(d) { return d.children || d._children ? 5 : 5; })
        .attr("y", function(d) { return 12 })
        .attr("dy", ".35em")
        .attr("text-anchor", function(d) { return d.children || d._children ? "start" : "start"; })
        .text(function(d) { return d.name.trunc(truncAmount); })
        .style("fill-opacity", 1e-6);

    nodeEnter.append("text")
        .attr("x", function(d) { return d.children || d._children ? 5 : 5; })
        .attr("y", function(d) { return 12 })
        .attr("dy", "1.2em")
        .attr("class", "response")
        .attr("text-anchor", function(d) { return d.children || d._children ? "start" : "start"; })
        .text(function(d) { return d.response + '%'; });

    var deltaBlock = nodeEnter.append("g")
        .attr("class","delta")
        .attr("transform", function(d) { return "translate(" + deltaX + "," + deltaY + ")"})

    deltaBlock.append("rect")
      .attr("height", 25)
      .attr("width", 60)
      .attr("x", 0)
      .attr("y", 0)
      .attr('stroke-width', "2.5")
      .style("fill", changeColor)

    var deltaDescription = deltaBlock.append("g")
        .attr("transform", function(d) { return "translate(" + 5 + "," + 0 + ")"})

    deltaDescription.append("line")
        .attr('stroke', 'white')
        .attr("x1", 6)
        .attr("x2", 6)
        .attr("y1", function(d) { return d.change >= 0 ? 22 : 3})
        .attr("y2", function(d) { return d.change >= 0 ? 10 : 15})
        .attr("stroke-width", 3)
        .attr("marker-end", "url(#triangle)")

    deltaDescription.append("text")
        .attr("x", 7)
        .attr("y", 0)
        .attr("dy", "1em")
        .attr("dx", ".3em")
        .attr("class", "delta")
        .attr("text-anchor", function(d) { return d.children || d._children ? "start" : "start"; })
        .text(function(d) { return d.change + '%'; });

    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + (d.y ) + "," + (d.x - nodeHeight/2) + ")"; });

    var color = function(d) {
      if (isLeaf(d)) {
        // return leafColor(d.importance);
        return nodeColor;
      }
      if (d._children == null) {
        return nodeColorSelected;
      }
      return nodeColor;
    }

    nodeUpdate.select("rect")
        .attr('height', nodeHeight)
        .attr('width', nodeWidth)
        .attr('rx', nodeCurve)
        .attr('ry', nodeCurve)
        .style("fill", color)
        .attr('stroke-width', "2.5")
        .attr("stroke", borderColor);

    nodeUpdate.select("text")
        .style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + source.y + "," + (source.x  - nodeHeight/2)+ ")"; })
        .remove();

    nodeExit.select("rect")
        .attr('rx', nodeCurve)
        .attr('ry', nodeCurve)
        .attr('height', nodeHeight)
        .attr('width', nodeWidth)

    nodeExit.select("text")
        .style("fill-opacity", 1e-6);

    // Update the links…
    var link = svg.selectAll("path.link")
        .data(links, function(d) { return d.target.id; });

    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("stroke", strokeColor )
        .attr("stroke-width", strokeWidth)
        .attr("d", function(d) {
          var o = {x: source.x0, y: source.y0};
          return diagonal({source: o, target: o});
        });

    // Transition links to their new position.
    link.transition()
        .duration(duration)
        .attr("d", diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
        .duration(duration)
        .attr("d", function(d) {
          var o = {x: source.x, y: source.y};
          return diagonal({source: o, target: o});
        })
        .remove();

    // Stash the old positions for transition.
    nodes.forEach(function(d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  var tree = d3.layout.tree()
      .size([height, width])
     // .nodeSize([nodeHeight, nodeWidth + 20])

  var diagonal = d3.svg.diagonal()
      .projection(function(d) { return [d.y, d.x]; });

  var svg = d3.select("#tree").append("svg")
      .attr("width", width + margin.right + margin.left)
      .attr("height", height + margin.top + margin.bottom)

  var newSvg =  d3.select("#marker").append("svg").attr("width", 500).attr("height",500);

  var triangle = svg.append("marker")
      .attr("id", "triangle")
      .attr('viewBox','0 0 10 10')
      .attr('refX', '0')
      .attr('refY', '5')
      .attr('markerUnits', 'strokeWidth')
      .attr('markerWidth', '3')
      .attr('markerHeight', '3')
      .attr('fill', 'white')
      .attr('orient', 'auto')

  triangle.append('path').attr('d','M 0 0 L 10 5 L 0 10 z')

  svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  draw();
}

window.canvas.tree();