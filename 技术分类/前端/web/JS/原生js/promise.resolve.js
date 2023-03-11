/**
 * Promise.resolve(value)方法返回一个以给定值解析后的Promise 对象。
 * 但如果这个值是个thenable（即带有then方法），返回的promise会“跟随”这个thenable的对象，
 * 采用它的最终状态（指resolved/rejected/pending/settled）；如果传入的value本身就是promise对象，
 * 则该对象作为Promise.resolve方法的返回值返回；否则以该值为成功状态返回promise对象。
 * 
 * 参数
value
将被Promise对象解析的参数。也可以是一个Promise对象，或者是一个thenable。

返回值
返回一个解析过带着给定值的Promise对象，如果返回值是一个promise对象，则直接返回这个Promise对象。
 */

// 使用静态方法Promise.resolve
Promise.resolve("Success").then(function (value) {
  console.log(value); // "Success"
}, function (value) {
  // 不会被调用
});


// 对一个数组进行resolve
var p = Promise.resolve([1, 2, 3]);
p.then(function (v) {
  console.log(v[0]); // 1
});

// Resolve另一个promise对象
var original = Promise.resolve('我在第二行');
var cast = Promise.resolve(original);
cast.then(function (value) {
  console.log('value: ' + value);
});
console.log('original === cast ? ' + (original === cast) + "   " + (original instanceof Promise));


// Resolve一个thenable对象
var p1 = Promise.resolve({
  then: function (onFulfill, onReject) { onFulfill("fulfilled!"); }
});
console.log(p1 instanceof Promise) // true, 这是一个Promise对象

p1.then(function (v) {
  console.log(v); // 输出"fulfilled!"
}, function (e) {
  // 不会被调用
});

// Thenable在callback之前抛出异常
// Promise rejects
var thenable = {
  then: function (resolve) {
    throw new TypeError("Throwing");
    resolve("Resolving");
  }
};

var p2 = Promise.resolve(thenable);
p2.then(function (v) {
  // 不会被调用
}, function (e) {
  console.log(e); // TypeError: Throwing
});

// Thenable在callback之后抛出异常
// Promise resolves
var thenable = {
  then: function (resolve) {
    resolve("Resolving");
    throw new TypeError("Throwing");
  }
};

var p3 = Promise.resolve(thenable);
p3.then(function (v) {
  console.log(v); // 输出"Resolving"
}, function (e) {
  // 不会被调用
});

async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
}
async function async2() {
  console.log('async2');
}
async1()
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

/**
 一、Pomise.all的使用
常见使用场景 ： 多个异步结果合并到一起

Promise.all可以将多个Promise实例包装成一个新的Promise实例。用于将多个Promise实例，包装成一个新的Promise实例。

1.它接受一个数组作为参数。

2.数组可以是Promise对象，也可以是其它值，只有Promise会等待状态改变。

3.当所有的子Promise都完成，该Promise完成，返回值是全部值的数组。

4.如果有任何一个失败，该Promise失败，返回值是第一个失败的子Promise的结果。
如果我们 如果有多个异步请求，但是最终用户想要得到的是  多个异步结果合并到一起，Pomise.all

通常做法：
console.log('start');
  var result1,result2="";
  //settimeout 模拟异步请求1
  setTimeout(() => {
    result1="ok1"
  }, 2000);
  //settimeout 模拟异步请求2
  setTimeout(() => {
    result1="ok2"
  }, 3000);
  //等待 异步1 异步2结果
 var tempInterval= setInterval(()=>{
    if(result1&&result2){
      console.log('data result ok ,,, clearInterval')
      clearInterval(tempInterval);
    }
  },100)

Pomise.all的做法
  let p1 = new Promise((resolve, reject) => {
  resolve('成功了')
})

let p2 = new Promise((resolve, reject) => {
  resolve('success')
})

let p3 = Promse.reject('失败')

Promise.all([p1, p2]).then((result) => {
  console.log(result)               //['成功了', 'success']
}).catch((error) => {
  console.log(error)
})

Promise.all([p1,p3,p2]).then((result) => {
  console.log(result)
}).catch((error) => {
  console.log(error)      // 失败了，打出 '失败'
})

二、Pomise.race的使用
类似于Promise.all() ,区别在于 它有任意一个返回成功后，就算完成，但是 进程不会立即停止

常见使用场景：把异步操作和定时器放到一起，如果定时器先触发，认为超时，告知用户
 */