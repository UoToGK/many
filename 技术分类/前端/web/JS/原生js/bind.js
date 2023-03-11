/**
 *
 * 在默认情况下，使用 window.setTimeout() 时，this 关键字会指向 window （或global）对象。
 * 当类的方法中需要 this 指向类的实例时，你可能需要显式地把 this 绑定到回调函数，就不会丢失该实例的引用。
 *
 */
function LateBloomer() {
  this.petalCount = Math.ceil(Math.random() * 12) + 1;
}

// 在 1 秒钟后声明 bloom
LateBloomer.prototype.bloom = function() {
  setTimeout(this.declare.bind(this), 1000);
};

LateBloomer.prototype.declare = function() {
  console.log("I am a beautiful flower with " + this.petalCount + " petals!");
};

var flower = new LateBloomer();
flower.bloom();
/**
 * 偏函数
 */
function list() {
  return Array.prototype.slice.call(arguments);
}

function addArguments(arg1, arg2) {
  return arg1 + arg2;
}

var list1 = list(1, 2, 3); // [1, 2, 3]

var result1 = addArguments(1, 2); // 3

// 创建一个函数，它拥有预设参数列表。
var leadingThirtysevenList = list.bind(null, 37);

// 创建一个函数，它拥有预设的第一个参数
var addThirtySeven = addArguments.bind(null, 37);

var list2 = leadingThirtysevenList();
// [37]

var list3 = leadingThirtysevenList(1, 2, 3);
// [37, 1, 2, 3]

var result2 = addThirtySeven(5);
// 37 + 5 = 42

var result3 = addThirtySeven(5, 10);
// 37 + 5 = 42 ，第二个参数被忽略

/**
 * bind的polyfill
 * 问题1：此处为什么要判断 if (this.prototype) { 而不是直接指定 fNOP.prototype = this.prototype;?
 * 
我观察发现，Function.prototype也是个函数（有这个函数才有的Function 这个构造方法），也有bind方法，但没有prototype，
所以要加判断，其实不加也没毛病；

问题2：为什么此处要多一个 fNOP 作为中转函数？

答案： 本来bound.prototype = self.prototype
就可以将原属性集成过来了，但是这样两个对象属性都指向同一个地方，修改 bound.prototype 将会造成self.prototype 也发生改变，
这样并不是我们的本意。所以通过一个空函数 nop 做中转，能有效的防止这种情况的发生。

 */
if (!Function.prototype.bind) {
  Function.prototype.bind = function(oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5
      // internal IsCallable function
      throw new TypeError(
        "Function.prototype.bind - what is trying to be bound is not callable"
      );
    }

    var aArgs = Array.prototype.slice.call(arguments, 1),
      fToBind = this,
      fNOP = function() {},
      fBound = function() {
        // this instanceof fBound === true时,说明返回的fBound被当做new的构造函数调用
        return fToBind.apply(
          this instanceof fBound ? this : oThis,
          // 获取调用时(fBound)的传参.bind 返回的函数入参往往是这么传递的
          aArgs.concat(Array.prototype.slice.call(arguments))
        );
      };

    // 维护原型关系
    if (this.prototype) {
      // Function.prototype doesn't have a prototype property
      fNOP.prototype = this.prototype;
    }
    // 下行的代码使fBound.prototype是fNOP的实例,因此
    // 返回的fBound若作为new的构造函数,new生成的新对象作为this传入fBound,新对象的__proto__就是fNOP的实例
    fBound.prototype = new fNOP();

    return fBound;
  };
}

Function.prototype.bind = function(oThis) {
  if (typeof this !== "function") {
    // closest thing possible to the ECMAScript 5
    // internal IsCallable function
    throw new TypeError(
      "Function.prototype.bind - what is trying to be bound is not callable"
    );
  }

  var aArgs = Array.prototype.slice.call(arguments, 1),
    fToBind = this,
    fBound = function() {
      console.log("21:53", fBound, this, this instanceof fBound);
      return fToBind.apply(
        this instanceof fBound ? this : oThis,
        // 获取调用时(fBound)的传参.bind 返回的函数入参往往是这么传递的
        aArgs.concat(Array.prototype.slice.call(arguments))
      );
    };

  fBound.prototype = this.prototype; //直接赋值prototype

  return fBound;
};

function Foo() {
  this.name = "Lily";
}
Foo.prototype = { age: 90 };

var fn = Foo.bind({}, 123);

var p1 = new fn();
console.log(p1.age); // 90

fn.prototype.age = 70; // 不小心更改了 生成的函数的原型，导致原来的函数的原型也被修改
console.log(p1.age); // 70

var fn1 = Foo.bind({}, 1234);
var p2 = new fn1();
console.log(p2.age); // 70   原型链被修改了  被影响了 这不是我期望的结果

Function.prototype.bind2 = function(context) {
  var self = this;
  // 获取bind2函数从第二个参数到最后一个参数
  var args = Array.prototype.slice.call(arguments, 1);

  return function() {
    // 这个时候的arguments是指bind返回的函数传入的参数
    var bindArgs = Array.prototype.slice.call(arguments);
    return self.apply(context, args.concat(bindArgs));
  };
};

// Create by UOTO  eg
var value = 2;

var foo = {
  value: 1
};

function bar(name, age) {
  this.habit = "shopping";
  console.log(this.value); //尽管在全局和 foo 中都声明了 value 值，最后依然返回了 undefind，
  // 说明绑定的 this 失效了，如果大家了解 new 的模拟实现，就会知道这个时候的 this 已经指向了 obj。
  console.log(name);
  console.log(age);
}

bar.prototype.friend = "kevin";

var bindFoo = bar.bind(foo, "daisy");
//当返回的函数作为构造函数，this就会失效，此时this指向了构造函数出来的对象，即obj
var obj = new bindFoo("18");
// undefined
// daisy
// 18
console.log(obj.habit);
console.log(obj.friend);
// shopping
// kevin

// 第三版
Function.prototype.bind2 = function(context) {
  if (typeof this !== "function") {
    //调用方必须是函数
    throw new Error(
      "Function.prototype.bind - what is trying to be bound is not callable"
    );
  }
  var self = this; //获取调用方
  var args = Array.prototype.slice.call(arguments, 1); //获取bind2函数从第二个参数到最后一个参数
  var fNOP = function() {}; //直接修改 fBound.prototype 的时候，也会直接修改绑定函数的 prototype。这个时候，我们可以通过一个空函数来进行中转：
  var fBound = function() {
    // 这个时候的arguments是指bind返回的函数传入的参数
    var bindArgs = Array.prototype.slice.call(arguments);
    // 当作为构造函数时，this 指向实例，此时结果为 true，将绑定函数的 this 指向该实例，可以让实例获得来自绑定函数的值
    // 以上面的是 demo 为例，如果改成 `this instanceof fBound ? null : context`，实例只是一个空对象，将 null 改成 this ，实例会具有 habit 属性
    // 当作为普通函数时，this 指向 window，此时结果为 false，将绑定函数的 this 指向 context
    return self.apply(
      this instanceof fBound ? this : context,
      args.concat(bindArgs)
    );
  };
  // 修改返回函数的 prototype 为绑定函数的 prototype，实例就可以继承绑定函数的原型中的值
  fNOP.prototype = this.prototype;
  fBound.prototype = new fNOP(); //相当于object.create(this.prototype)
  return fBound;
};

/**
 * 用es6 很简单实现
 */

Function.prototype.myCall = function() {
  let [context, ...args] = [...arguments];
  if (!context) {
    context = typeof window === undefined ? global : window;
  }
  //this 为当前调用call函数
  context.f = this;
  let res = context.f(...args);
  delete context.f;
  return res;
};

//es3
Function.prototype.call2 = function(context) {
  var context = context || window;
  context.fn = this;

  var args = [];
  for (var i = 1, len = arguments.length; i < len; i++) {
    args.push("arguments[" + i + "]");
  }

  var result = eval("context.fn(" + args + ")"); //args 会自动调用 Array.toString() 这个方法

  delete context.fn;
  return result;
};

var foo = {
  value: 1
};
function bar() {
  console.log(this.value);
}
bar.call2(foo);

Function.prototype.apply = function(context, arr) {
  var context = Object(context) || window;
  context.fn = this;

  var result;
  if (!arr) {
    result = context.fn();
  } else {
    var args = [];
    for (var i = 0, len = arr.length; i < len; i++) {
      args.push("arr[" + i + "]");
    }
    result = eval("context.fn(" + args + ")");
  }

  delete context.fn;
  return result;
};
