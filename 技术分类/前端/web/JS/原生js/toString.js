//toString() 方法返回一个表示该对象的字符串。
/**
 * 用toString()检测对象类型节
可以通过toString() 来获取每个对象的类型。为了每个对象都能通过 Object.prototype.toString() 来检测，
需要以 Function.prototype.call() 或者 Function.prototype.apply() 的形式来调用，传递要检查的对象作为第一个参数，称为thisArg。

 */
var toString = Object.prototype.toString;

toString.call(new Date); // [object Date]
toString.call(new String); // [object String]
toString.call(Math); // [object Math]

//Since JavaScript 1.8.5
toString.call(undefined); // [object Undefined]
toString.call(null); // [object Null]


console.log(null == false);
console.log(null == 0);
console.log(0 == false)