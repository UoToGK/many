/**
 * apply() 方法调用一个具有给定this值的函数，以及作为一个数组（或类似数组对象）提供的参数。

注意：call()方法的作用和 apply() 方法类似，区别就是call()方法接受的是参数列表，而apply()方法接受的是一个参数数组。
 */

var numbers = [5, 6, 2, 3, 7];

/* 应用(apply) Math.min/Math.max 内置函数完成 */
var max = Math.max.apply(null, numbers); /* 基本等同于 Math.max(numbers[0], ...) 或 Math.max(5, 6, ..) */
var min = Math.min.apply(null, numbers);

/* 代码对比： 用简单循环完成 */
(max = -Infinity), (min = +Infinity);
for (var i = 0; i < numbers.length; i++) {
  if (numbers[i] > max) max = numbers[i];
  if (numbers[i] < min) min = numbers[i];
}
