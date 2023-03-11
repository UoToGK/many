# [Promise](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Using_promises) 对象用于表示一个异步操作的最终状态（完成或失败），以及该异步操作的结果值

## 编写Promise注意

```js
// 错误示例，包含 3 个问题
doSomething().then(function(result) {
  doSomethingElse(result) // 没有返回 Promise 以及没有必要的嵌套 Promise
  .then(newResult => doThirdThing(newResult));
}).then(() => doFourthThing());
// 最后是没有使用 catch 终止 Promise 调用链，可能导致没有捕获的异常
```

## 说明
- 第一个错误是没有正确地将事物相连接。当我们创建新 Promise 但忘记返回它时，会发生这种情况。因此，链条被打破，或者更确切地说，我们有两个独立的链条竞争（同时在执行两个异步而非一个一个的执行）。这意味着 doFourthThing() 不会等待 doSomethingElse() 或doThirdThing() 完成，并且将与它们并行运行，可能是无意的。单独的链也有单独的错误处理，导致未捕获的错误。

- 第二个错误是不必要地嵌套，实现第一个错误。嵌套还限制了内部错误处理程序的范围，如果是非预期的，可能会导致未捕获的错误。其中一个变体是 promise 构造函数反模式，它结合了 Promise 构造函数的多余使用和嵌套。

- 第三个错误是忘记用 catch 终止链。这导致在大多数浏览器中不能终止的 Promise 链里的 rejection

- 一个好的经验法则是总是返回或终止 Promise 链，并且一旦你得到一个新的 Promise，返回它。下面是修改后的平面化的代码：

```js
doSomething()
.then(function(result) {
  return doSomethingElse(result);
})
.then(newResult => doThirdThing(newResult))
.then(() => doFourthThing());
.catch(error => console.log(error));
```


#### 下面看一段代码,输出答案

```js
new Promise((resolve,reject)=>{
    console.log("promise1")
    resolve()
}).then(()=>{
    console.log("then11")
    new Promise((resolve,reject)=>{
        console.log("promise2")
        resolve()
    }).then(()=>{
        console.log("then21")
    }).then(()=>{
        console.log("then23")
    })
}).then(()=>{
    console.log("then12")
})
```
#### 解释： [参考](https://juejin.im/post/5c9a43175188252d876e5903#heading-2)
##### 第一轮

- current task: promise1是当之无愧的立即执行的一个函数，参考上一章节的executor，立即执行输出[promise1]
- micro task queue: [promise1的第一个then]

##### 第二轮

- current task: then1执行中，立即输出了then11以及新promise2的promise2
- micro task queue: [新promise2的then函数,以及promise1的第二个then函数]

##### 第三轮

- current task: 新promise2的then函数输出then21和promise1的第二个then函数输出then12。
- micro task queue: [新promise2的第二then函数]

##### 第四轮

- current task: 新promise2的第二then函数输出then23
- micro task queue: []

##### END
- 最终结果[promise1,then11,promise2,then21,then12,then23]。

- Promise的executor是一个同步函数，即非异步，立即执行的一个函数，因此他应该是和当前的任务一起执行的（就是说在同步任务的执行栈里）。而Promise的链式调用then，每次都会在内部生成一个新的Promise，然后执行then，在执行的过程中不断向微任务(microtask)队列推入新的函数，因此直至微任务(microtask)的队列清空后才会执行下一波的macrotask。

## async/await与promise的优先级详解
- 把它改成promise版本
```js
async function async1() {
    console.log("async1 start");
    await  async2();
    console.log("async1 end");
}
async  function async2() {
    console.log( 'async2');
}
// 用于test的promise，看看await究竟在何时执行
new Promise(function (resolve) {
    console.log("promise1");
    resolve();
}).then(function () {
    console.log("promise2");
}).then(function () {
    console.log("promise3");
}).then(function () {
    console.log("promise4");
}).then(function () {
    console.log("promise5");
});
```
##### promise版本
```js
function promise1(){
    return new Promise((resolve)=>{
        console.log("async1 start");
        promise2().then(()=>{
            console.log("async1 end");
            resolve()
        })
    })
}
function promise2(){
    return new Promise((resolve)=>{
        console.log( 'async2'); 
        resolve() 
    })
}

```

# 总结
- 希望按顺序执行，用一个promise用then顺序连接
- 期望两个异步执行完再返回结果，可以先判断两个异步是否有结果了再执行下一个promise