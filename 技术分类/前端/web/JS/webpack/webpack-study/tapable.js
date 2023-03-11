// [SyncHook](https://www.jianshu.com/p/273e1c9904d2) 钩子的使用
/**
 * SyncHook 为串行同步执行，不关心事件处理函数的返回值，在触发事件之后，会按照事件注册的先后顺序执行所有的事件处理函数。
 */
const { SyncHook } = require('tapable');

// 创建实例
let syncHook = new SyncHook(['name', 'age']);

// 注册事件
syncHook.tap('1', (name, age) => console.log('1', name, age));
syncHook.tap('2', (name, age) => console.log('2', name, age));
syncHook.tap('3', (name, age) => console.log('3', name, age));

// 触发事件，让监听函数执行
syncHook.call('panda', 18);

// 1 panda 18
// 2 panda 18
// 3 panda 18

/**
 * 在 tapable 解构的 SyncHook 是一个类，注册事件需先创建实例，创建实例时支持传入一个数组，数组内存储事件触发时传入的参数，
 * 实例的 tap 方法用于注册事件，支持传入两个参数，第一个参数为事件名称，
 * 在 Webpack 中一般用于存储事件对应的插件名称（名字随意，只是起到注释作用），
 * 第二个参数为事件处理函数，函数参数为执行 call 方法触发事件时所传入的参数的形参。

 * // 模拟 SyncHook 类
class SyncHook {
    constructor(args) {
        this.args = args;
        this.tasks = [];
    }
    tap(name, task) {
        this.tasks.push(task);
    }
    call(...args) {
        // 也可在参数不足时抛出异常
        if (args.length < this.args.length) throw new Error("参数不足");

        // 传入参数严格对应创建实例传入数组中的规定的参数，执行时多余的参数为 undefined
        args = args.slice(0, this.args.length);

        // 依次执行事件处理函数
        this.tasks.forEach(task => task(...args));
    }
}
 */

/**
  * 总结
    在 tapable 源码中，注册事件的方法 tab、tapSync、tapPromise 和
    触发事件的方法 call、callAsync、promise 都是通过 compile 方法快速编译出来的，
    我们本文中这些方法的实现只是遵照了 tapable 库这些 “钩子” 的事件处理机制进行了模拟，以方便我们了解 tapable，
    为学习 Webpack 原理做了一个铺垫，在 Webpack 中，这些 “钩子” 的真正作用就是将通过配置文件读取的插件与插件、加载器与加载器之间进行连接，
    “并行” 或 “串行” 执行，相信在我们对 tapable 中这些 “钩子” 的事件机制有所了解之后，再重新学习 Webpack 的源码应该会有所头绪。

  */
