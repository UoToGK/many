//hasOwnProperty() 方法会返回一个布尔值，指示对象自身属性中是否具有指定的属性
o = new Object();
o.prop = 'exists';
o.hasOwnProperty('prop'); // 返回 true
o.hasOwnProperty('toString'); // 返回 false
o.hasOwnProperty('hasOwnProperty'); // 返回 false

/**
 * 有个坑点
 * JavaScript 并没有保护 hasOwnProperty 属性名，
 * 因此某个对象是有可能存在使用这个属性名的属性，使用外部的 hasOwnProperty 获得正确的结果是需要的：
 */
var foo = {
  hasOwnProperty: function() {
    return false;
  },
  bar: 'Here be dragons'
};

foo.hasOwnProperty('bar'); // 始终返回 false

// 如果担心这种情况，可以直接使用原型链上真正的 hasOwnProperty 方法
({}.hasOwnProperty.call(foo, 'bar')); // true

// 也可以使用 Object 原型上的 hasOwnProperty 属性
Object.prototype.hasOwnProperty.call(foo, 'bar'); // true
