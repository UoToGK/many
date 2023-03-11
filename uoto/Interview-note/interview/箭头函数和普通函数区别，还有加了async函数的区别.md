# 箭头函数和普通函数的区别

- 箭头函数是匿名函数，不能作为构造函数，不能使用new

```js
let FunConstructor = () => {
    console.log('lll');
}

let fc = new FunConstructor();// throw reference error
```

- 在调试的时候就会，如果匿名函数过多，不好追踪代码，箭头函数没有原型属性

```js
var a = ()=>{
  return 1;
}

function b(){
  return 2;
}

console.log(a.prototype);  // undefined
console.log(b.prototype);   // {constructor: ƒ}
```

- 箭头函数不绑定arguments，取而代之用rest参数...解决

```js
function A(a){
  console.log(arguments);
}
A(1,2,3,4,5,8);  //  [1, 2, 3, 4, 5, 8, callee: ƒ, Symbol(Symbol.iterator): ƒ]


let B = (b)=>{
  console.log(arguments);
}
B(2,92,32,32);   // Uncaught ReferenceError: arguments is not defined


let C = (...c) => {
  console.log(c);
}
C(3,82,32,11323);  // [3, 82, 32, 11323]
```

- 箭头函数不绑定this，会捕获其所在的上下文的this值，作为自己的this值

```js
var obj = {
  a: 10,
  b: () => {
    console.log(this.a); // undefined
    console.log(this); // Window {postMessage: ƒ, blur: ƒ, focus: ƒ, close: ƒ, frames: Window, …}
  },
  c: function() {
    console.log(this.a); // 10
    console.log(this); // {a: 10, b: ƒ, c: ƒ}
  }
}
obj.b();
obj.c();
```

```js
var obj = {
  a: 10,
  b: function(){
    console.log(this.a); //10
  },
  c: function() {
     return ()=>{
           console.log(this.a); //10
     }
  }
}
obj.b();
obj.c()();

```

- 箭头函数通过 call()  或   apply() 方法调用一个函数时，只传入了一个参数，对 this 并没有影响。

```js
let test = {
    a: 10,
    b: function(n) {
        let f = (n) => n + this.a;
        return f(n);
    },
    c: function(n) {
        let f = (n) => n + this.a;
        let m = {
            a: 20
        };
        return f.call(m,n);
    }
};
console.log(test.b(1));  // 11
console.log(test.c(1)); // 11
```

- 箭头函数不能当做Generator函数,不能使用yield关键字

## async 函数

- async同 Generator 函数一样，async 函数返回一个 Promise 对象，可以使用 then 方法添加回调函数。当函数执行的时候，一旦遇到 await 就会先返回，等到触发的异步操作完成，再接着执行函数体内后面的语句

- await 命令后面的 Promise 对象，运行结果可能是 rejected，所以最好把 await 命令放在 try...catch 代码块中。