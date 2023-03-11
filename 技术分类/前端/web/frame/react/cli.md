[react-cli](https://segmentfault.com/a/1190000019126657#articleHeader6)
```js
(function test() {
    setTimeout(function() {console.log(4)}, 0);
    new Promise(function executor(resolve) {
        console.log(1);
        for( var i=0 ; i<10000 ; i++ ) {
            i == 9999 && resolve();
        }
        console.log(2);
    }).then(function() {
        console.log(5);
    });
    console.log(3);
})()
// 1 2 3 5 4
/**
 * Promise.then是异步执行的，而创建Promise实例（executor）是同步执行的。
setTimeout的异步和Promise.then的异步看起来 “不太一样” ——至少是不在同一个队列中。
规范要求，onFulfilled必须在 执行上下文栈（execution context stack） 只包含 平台代码（platform code） 后才能执行。平台代码指 引擎，环境，Promise实现代码。实践上来说，这个要求保证了onFulfilled的异步执行（以全新的栈），在then被调用的这个事件循环之后。

规范的实现可以通过 macro-task 机制，比如setTimeout和 setImmediate，或者 micro-task 机制，比如MutationObserver或者process.nextTick。因为promise的实现被认为是平台代码，所以可以自己包涵一个task-scheduling队列或者trampoline。
*/
```

# [react 学习]（https://segmentfault.com/a/1190000011947214）
#[Node.js 进阶系列 可以看看](https://github.com/webfansplz/article)