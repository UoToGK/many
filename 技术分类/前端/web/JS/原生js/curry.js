/**
 * 实现函数柯里化，函数传参可传单个或多个
 * 函数柯里化是把接受多个参数的函数变换成接受一个单一参数（最初函数的第一个参数）的函数，并且返回接受余下的参数而且返回结果的新函数的技术
 */

const curry = (fun, ...args) => {
  //当参数长度不满足时，继续执行柯里化，满足则执行fun
  return args.length < fun.length ? (...arguments) => curry(fun, ...args, ...arguments) : fun(...args);
};

function sum(a, b, c) {
  return a + b + c;
}

var res = curry(sum);

// console.log(res(2, 3, 5));
// console.log(res(2)(3, 5));
//[](https://juejin.im/post/5a96481d6fb9a0633f0e4cc1)
function wrap(fn) {
  var slice = Array.prototype.slice;
  _args = slice.call(arguments, 1);
  return function() {
    var _inargs = slice.call(arguments);
    return fn.apply(null, _args.concat(_inargs));
  };
}

var res2 = wrap(sum);

console.log(res2(2, 3, 5));
// console.log(res2(2)(3, 5));
