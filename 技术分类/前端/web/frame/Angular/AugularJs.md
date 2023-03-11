## 了解 Angular 是解决什么问题的

- 试用它，熟悉大致有些什么功能
- 猜测一些主要细节的实现方式
- 自己山寨一下，看能不能做出来
- 始终做不出来，或者觉得做不好的地方，再去看源码对应的部分，其实它也未必比你写得好，一个上规模的项目，处处高质量是不可能的。

## [那么，Angular 中有哪些东西可以了解一下呢？](https://blog.csdn.net/cteng/article/details/72823190)

- 数据变更的监测方式有哪些，Angular 采用了什么，有什么好处，有什么坏处，如何处理数据变更中产生的异常？如何避免不收敛的数据变更？Knockout 和 Vue 分别怎么做的，他们为什么要这样做？
- 作用域树、作用域之间的继承、作用域上的事件、赋值分别是怎样实现的
- 表达式如何动态解析，如何避免不安全的表达式？
- 数据如何跟 DOM 建立关联？索引如何建立，如何确定唯一索引，如何显式指定索引？
- 常用的事件是如何封装的？
- 模块和依赖注入是怎么实现的？是否确有必要？

## [数据变更的监测方式有哪些](https://www.jb51.net/article/135510.htm)

- [要回答这个问题，首先你需要明白变更检测触发方式有哪些？或者说什么引起了变更检查](https://www.cnblogs.com/zhoulujun/p/8881414.html)
- 用户输入操作，比如点击，提交等
- 请求服务端数据(XHR)
- 定时事件，比如 setTimeout，setInterval
- 上述三种情况都有一个共同点，即这些导致绑定值发生改变的事件都是异步发生的。如果这些异步的事件在发生时能够通知到 Angular 框架，那么 Angular 框架就能及时的检测到变化。
- 对于 AngularJS 数据变更的检测方式，由于采用的是双向数据流，当发生数据变更时触发$digest循环，（手动是调用$Scope.$apply()方法触发），从$rootScope 开始循环检测遍历每一个 Watcher，比较 watcher function 返回值和之前保存的是否不同，不同则触发 listener；function(watcher)有 newValue 和 oldValue，oldvalue 应该被初始化，不应该是 undefined；

```
AngularJs 为 scope 模型上设置了一个 监听队列，用来监听数据变化并更新 view 。每次绑定一个东西到 view(html) 上时 AngularJs 就会往 $watch 队列里插入一条 $watch，用来检测它监视的 model 里是否有变化的东西。当浏览器接收到可以被 angular context 处理的事件时，$digest 循环就会触发。$digest 会遍历所有的 $watch。从而更新DOM。


```

- 以下是\$digest 代码

```js
 $digest: function() {
        var watch, value, last, fn, get,
            watchers,
            length,
            dirty, ttl = TTL,
            next, current, target = this,
            watchLog = [],
            logIdx, logMsg, asyncTask;

        beginPhase('$digest');
        // Check for changes to browser url that happened in sync before the call to $digest
        $browser.$$checkUrlChange();

        if (this === $rootScope && applyAsyncId !== null) {
          // If this is the root scope, and $applyAsync has scheduled a deferred $apply(), then
          // cancel the scheduled $apply and flush the queue of expressions to be evaluated.
          $browser.defer.cancel(applyAsyncId);
          flushApplyAsync();
        }

        lastDirtyWatch = null;

        do { // "while dirty" loop
          dirty = false;
          current = target;
            //把asyncQueue全部执行完，$evalAsync（）执行的代码放入asyncQueue
          while (asyncQueue.length) {
            try {
              asyncTask = asyncQueue.shift();
              asyncTask.scope.$eval(asyncTask.expression, asyncTask.locals);
            } catch (e) {
              $exceptionHandler(e);
            }
            lastDirtyWatch = null;
          }

          traverseScopesLoop:
          do { // "traverse the scopes" loop 遍历作用域
            if ((watchers = current.$$watchers)) {//赋给当前作用域的watchers
              // process our watches
              length = watchers.length;
              while (length--) {
                try {
                  watch = watchers[length];//取出每一个watcher
                  // Most common watches are on primitives, in which case we can short
                  // circuit it with === operator, only when === fails do we use .equals
                  if (watch) {
                    get = watch.get;
                    if ((value = get(current)) !== (last = watch.last) &&
                        !(watch.eq
                            ? equals(value, last)
                            : (typeof value === 'number' && typeof last === 'number'
                               && isNaN(value) && isNaN(last)))) {
                      dirty = true;//dirty为true，do-while就一直执行 检查
                      lastDirtyWatch = watch;
                      watch.last = watch.eq ? copy(value, null) : value;
                      fn = watch.fn;
                      fn(value, ((last === initWatchVal) ? value : last), current);
                      if (ttl < 5) {
                        logIdx = 4 - ttl;
                        if (!watchLog[logIdx]) watchLog[logIdx] = [];
                        watchLog[logIdx].push({
                          msg: isFunction(watch.exp) ? 'fn: ' + (watch.exp.name || watch.exp.toString()) : watch.exp,
                          newVal: value,
                          oldVal: last
                        });
                      }
                    } else if (watch === lastDirtyWatch) {//当前和上一次未变
                      // If the most recently dirty watcher is now clean, short circuit since the remaining watchers
                      // have already been tested.
                      dirty = false;
                      break traverseScopesLoop;//结束循环
                    }
                  }
                } catch (e) {
                  $exceptionHandler(e);
                }
              }
            }

            // Insanity Warning: scope depth-first traversal
            // yes, this code is a bit crazy, but it works and we have tests to prove it!
            // this piece should be kept in sync with the traversal in $broadcast
            if (!(next = ((current.$$watchersCount && current.$$childHead) ||
                (current !== target && current.$$nextSibling)))) {
              while (current !== target && !(next = current.$$nextSibling)) {
                current = current.$parent;//保证向下传播$broadcast
              }
            }
          } while ((current = next));

          // `break traverseScopesLoop;` takes us to here

          if ((dirty || asyncQueue.length) && !(ttl--)) {
            clearPhase();//脏检查超过10次就抛出错误
            throw $rootScopeMinErr('infdig',
                '{0} $digest() iterations reached. Aborting!\n' +
                'Watchers fired in the last 5 iterations: {1}',
                TTL, watchLog);
          }

        } while (dirty || asyncQueue.length);

        clearPhase();

        while (postDigestQueue.length) {
          try {
            postDigestQueue.shift()();
          } catch (e) {
            $exceptionHandler(e);
          }
        }
      },
```

## 优化

1. [dirty-checking]()
