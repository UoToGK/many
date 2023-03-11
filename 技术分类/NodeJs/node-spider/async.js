/**
 * [reference](https://www.cnblogs.com/jsjx-xtfh/p/9813124.html)
 */
var async = require("async");
var util = require("util");

//将一个Array中的元素，按照一定的规则转换，得到一个新的数组（元素个数不变)
var Arr = [1, 2, 3, 4, 5];
Arr[0] = (function (params) {
  setTimeout(() => {
    console.log(1);
  }, 1 * 1000);
  return 1;
})();
Arr[1] = (function (params) {
  setTimeout(() => {
    console.log(2);
  }, 2 * 1000);
  return 2;
})();
Arr[2] = (function (params) {
  setTimeout(() => {
    console.log(3);
  }, 3 * 1000);
  return 3;
})();
Arr[3] = (function (params) {
  setTimeout(() => {
    console.log(4);
  }, 4 * 1000);
  return 4;
})();
Arr[4] = (function (params) {
  setTimeout(() => {
    console.log(5);
  }, 5 * 1000);
  return 5;
})();

async.map(
  Arr,
  function (item, callback) {
    var _setValue = parseInt(item) + 1;
    callback(null, _setValue);
  },
  function (err, results) {
    console.log("map:" + results);
  }
);

//和map一样，但是同步执行  对于同步执行参考（https://hacpai.com/article/1538126239274）
async.mapSeries(
  Arr,
  function (item, callback) {
    callback(null, parseInt(item) - 1);
  },
  function (err, results) {
    console.log("mapSeries:" + results);
  }
);

//map限制并发个数
async.mapLimit(
  Arr,
  5,
  function (item, callback) {
    callback(null, parseInt(item) * 10);
  },
  function (err, results) {
    console.log("mapLimit:" + results);
  }
);
