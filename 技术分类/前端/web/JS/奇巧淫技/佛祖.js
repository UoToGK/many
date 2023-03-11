console.log('http://'.replace("//", "<<"));
console.log("hello world !".split(' ').reverse().join(''))
console.log([
    "                   _ooOoo_",
    "                  o8888888o",
    "                  88\" . \"88",
    "                  (| -_- |)",
    "                  O\\  =  /O",
    "               ____/`---'\\____",
    "             .'  \\\\|     |//  `.",
    "            /  \\\\|||  :  |||//  \\",
    "           /  _||||| -:- |||||-  \\",
    "           |   | \\\\\\  -  /// |   |",
    "           | \\_|  ''\\---/''  |   |",
    "           \\  .-\\__  `-`  ___/-. /",
    "         ___`. .'  /--.--\\  `. . __",
    "      .\"\" '<  `.___\\_<|>_/___.'  >'\"\".",
    "     | | :  `- \\`.;`\\ _ /`;.`/ - ` : | |",
    "     \\  \\ `-.   \\_ __\\ /__ _/   .-` /  /",
    "======`-.____`-.___\\_____/___.-`____.-'======",
    "                   `=---='",
    "^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^",
    "         佛祖保佑       永无BUG"
].join('\n'));
console.log(['1', '2', '3'].map(parseInt))
/**
 * [参考](https://segmentfault.com/a/1190000011913127?_ea=2804668)
 */
console.log((0.2 - 0.1) == 0.1, (0.8 - 0.6) == 0.2)
var a = Math.pow(2, 53);
var i = 0;
for (let index = a - 100; index < a; index++) {
    i++;

}
console.log(i)
var a = [0];
if ([0]) {
    console.log(!!a == true);
} else {
    console.log('A' == 'A', [] == [], 1 == 1);
}


var x = [].reverse;
x();
/**
 * '5' - '2' // 3
'5' * '2' // 10
true - 1  // 0
false - 1 // -1
'1' - 1   // 0
'5'*[]    // 0
false/'5' // 0
'abc'-1   // NaN
上面都是二元算术运算符的例子，JavaScript的两个一元算术运算符——正号和负号——也会把运算子自动转为数值。

+'abc' // NaN
-'abc' // NaN
+true // 1
-false // 0
 */
console.log(3..toString())
    (function () {
        "user strict"

        function say_hello() {
            return console.log("hello");
        }
        say_hello();
        console.log("world")
    }())


var moment = require('moment');
m = moment("36氪2018-10-18 10:27:14", [
    'YYYY/MM/DD HH:mm',
    'YY/M/D H:m',
    'YYYY/MM/DD',
    'YYYY/M/D',
    'YYYY-MM-DD HH:mm',
    'YY-M-D H:m',
    'YYYY-MM-DD',
    'YYYY-M-D',

    'YY/MM/DD',
    'YY/M/D',
    'YY-MM-DD',
    'YY-M-D',

    'MM/DD HH:mm',
    'M/D H:m',
    'MM-DD HH:mm',
    'M-D H:m',

    'MM/DD',
    'M/DD',
    'MM-DD',
    'M-DD',

    'YYYY年MM月DD日 HH:mm',
    'YY年M月D日 H:m',
    'YYYY年MM月DD日',
    'YY年M月D日',

    'MM月DD日 HH:mm',
    'M月D日 H:m',
    'MM月DD日',
    'M月D日',

    'L',
    /* 09/04/1986 */
    'l' /* 9/4/1986 */,
    'LTS' /* 8:30:25 PM */,
    'LT' /* 8:39 PM */,
    'HH:mm',
    'H:m'
]);
console.log(m)