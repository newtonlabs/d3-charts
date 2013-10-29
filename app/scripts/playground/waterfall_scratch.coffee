# Waterfall.coffee

# window.waterfall = class Waterfall
# #### Declare the globals
# In the future the config object can be persisted outside of this context
chart = undefined
config =
  svg: undefined
  w:   400
  h:   4000
  align: 'horizontal'

# #### Perform operations on the data set to prepare the configuration object
# used to do precalculations on the data and hold htem in a hash. Central
# place so all the data can be referenced quickly in the future
createConfig = (data) ->
  config.minMax      = waterfallMinMax(sanitize data)
  config.minMaxUnits = [0, _.max([Math.abs(config.minMax[0]), Math.abs(config.minMax[1])])]
  config.axis =
    x1: config.w / 2
    y1: 0
    x2: config.w / 2
    y2: config.h

# #### Create a chart object to hold the SVG elemengs
createChart = ->
  chart = d3.select("#waterfall").append("svg:svg").attr("width", config.w).attr("height", config.h)

# #### Calculate min/max
# Must perform increments and decrements on every value to understand what the
# total max or min will be
waterfallMinMax = (data) ->
  max = data[0]
  min = data[0]
  _.reduce(data, (memo, d) ->
    runningTotal = memo + d
    if (max < runningTotal)
      max = runningTotal
    if (min > runningTotal)
      min = runningTotal
    runningTotal
  , 0)
  [min, max]

# #### Clean up the data
# Get just the numeric values and convert to numbers
sanitize = (data) ->
  _.map(_.reject(data, (d) -> isNaN(d.series)), (d) -> +d.series)

# #### Aggregate all the data to an index
aggregateTo = (i, data) ->
  _.reduce(sanitize(data.slice(0, i+1)), (memo, d) ->
    memo + +d
  , 0)

# #### Parse in some sample Data
# keeping the data clean and abstracted at the moment.  Using a CSV file to show it is not
# attached to the d3 objects
d3.csv("../data/test.csv", (d) -> waterfall d)

# #### The main waterfall routine
# acts as the control point for the rest of the drawing
waterfall = (data) ->
  createConfig data
  createChart()
  axis data
  bars data

# #### Create the Axis
# For now we will create an axis in the middle for simplicity
# Typical enter update exit pattern.  Notice not appending b/c this will run once
axis = (data) ->
  chart.selectAll("line").data([1]).enter().insert("line")
    .attr("x1", config.axis.x1)
    .attr("y1", config.axis.y1)
    .attr("x2", config.axis.x2)
    .attr("y2", config.axis.y2)
    .attr("stroke", "#ccc")

# #### barWdith
# determines the width of the waterfall bar
barWidth = (data, i, scale) ->
  if isNaN(data[i].series)
    scale(Math.abs(aggregateTo(i,data)))
  else
    scale(Math.abs(+data[i].series))

# #### Find the starting location of the bar using recursion
barStartEnd = (data, i, scale) ->
  barWidthPixels = barWidth(data, i, scale)
  axis = config.w/2

  if (i == 0 or isNaN(data[i].series))
    total  = aggregateTo(i, data)
    if total > 0
      [axis, axis + barWidthPixels]
    else
      [axis - barWidthPixels, axis]
  else
    previousBar = barStartEnd(data, i - 1, scale)
    previousBarStart = previousBar[0]
    previousBarEnd   = previousBar[1]
    previousBarData  = +data[i-1].series

    if (isNaN(previousBarData) or previousBarData < 0)
      if data[i].series > 0
        [previousBarStart, previousBarStart + barWidthPixels]
      else
        [previousBarStart - barWidthPixels, previousBarEnd]
    else
      if data[i].series > 0
        [previousBarEnd, previousBarEnd + barWidthPixels]
      else
        [previousBarEnd - barWidthPixels, previousBarEnd]


# #### Create the bars for the chart
# Still using enter insert until we get morphing data.
# IF this was changing data then we would want an update and an append
# IF this had removing data then we would want an remove
bars = (data) ->
  axis = config.w / 2
  # An ordinal scale maps non-calc values to a range. Bounds creates boundaries for nice
  # rectangles
  ybars = d3.scale.ordinal().domain(_.range(data.length)).rangeBands([0, config.h], .2, .2)
  barWidthScale = d3.scale.linear().domain(config.minMaxUnits).rangeRound([0, axis])

  # Rects start in the upper left corner when drawing
  chart.selectAll("rect").data(data).enter().insert("rect")
    .attr("x", (d, i)     -> barStartEnd(data, i, barWidthScale)[0])
    .attr("y", (d, i)     -> ybars(i))
    .attr("width", (d, i) -> barWidth(data,i, barWidthScale))
    .attr("height", (d)   -> ybars.rangeBand())
    .attr("fill", "steelblue")




