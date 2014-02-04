var transform =  {
  xAxis: "region",
  yAxis: "state",
  value: "price"
};

var data = [{
  region: "us",
  state: "ga",
  category: "top 100",
  price: 100
},{
  region: "us",
  state: "ny",
  category: "top 100",
  price: 200
}];

var regression = [{
  xAxis: "us",
  yAxis: "ga",
  category: "top 100",
  value: 100
}];

var util = d3.utilities;

console.log("lookup the region by xAxis, should be us:", util.dictionary(data[0], "xAxis", transform));
console.log("lookup the region by category, should be top 100:", util.dictionary(data[0], "category", transform));
// Regressions
console.log("should work if transform not passed on legacy method, should be us:", util.dictionary(regression[0], "xAxis"));
console.log("should work if transform not passed on legacy method, should be us:", util.dictionary(regression[0], "xAxis", {}));
console.log("should work if transform not passed on legacy method, should be us:", util.dictionary(regression[0], "xAxis", undefined));

console.log('full transform', util.transform(data[0], transform));
console.log('set transform', util.transformSet(data, transform));
