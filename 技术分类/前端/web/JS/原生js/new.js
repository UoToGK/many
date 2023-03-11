/**
 * new 的实现原理
 */
// ES5
function myNew() {
    // 创建一个新的对象
    const obj = {}
    // 获取第一个参数，arguments是类数组，不可直接调用shift方法
    //此外因为 shift 会修改原数组，所以 arguments 会被去除第一个参数
    const Constructor = [].shift.call(arguments)
    // 将obj的原型指向构造函数的原型对象，这样obj就可以访问构造函数原型上的属性
    obj.__proto__ = Constructor.prototype
    // 将构造函数的this指向obj，这样obj就可以访问到构造函数中的属性
    Constructor.apply(obj, arguments);
    // 返回 obj
    return obj;
}

// ES6
function _new() {
    let target = {};//如果需要纯净的对象，Object.create(null)
    let [Constructor, ...args] = [...arguments];
    target.__proto__ = Constructor.prototype;
    let newObj = Constructor.apply(target, ...args);
    if (newObj && (typeof newObj == 'object' || typeof newObj == 'function')) {
        //构造函数可能返回一个对象或函数
        return newObj
    }
    //返回创建的对象
    return target
}