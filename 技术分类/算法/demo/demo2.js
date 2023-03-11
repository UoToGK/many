/**
 * 给定仅有小写字母组成的字符串数组 A，返回列表中的每个字符串中都显示的全部字符（包括重复字符）组成的列表。
 * 例如，如果一个字符在每个字符串中出现 3 次，但不是 4 次，则需要在最终答案中包含该字符 3 次
    输入：["bella","label","roller"]
    输出：["e","l","l"]

    输入：["cool","lock","cook"]
    输出：["c","o"]
 */

var A = ["bella", "label", "roller"];

var commonChars = function (A) {
    let res = A[0].split("");
    for (let i = 1; i < A.length; i++) {
        let tmp = A[i].split("");
        res = res.filter(e => {
            console.log(e, tmp, tmp.indexOf(e), tmp.indexOf(e) > -1);

            return tmp.indexOf(e) > -1 ? tmp[tmp.indexOf(e)] = "*" : false

        });
        console.log("**************", res);
    }
    return res;
}

console.log(commonChars(A));
