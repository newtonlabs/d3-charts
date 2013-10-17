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

