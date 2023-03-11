/** https://paddywang.github.io/2019/07/26/%E3%80%90Angular%E3%80%91%E4%B9%8B%20$inject%20%E5%AE%9E%E7%8E%B0%E5%8E%9F%E7%90%86(03)/
 * angular 的实现
为了简单，我们也按这三步来介绍angular DI

得到模块的依赖项
查找依赖项所对应的对象
执行时注入
注：以下代码行数有就可能变

1. 得到模块的依赖项
var ARROW_ARG = /^([^\(]+?)=>/;
var FN_ARGS = /^[^\(]*\(\s*([^\)]*)\)/m;
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

function extractArgs(fn) {
  var fnText = fn.toString().replace(STRIP_COMMENTS, ''),
      args = fnText.match(ARROW_ARG) || fnText.match(FN_ARGS);
  return args;
}
2. 查找依赖项所对应的对象
    function getService(serviceName, caller) {
      if (cache.hasOwnProperty(serviceName)) {
        if (cache[serviceName] === INSTANTIATING) {
          throw $injectorMinErr('cdep', 'Circular dependency found: {0}',
                    serviceName + ' <- ' + path.join(' <- '));
        }
        return cache[serviceName];
      } else {
        try {
          path.unshift(serviceName);
          cache[serviceName] = INSTANTIATING;
          return cache[serviceName] = factory(serviceName, caller);
        } catch (err) {
          if (cache[serviceName] === INSTANTIATING) {
            delete cache[serviceName];
          }
          throw err;
        } finally {
          path.shift();
        }
      }
    }
3. 执行时注入
得到参数：
    function injectionArgs(fn, locals, serviceName) {
      var args = [],
          $inject = createInjector.$$annotate(fn, strictDi, serviceName);

      for (var i = 0, length = $inject.length; i < length; i++) {
        var key = $inject[i];
        if (typeof key !== 'string') {
          throw $injectorMinErr('itkn',
                  'Incorrect injection token! Expected service name as string, got {0}', key);
        }
        args.push(locals && locals.hasOwnProperty(key) ? locals[key] :
                                                         getService(key, serviceName));
      }
      return args;
    }
调用
    function invoke(fn, self, locals, serviceName) {
      if (typeof locals === 'string') {
        serviceName = locals;
        locals = null;
      }

      var args = injectionArgs(fn, locals, serviceName);
      if (isArray(fn)) {
        fn = fn[fn.length - 1];
      }

      if (!isClass(fn)) {
        // http://jsperf.com/angularjs-invoke-apply-vs-switch
        // #5388
        return fn.apply(self, args);
      } else {
        args.unshift(null);
        return new (Function.prototype.bind.apply(fn, args))();
      }
    }
angular模块管理，深坑
angular在每次应用启动时，初始化一个Injector实例：

var injector = createInjector(modules, config.strictDi);

由此代码可以看出对每一个Angular应用来说，无论是哪个模块，所有的"provider"都是存在相同的providerCache或cache中

所以会导致一个被誉为angular模块管理的坑王的问题：
module 并没有什么命名空间的作用，当依赖名相同的时候，后面引用的会覆盖前面引用的模块。
 */

/**
 *  angular实现双向数据绑定使用了脏检查机制：

        脏检查机制：Angular将双向绑定转换为一堆watch表达式，然后递归这些表达式检查是否发生过变化，
        如果变了则执行相应的watcher函数（指view上的指令，如ng-bind，ng-show等或是{{}}）。等到model中的值不再发生变化，
        也就不会再有watcher被触发，一个完整的循环就完成了。
       脏检查机制的触发：Angular中在view上声明的事件指令，如：ng-click、ng-change等，会将浏览器的事件转发给$scope上相应的model的响应函数。
       等待相应函数改变model，紧接着触发脏检查机制刷新view。
       watch表达式：可以是一个函数、可以是$scope上的一个属性名，也可以是一个字符串形式的表达式。$watch函数所监听的对象叫做watch表达式。
       watcher函数：指在view上的指令（ngBind，ngShow、ngHide等）以及{{}}表达式，他们所注册的函数。每一个watcher对象都包括：监听函数，
       上次变化的值，获取监听表达式的方法以及监听表达式，最后还包括是否需要使用深度对比(angular.equals())
 */
/* *
// Angular中$compile源码分析 https://www.jb51.net/article/78813.htm

*/
