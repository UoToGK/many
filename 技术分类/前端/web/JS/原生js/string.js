/**
 * 隐士类型转换知道多少
 */
var bar = true;
console.log(bar + 0); //1
console.log(bar + 'xyz'); //truexyz
console.log(bar + true); //2
console.log(bar + false); //1
console.log('1' > bar); //false
console.log(1 + '2' + false); //12false
console.log('2' + ['koala', 1]); //2koala,1

var obj1 = {
  a: 1,
  b: 2
};
console.log('2' + obj1); //2[Object object]

var obj2 = {
  toString: function () {
    return 'a';
  }
};
console.log('2' + obj2); //2a
////输出结果  1 truexyz 2 1 false 12false 2koala,1 2[object Object] 2a

var b = 1;

function outer() {
  var b = 2;

  function inner() {
    b++; //undefined++??==>NaN
    console.log(b); //NaN
    var b = 3; //变量提升
  }
  inner();
}
outer();
//
function getPersonInfo(one, two, three) {
  console.log(one);
  console.log(two);
  console.log(three);
}

const person = 'Lydia';
const age = 21;
/**
 * 模板字符串使用反引号 (` `) 来代替普通字符串中的用双引号和单引号。模板字符串可以包含特定语法（${expression}）的占位符。
 * 占位符中的表达式和周围的文本会一起传递给一个默认函数，该函数负责将所有的部分连接起来，如果一个模板字符串由表达式开头，
 * 则该字符串被称为带标签的模板字符串，该表达式通常是一个函数，它会在模板字符串处理后被调用，在输出最终结果前，
 * 你都可以通过该函数来对模板字符串进行操作处理。在模版字符串内使用反引号（`）时，需要在它前面加转义符（\）。
 * 更高级的形式的模板字符串是带标签的模板字符串。标签使您可以用函数解析模板字符串。
 * 标签函数的第一个参数包含一个字符串值的数组。其余的参数与表达式相关。
 * 最后，你的函数可以返回处理好的的字符串（或者它可以返回完全不同的东西 ,
 * 如下个例子所述）。用于该标签的函数的名称可以被命名为任何名字。
 */
getPersonInfo `${person} is ${age} years old`;

console.log `'string text line 1\n' + 'string text line 2'`;
