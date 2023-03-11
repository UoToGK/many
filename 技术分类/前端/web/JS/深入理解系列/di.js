/** https://www.zhihu.com/question/22463207
 * Constructor DependencyInjector
 * @param {Object} - object with dependencies
 */
var DI = function(dependency) {
  this.dependency = dependency;
};

// Should return new function with resolved dependencies
DI.prototype.inject = function(func) {
  // Your code goes here
};
// 要注入的依赖
var deps = {
  dep1: function() {
    return "this is dep1";
  },
  dep2: function() {
    return "this is dep2";
  },
  dep3: function() {
    return "this is dep3";
  },
  dep4: function() {
    return "this is dep4";
  }
};

// 新建一个“注射器”
var di = new DI(deps);

// 注射
var myFunc = di.inject(function(dep3, dep1, dep2) {
  return [dep1(), dep2(), dep3()].join(" -> ");
});

// 测试
// Test.assertEquals(myFunc(), "this is dep1 -> this is dep2 -> this is dep3");
// 暴力美学
DI.prototype.inject = function(func) {
  var dependency = this.dependency;

  //返回的函数
  return function() {
    var funArr = [],
      newParm = [];

    // 解析函数参数
    var parmsArr = func
      .toString()
      .replace(
        /^function(?:\s|\r|\n)*\(([^\)]*)\)(?:.|\r|\n)*\{(?:.|\r|\n)*\}$/,
        "$1"
      )
      .split(/\s*,\s*/);
    console.log(parmsArr);
    var obj = {};

    //根据参数查找依赖
    for (var key in dependency) {
      if (parmsArr.indexOf(key) >= 0) {
        obj[key] = dependency[key];
        newParm.push(key);
      }
    }

    // 待注入的依赖函数定义
    for (var key in obj) {
      //console.log("var "+key+" = " + obj[key].toString()+";");
      funArr.push("var " + key + " = " + obj[key].toString() + ";");
    }

    // 注入依赖函数定义
    eval(
      "var newfunc=" +
        func
          .toString()
          .replace(
            /^(function(?:.|\r|\n)*\{)((?:.|\r|\n)*)(\})$/,
            "$1" + funArr.join("") + "$2$3"
          )
    );
    console.log(newfunc.toString());

    // 执行注入依赖后的函数
    return newfunc.apply(obj, newParm);
  };
};

DI.prototype.inject = function(func) {
  var deps = /^[^(]+\(([^)]+)/.exec(func.toString());

  //  构建参数绑定数组
  deps = deps
    ? deps[1].split(/\s?,\s?/).map(
        function(dep) {
          return this.dependency[dep];
        }.bind(this)
      )
    : [];

  // 通过apply将依赖参数传入函数
  return function() {
    return func.apply(this, deps);
  };
};
//  injector
var injector = {
  dependencies: {},
  register: function(key, value) {
    this.dependencies[key] = value;
  },
  resolve: function() {
    var func,
      deps,
      scope,
      args = [],
      self = this;
    // 该种情况是兼容形式，先声明
    if (typeof arguments[0] === "string") {
      func = arguments[1];
      deps = arguments[0].replace(/ /g, "").split(",");
      scope = arguments[2] || {};
    } else {
      // 反射的第一种方式
      func = arguments[0];
      deps = func
        .toString()
        .match(/^function\s*[^\(]*\(\s*([^\)]*)\)/m)[1] //
        .replace(/ /g, "")
        .split(",");
      scope = arguments[1] || {};
    }
    return function() {
      var a = Array.prototype.slice.call(arguments, 0);
      for (var i = 0; i < deps.length; i++) {
        var d = deps[i];
        args.push(
          self.dependencies[d] && d != "" ? self.dependencies[d] : a.shift()
        );
      }
      func.apply(scope || {}, args);
    };
  }
};

var injector = {
  dependencies: {},
  register: function(key, value) {
    this.dependencies[key] = value;
  },
  resolve: function(deps, func, scope) {
    var args = [];
    scope = scope || {};
    for (var i = 0; i < deps.length, (d = deps[i]); i++) {
      if (this.dependencies[d]) {
        //区别就在这里了，直接将依赖加到scope上
        //这样就可以直接在函数作用域中调用了
        scope[d] = this.dependencies[d];
      } else {
        throw new Error("Can't resolve " + d);
      }
    }
    return function() {
      func.apply(scope || {}, Array.prototype.slice.call(arguments, 0));
    };
  }
};
class Injector {
  constructor(dependencies) {
    this.dependencies = dependencies;
  }
  register(key, value) {
    this.dependencies[key] = value;
  }
}
