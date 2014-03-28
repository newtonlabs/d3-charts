
window.canvas.tree = function() {
  var margin = {top: 30, right: 0, bottom: 30, left: 20},
      width = 1100 - margin.left - margin.right,
      barHeight = 60,
      barWidth = width * .8,
      data = canvas.data;
      // data = canvas['933f'].data;

  var i = 0,
      duration = 400,
      root;

  var tree = d3.layout.tree()
      .nodeSize([0, 60]);

  var diagonal = d3.svg.diagonal()
      .projection(function(d) { return [d.y, d.x]; });

  var svg = d3.select("#hiearchy_tree").append("svg")
      .attr("width", width + margin.left + margin.right)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var nodeColor = '#ffffff';
  var nodeColorSelected = '#E9F06E';
  var leafColor = d3.scale.ordinal().domain(_.range(4)).range(['#85d3e5', '#85d3e5', '#1d4e97', '#1d4e97', '#2f347d']);
  var isLeaf = function(d) { return d.depth === 3; }
  var round = function(num) { return Math.round(num * 100) / 100 }
  var changed = function(d) { return round(d.previous_quarter_response_delta * 100); }
  var current = function(d) { return round(d.response * 100); }
  var changeColor = function(d) { return (d.change > 0) ? 'green' : 'red' }
  var strokeWidth = function(d) { return isLeaf(d.target) ? 2.5 : 2.5; }
  var strokeColor = function(d) { return isLeaf(d.target) ? leafColor(d.target.importance) : "#252626"; }
  var borderColor = function(d) { return isLeaf(d) ? leafColor(d.importance) : "#252626"; }
  var getSiblings = function(d) { return _.where(tree.nodes(root), function(node) { return node.depth === d.depth && node.name !== d.name }); }
  var responseTotal = function(d) { return _.map(_.range(6), function(o) { return d["response_total_"+ (o+1)]}); }
  var collapseSiblings = function (d) { _.each(getSiblings(d), function(node) {collapse(node); } ) }
  var changeResponseTotal = function(d) { return _.map(_.range(6), function(o) { return d["change_response_total_"+ (o+1)]}); }

  var triangle = svg.append("marker")
        .attr("id", "triangle")
        .attr('viewBox','0 0 10 10')
        .attr('refX', '0')
        .attr('refY', '5')
        .attr('markerUnits', 'strokeWidth')
        .attr('markerWidth', '3')
        .attr('markerHeight', '3')
        .attr('fill', 'white')
        .attr('orient', 'auto');

  triangle.append('path').attr('d','M 0 0 L 10 5 L 0 10 z');

  var lineLink = d3.svg.line().interpolate("step-before")
     .x(function(d) { return d.x; })
     .y(function(d) { return d.y; });

  String.prototype.trunc = String.prototype.trunc ||
    function(n){
      return this.length>n ? this.substr(0,n-1)+'...' : this;
    };

  var greatGrandChildren = function(parent) {
    return _.map(_.where(data, function(d) {
      return d.type == parent.type && d.quality_aspect == parent.quality_aspect && d.question !== 'Overall'
    }), function(d) {
      return {
        x0: 0,
        y0: 0,
        type: d.type,
        name: d.question,
        response: current(d),
        responseTotal: responseTotal(d),
        changeResponseTotal: changeResponseTotal(d),
        change: changed(d),
        importance: d.importance
      }
  })};

  var grandChildren = function(parent) {
    return _.map(_.where(data, function(d) {
      return d.type == parent.type && d.question === 'Overall'
    }), function(d) {
      return {
        x0: 0,
        y0: 0,
        name: d.quality_aspect,
        response: current(d),
        responseTotal: responseTotal(d),
        changeResponseTotal: changeResponseTotal(d),
        change: changed(d),
        children: greatGrandChildren(d)
      }
  })};

  var children = function() {
    return _.map(_.where(data, function(d) {
      return d.quality_aspect === 'Metro' || d.quality_aspect === 'NGPT'
    }), function(d) {
      return {
        x0: 0,
        y0: 0,
        name: d.quality_aspect,
        response: current(d),
        responseTotal: responseTotal(d),
        changeResponseTotal: changeResponseTotal(d),
        change: changed(d),
        children: grandChildren(d)
      }
  })};

  var treeData = {
    name: 'Overall',
    response: '85',
    change: '5',
    x0: 0,
    y0: 0,
    children: children()
  }

  function collapse(d) {
    if (d.children) {
      d._children = d.children;
      d._children.forEach(collapse);
      d.children = null;
    }
  }

  root = treeData;
  root.children.forEach(collapse);
  update(root);

  function update(source) {
    var nodes = tree.nodes(root);
    var height = Math.max(500, nodes.length * barHeight + margin.top + margin.bottom);

    d3.select("svg").transition()
        .duration(duration)
        .attr("height", height);

    d3.select(self.frameElement).transition()
        .duration(duration)
        .style("height", height + "px");

    // Compute the "layout".
    nodes.forEach(function(n, i) {
      n.x = i * barHeight;
    });

    // Update the nodes…
    var node = svg.selectAll("g.node")
        .data(nodes, function(d) { return d.id || (d.id = ++i); });

    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
        .style("opacity", 1e-6);

    // Enter any new nodes at the parent's previous position.
    nodeEnter.append("rect")
        .attr("y", -barHeight / 2)
        .attr('rx', 3)
        .attr('ry', 3)
        .attr("height", barHeight - 5)
        .attr("width", barWidth)
        .style("fill", 'none')
        .on("click", click);

    var desc = nodeEnter.append('g')
        .attr("transform", function(d) { return "translate(" + 0 + "," + 1 + ")"; })
        .on("click", click);

    desc.append("text")
        .attr('y', 2)
        .attr("dy", 3.5)
        .attr("dx", 5.5)
        .attr("class", "response")
        .attr("text-anchor", function(d) { return d.children || d._children ? "start" : "start"; })
        .text(function(d) { return d.response + '%'; });

    desc.append("text")
        .attr('x', 170)
        .attr("dy", 3.5)
        .attr("dx", 5.5)
        .text(function(d) { return d.name; });

    var deltaBlock = desc.append("g")
        .attr("class", "delta")
        .attr("transform", function(d) { return "translate(" + 75 + "," + -23 + ")"})

    deltaBlock.append("rect")
        .attr("height", 40)
        .attr("width", 90)
        .attr('stroke', 'none')
        .attr('stroke-width', "2.5")
        .style("fill", changeColor)

    var deltaDescription = deltaBlock.append("g")
        .attr("transform", function(d) { return "translate(" + 5 + "," + 0 + ")"})

    deltaDescription.append("line")
        .attr('stroke', changeColor)
        .attr("x1", 6)
        .attr("x2", 6)
        .attr("y1", function(d) { return d.change >= 0 ? 25 : 14})
        .attr("y2", function(d) { return d.change >= 0 ? 24 : 15})
        .attr("stroke-width", 3)
        .attr("marker-end", "url(#triangle)")

    deltaDescription.append("text")
        .attr("x", 9)
        .attr("y", 4)
        .attr("dy", "1em")
        .attr("dx", ".3em")
        .attr("class", "delta")
        .attr("text-anchor", function(d) { return d.children || d._children ? "start" : "start"; })
        .text(function(d) { return d.change + '%'; });

    // Transition nodes to their new position.
    nodeEnter.transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
        .style("opacity", 1);

    node.transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
        .style("opacity", 1)
      .select("rect")
        .style("fill", color);

    // Transition exiting nodes to the parent's new position.
    node.exit().transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
        .style("opacity", 1e-6)
        .remove();

    // Update the links…
    var link = svg.selectAll("path.link")
        .data(tree.links(nodes), function(d) { return d.target.id; });

    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", function(d) {
          var o = {x: source.x0, y: source.y0};
          return diagonal({source: o, target: o});
        })
      .transition()
        .duration(duration)
        .attr("d", diagonal);

    // Transition links to their new position.
    link.transition()
        .duration(duration)
        .attr("d", function(d) {
          return lineLink([{x: d.source.y, y: d.source.x },{x: d.target.y, y: d.target.x }])
        });

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
        .duration(duration)
        .attr("d", function(d) {
          return lineLink([{x: d.source.y, y: d.source.x },{x: d.source.y, y: d.source.x }])
        })
        .remove();

    // Stash the old positions for transition.
    nodes.forEach(function(d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  function click(d) {
    collapseSiblings(d);
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    if (isLeaf(d)) {
      $('#parent').html(d.parent.name);
      $('#leaf').html(d.name);
      window.canvas.detailChart(d);
      makeActive($('.toptab')[0]);
      $('.toptab:first').tab('show');
      $('#detailChart').modal('show');
    }
    else {
      update(d);
    }
  }

  function color(d) {
    if (isLeaf(d)) {
      return nodeColor;
    }
    if (d._children == null) {
      return nodeColorSelected;
    }
    return nodeColor;
  }
}

window.canvas.tree();
