// "use strict"
Date.prototype.format = function (fmt) {
    if (!fmt) fmt = "yyyy-MM-dd HH:mm:ss"
    var o = {
        "M+": this.getMonth() + 1,                 //月份 
        "d+": this.getDate(),                    //日 
        "h+": this.getHours(),                   //小时 
        "m+": this.getMinutes(),                 //分 
        "s+": this.getSeconds(),                 //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds()             //毫秒 
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
}
//Object.seal()方法封闭一个对象，阻止添加新属性并将所有现有属性标记为不可配置。当前属性的值只要可写就可以改变。

/**
 * Object.freeze() 方法可以冻结一个对象。一个被冻结的对象再也不能被修改；
 * 冻结了一个对象则不能向这个对象添加新的属性，不能删除已有属性，不能修改该对象已有属性的可枚举性、
 * 可配置性、可写性，以及不能修改已有属性的值。此外，冻结一个对象后该对象的原型也不能被修改。freeze() 返回和传入的参数相同的对象。
 * 严格模式会报错
 */

Object.freeze(Date.prototype);// not Object.freeze(Date) is Date.prototype!!!
Date.prototype.format = function () { }
// console.log(new Date().format('yyyy-MM-dd'))


/**
 * 
 * 我不希望非要等到事件停止触发后才执行，我希望立刻执行函数，然后等到停止触发 n 秒后，才可以重新触发执行。

想想这个需求也是很有道理的嘛，那我们加个 immediate 参数判断是否是立刻执行。

 * 【】（https://github.com/mqyqingfeng/Blog/issues/22）
 * @param {any} func 
 * @param {any} wait 
 * @param {any} immediate 是否立即执行
 * @returns 
 */
// 第四版
function debounce(func, wait, immediate) {

    var timeout;

    return function () {
        var context = this;
        var args = arguments;

        if (timeout) clearTimeout(timeout);
        if (immediate) {
            // 如果已经执行过，不再执行
            var callNow = !timeout;
            timeout = setTimeout(function () {
                timeout = null;
            }, wait)
            if (callNow) func.apply(context, args)
        }
        else {
            timeout = setTimeout(function () {
                func.apply(context, args)
            }, wait);
        }
    }
}


function partial(fn) {
    var args = [].slice.call(arguments, 1);
    console.log(args)
    return function () {
        var newArgs = args.concat([].slice.call(arguments));
        console.log(this)
        return fn.apply(this, newArgs);
    };
};
function add(a, b) {
    return a + b + this.value;
}

// var addOne = add.bind(null, 1);
var addOne = partial(add, 1);

var value = 1;
var obj = {
    value: 2,
    addOne: addOne
}
console.log(obj.addOne(2));
; // ???


var _ = {};

function partial(fn) {
    var args = [].slice.call(arguments, 1);
    return function () {
        var position = 0, len = args.length;
        for (var i = 0; i < len; i++) {
            args[i] = args[i] === _ ? arguments[position++] : args[i]
        }
        while (position < arguments.length) args.push(arguments[position++]);
        return fn.apply(this, args);
    };
};

var subtract = function (a, b) { return b - a; };
subFrom20 = partial(subtract, _, 20);

console.log(subFrom20(4));

var funcs = [], object = { a: 1, b: 1, c: 1 };
for (var key in object) {
    funcs.push(function () {
        console.log(key)
    });
}

funcs[0]()


var funcs = [], object = { a: 1, b: 1, c: 1 };
for (let key in object) {
    funcs.push(function () {
        console.log(key)
    });
}

funcs[0]()


var funcs = [], object = { a: 1, b: 1, c: 1 };
for (const key in object) {//在 for in 循环中，每次迭代不会修改已有的绑定，而是会创建一个新的绑定。
    funcs.push(function () {
        console.log(key)
    });
}

funcs[0]()