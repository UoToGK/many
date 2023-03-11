// 默认参数
var options = options || {};

// 怎么实现 calss https://cloud.tencent.com/developer/news/172218
/** class 的construtor实际就是构造函数，里面的方法相当于是在构造函数的prototype基础上增加对应属性
 * @description
 * @author uoto
 * @date 2019-11-02
 * @class Animal
 */
class Animal {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
  getSound() {
    console.log("make some sound");
  }
}

// function Animal(name,age){
//     this.name=name;
//     this.age=age;
// }
// Animal.prototype.getSound()=function(){}
/** 这个方法就是去保证类是new使用
 * @description
 * @author uoto
 * @date 2019-11-02
 * @param {*} instance
 * @param {*} Constructor
 */
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _createClass() {
  function defineProperties(constructor, props) {
    for (let i = 0; i < props.length; i++) {
      const descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writeable = true;
      Object.defineProperties(constructor, descriptor);
    }
  }
  return (function(constructor, props, staticProps) {
    if (props) defineProperties(constructor.prototype, props); //共有方法在原型基础上
    if (staticProps) defineProperties(constructor, staticProps); //静态方法在构造函数上，实例无法调用
    return constructor;
  })();
}

function myCall(context) {
  // 1
  if (typeof this !== "function") {
    throw new TypeError("error");
  }
  // 2
  context = context || window;
  // 3
  context.fn = this;
  // 4
  const args = [...arguments].slice(1);
  // 5
  const result = context.fn(...args);
  // 6
  delete context.fn;
  return result;
}
Function.prototype.myCall = myCall;

Function.prototype.myApply = function(context) {
  if (typeof this !== "function") {
    throw new TypeError("Error");
  }
  context = context || window;
  context.fn = this;
  var result;
  if (arguments[1]) {
    result = context.fn(...arguments[1]);
  } else {
    result = context.fn();
  }
  delete context.fn;
  return result;
};

Function.prototype.myBind = function(context) {
  if (typeof this !== "function") {
    throw new TypeError("Error");
  }
  const _this = this;
  const args = [...arguments].slice(1);
  // 返回函数
  return function F() {
    // 1 判断是否用作构造函数
    if (this instanceof F) {
      return new _this(...args, ...arguments);
    }
    // 2 用作普通函数
    return _this.apply(context, args.concat(...arguments));
  };
};

Function.prototype.bind2 = function(context) {
  var self = this;
  var args = Array.prototype.slice.call(arguments, 1);
  var fNOP = function() {};
  var fBound = function() {
    var bindArgs = Array.prototype.slice.call(arguments);
    // 当作为构造函数时，this 指向实例，此时结果为 true，将绑定函数的 this 指向该实例，可以让实例获得来自绑定函数的值
    // 以上面的是 demo 为例，如果改成 `this instanceof fBound ? null : context`，实例只是一个空对象，将 null 改成 this ，实例会具有 habit 属性
    // 当作为普通函数时，this 指向 window，此时结果为 false，将绑定函数的 this 指向 context
    return self.apply(this instanceof fBound ? this : context, args.concat(bindArgs));
  };
  // 修改返回函数的 prototype 为绑定函数的 prototype，实例就可以继承绑定函数的原型中的值
  fNOP.prototype = this.prototype;
  //使用一个空函数进行中转吗，目的是在对返回函数进行原型链修改的时候，不会影响到我们绑定的函数
  fBound.prototype = new fNOP();
  return fBound;
};
// 还是用上述举例子
window.name = "window";
var obj = {
  name: "obj"
};
function Fun(p1, p2) {
  this.a = p1;
  this.b = p2;
  console.log(this.name);
  console.log(p1, p2);
}
var f1 = Fun.bind(obj, "str1");
f1("str2");

// 偏函数 partial(fn,args)
var _ = {};
function partial(fn) {
  var args = [].slice.call(arguments, 1);
  return function() {
    var position = 0,
      len = args.length;
    for (var i = 0; i < len; i++) {
      args[i] = args[i] === _ ? arguments[position++] : args[i];
    }
    while (position < arguments.length) args.push(arguments[position++]);
    return fn.apply(this, args);
  };
}
function add(a, b) {
  return a + b + this.value;
}

var subtract = function(a, b, c, d) {
  return b - a + c - d;
};
subFrom20 = partial(subtract, _, 20, _, 6);
console.log(subFrom20(5, 8));
