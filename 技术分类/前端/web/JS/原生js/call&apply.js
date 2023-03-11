/**
 * 动手实现apply，call
 */

Function.prototype.myCall = function() {
  let [context, ...args] = [...arguments];
  if (!context) {
    context = typeof window === undefined ? global : window;
  }
  //this 为当前函数
  context.f = this;
  let res = context.f(...args);
  delete context.f;
  return res;
};

Function.prototype.myApply = function() {
  let [context, ...args] = [...arguments];
  if (!context) {
    context = typeof window === undefined ? global : window;
  }
  context.f = this;
  let res = context.f(...args);
  delete context.f;
  return res;
};

Function.prototype.myBind = function(context, ...args) {
  if (!context) {
    context = typeof window === undefined ? global : window;
  }
  if (typeof this !== "function") {
    throw new TypeError("Error");
  }
  const _this = this;

  return function F() {
    // 1 判断是否用作构造函数
    if (this instanceof F) {
      return new _this(...args, ...arguments);
    }
    // 2 用作普通函数
    return _this.apply(context, args.concat(...arguments));
  };
};
