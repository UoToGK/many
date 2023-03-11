// Object.definedProperty 的作用是劫持一个对象的属性，劫持属性的getter和setter方法，在对象的属性发生变化时进行特定的操作。而 Proxy 劫持的是整个对象。

// Proxy 会返回一个代理对象，我们只需要操作新对象即可，而 Object.defineProperty 只能遍历对象属性直接修改。

// Object.definedProperty 不支持数组，更准确的说是不支持数组的各种API，因为如果仅仅考虑arry[i] = value 这种情况，是可以劫持的，但是这种劫持意义不大。而 Proxy 可以支持数组的各种API。

// 尽管 Object.defineProperty 有诸多缺陷，但是其兼容性要好于 Proxy.

//     PS: Vue2.x 使用 Object.defineProperty 实现数据双向绑定，V3.0 则使用了 Proxy.

//拦截器
let obj = {};
let temp = 'Yvette';
Object.defineProperty(obj, 'name', {
    get() {
        console.log("读取成功");
        return temp
    },
    set(value) {
        console.log("设置成功");
        temp = value;
    }
});

obj.name = 'Chris';
console.log(obj.name);
// PS: Object.defineProperty 定义出来的属性，默认是不可枚举，不可更改，不可配置【无法delete】

// 我们可以看到 Proxy 会劫持整个对象，读取对象中的属性或者是修改属性值，那么就会被劫持。但是有点需要注意，复杂数据类型，监控的是引用地址，而不是值，如果引用地址没有改变，那么不会触发set。

let obj = {
    name: 'Yvette', hobbits: ['travel', 'reading'], info: {
        age: 20,
        job: 'engineer'
    }
};
let p = new Proxy(obj, {
    get(target, key) { //第三个参数是 proxy， 一般不使用
        console.log('读取成功');
        return Reflect.get(target, key);
    },
    set(target, key, value) {
        if (key === 'length') return true; //如果是数组长度的变化，返回。
        console.log('设置成功');
        return Reflect.set([target, key, value]);
    }
});
p.name = 20; //设置成功
p.age = 20; //设置成功; 不需要事先定义此属性
p.hobbits.push('photography'); //读取成功;注意不会触发设置成功
p.info.age = 18; //读取成功;不会触发设置成功
// 最后，我们再看下对于数组的劫持，Object.definedProperty 和 Proxy 的差别

// Object.definedProperty 可以将数组的索引作为属性进行劫持，但是仅支持直接对 arry[i] 进行操作，不支持数组的API，非常鸡肋。

let arry = []
Object.defineProperty(arry, '0', {
    get() {
        console.log("读取成功");
        return temp
    },
    set(value) {
        console.log("设置成功");
        temp = value;
    }
});

let arry = []
arry[0] = 10; //触发设置成功
arry.push(10); //不能被劫持
// Proxy 可以监听到数组的变化，支持各种API。注意数组的变化触发get和set可能不止一次，如有需要，自行根据key值决定是否要进行处理。

let hobbits = ['travel', 'reading'];
let p = new Proxy(hobbits, {
    get(target, key) {
        // if(key === 'length') return true; //如果是数组长度的变化，返回。
        console.log('读取成功');
        return Reflect.get(target, key);
    },
    set(target, key, value) {
        // if(key === 'length') return true; //如果是数组长度的变化，返回。
        console.log('设置成功');
        return Reflect.set([target, key, value]);
    }
});
// p.splice(0, 1) //触发get和set，可以被劫持
p.push('photography');//触发get和set
// p.slice(1); //触发get；因为 slice 是不会修改原数组的

/**
 * 
 * 
 * 
 * @param {Array} arr 
 * @returns 
 */
function flattenDeep(arr) {
    return arr.reduce((acc, val) => Array.isArray(val) ? acc.concat(flattenDeep(val)) : acc.concat(val), []);
}
console.log(flattenDeep([1, [2, [3, [4]], 5]]));