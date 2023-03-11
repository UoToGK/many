console.log(new Date().valueOf());
console.log(Date.now());
var colors = new Array(); //创建一个数组
var count = colors.push("red", "green"); //推入两项
console.log(colors); //2
count = colors.push("black"); //推入另一项
console.log(colors); //3
var item = colors.shift(); //取得第一项
console.log(item); //"red"
console.log(colors); //2

// 进行一下破坏连续性的操作
let arr = [1, , 3, 4];
delete arr[3];
arr["a"] = 5;

// 输出 [1, empty, 3, empty, a: 5]
console.log(arr);

// 进行转换
arr = Array.apply(null, arr);

// 输出 [1, undefined, 3, undefined]
console.log(arr[1]);

var values = [1, 2, 3, 4, 5];
var sum = values.reduceRight(function(prev, cur, index, array) {
  console.log(prev, cur);

  return prev + cur;
});
console.log(sum); //15

var original = Promise.resolve('我在第二行');
var cast = Promise.resolve(original);
cast.then(function(value) {
  console.log('value: ' + value);
});
console.log('original == cast ? ' + (original == cast),original instanceof Promise)

async function A(){
  console.log("A")
}
async function B(){
  console.log("B")
}
async function C(){
  console.log("C")
}
// A();B();C();
Promise.all(A,B,C)

console.log( Object.is(NaN,NaN));


var num = 0;
var obj = new String("0");
var str = "0";
var b = false;

console.log(num == num); // true
console.log(obj == obj); // true
console.log(str == str); // true

console.log(num == obj); // TRUE
console.log(num == str); // TRUE
console.log(obj == str); // TRUE
console.log(null == undefined); // TRUE
console.log(obj == null); // false
console.log(obj == undefined); // false


var num = 0;
var obj = new String("0");
var str = "0";
var b = false;

console.log(num === num); // true
console.log(obj === obj); // true
console.log(str === str); // true

console.log(num === obj); // false
console.log(num === str); // false
console.log(obj === str); // false
console.log(null === undefined); // false
console.log(obj === null); // false
console.log(obj === undefined); // false

/** 参考 https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Equality_comparisons_and_sameness
 * 在日常中使用全等操作符几乎总是正确的选择。对于除了数值之外的值，全等操作符使用明确的语义进行比较：一个值只与自身全等。对于数值，
 * 全等操作符使用略加修改的语义来处理两个特殊情况：第一个情况是，浮点数 0 是不分正负的。区分 +0 和 -0 在解决一些特定的数学问题时是必要的，
 * 但是大部分情况下我们并不用关心。全等操作符认为这两个值是全等的。第二个情况是，浮点数包含了 NaN 值，用来表示某些定义不明确的数学问题的解，
 * 例如：正无穷加负无穷。全等操作符认为 NaN 与其他任何值都不全等，包括它自己。（等式 (x !== x) 成立的唯一情况是 x 的值为 NaN）
 */

 