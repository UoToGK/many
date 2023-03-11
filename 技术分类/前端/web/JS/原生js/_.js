function _() {
    let [args] = [...arguments];
    if (Array.isArray(args)) {
        return args.reverse()
    }
}
console.log(_([1, 2, 3]))

// 我们看看 underscore 是如何实现的：

var _ = function (obj) {
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
};

_([1, 2, 3]);
/**
 *
执行 this instanceof _，this 指向 window ，window instanceof _ 为 false，!操作符取反，所以执行 new _(obj)。
new _(obj) 中，this 指向实例对象，this instanceof _ 为 true，取反后，代码接着执行
执行 this._wrapped = obj， 函数执行结束
总结，_([1, 2, 3]) 返回一个对象，为 {_wrapped: [1, 2, 3]}，该对象的原型指向 _.prototype
 */

//实现each $.each

function each(obj, callback) {
    var length, i = 0;

    if (Array.isArray(obj)) {
        length = obj.length;
        for (; i < length; i++) {
            if (callback(i, obj[i]) === false) {//加上终止循环
                break;
            }
        }
    } else {
        for (i in obj) {
            callback(i, obj[i])
        }
    }

    return obj;
}
each([1, false, "2"], function (i, v) {
    if (v == "2") return false
    console.log(v);

})

