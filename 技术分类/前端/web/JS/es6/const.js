//SyntaxError: missing = in const declaration
 const a;

// 常量可以定义成对象
const MY_OBJECT = { key: "value" };

// 重写对象和上面一样会失败
 MY_OBJECT = { OTHER_KEY: "value" };

// 对象属性并不在保护的范围内，下面这个声明会成功执行
MY_OBJECT.key = "otherValue"; // 对象属性并不在保护的范围内，下面这个声明会成功执行

MY_OBJECT.other_key = "hello world";

// 也可以用来定义数组
const MY_ARRAY = [];
// It's possible to push items into the array
// 可以向数组填充数据
MY_ARRAY.push("A"); // ["A"]
// 但是，将一个新数组赋给变量会引发错误
MY_ARRAY = ["B"];
