/**parseInt() 函数解析一个字符串参数，并返回一个指定基数的整数
 *返回解析后的整数值。 如果被解析参数的第一个字符无法被转化成数值类型，则返回 NaN。
注意：radix参数为n 将会把第一个参数看作是一个数的n进制表示，而返回的值则是十进制的。
 */
// 以下例子均返回15:

parseInt('0xF', 16);
parseInt('F', 16);
parseInt('17', 8);
parseInt(021, 8);
parseInt('015', 10); // parseInt(015, 10); 返回 15
parseInt(15.99, 10);
parseInt('15,123', 10);
parseInt('FXX123', 16);
parseInt('1111', 2);
parseInt('15 * 3', 10);
parseInt('15e2', 10);
parseInt('15px', 10);
parseInt('12', 13);
// 以下例子均返回 NaN:

parseInt('Hello', 8); // 根本就不是数值
parseInt('546', 2); // 除了“0、1”外，其它数字都不是有效二进制数字
