/**给出一个 32 位的有符号整数，你需要将这个整数中每位上的数字进行反转 
 * 假设我们的环境只能存储得下 32 位的有符号整数，则其数值范围为 [−2^31,  2^31 − 1]。请根据这个假设，如果反转后整数溢出那么就返回 0。
*/

/**
 * @param {number} x
 * @return {number}
 */
var reverse = function (x) {
    var result;
    while (x != 0) {
        result = x * 10 + x % 10;
        x /= 10;
        console.log(result);

        if (result > Number.MAX_VALUE || result < Number.MIN_VALUE) {
            result = 0;
        }
    }
    return result;
};


console.log(reverse(123)); // 1233

