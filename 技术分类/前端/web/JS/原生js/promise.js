/**
 * 手写promise
 * @param {*} constructor
 */

function myPromise(constructor) {
  let self = this;
  self.status = "pending"; // 定义状态改变前的初始状态
  self.value = undefined; // 定义状态为resolved时候的状态
  self.reason = undefined; // 定义状态为rejected时候的状态

  function resolve(value) {
    if (self.status === "pending") {
      // 两个函数判断等于pending, 保证了状态的改变是不可逆的
      self.value = value;
      self.status = "resolved";
    }
  }

  function reject(reason) {
    if (self.status === "pending") {
      // 两个函数判断等于pending, 保证了状态的改变是不可逆的
      self.value = reason;
      self.status = "rejected";
    }
  }

  // 捕获构造异常
  try {
    constructor(resolve, reject);
  } catch {
    reject(e);
  }
}

myPromise.prototype.then = function(onFullfilled, onRejected) {
  let self = this;
  switch (self.status) {
    case "resolved":
      onFullfilled(self.value);
      break;
    case "rejected":
      onRejected(self.reason);
      break;
  }
};

var p = new myPromise(function(resolve, reject) {
  resolve(1);
});

p.then(function(x) {
  console.log(x);
});
