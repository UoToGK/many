/*
 * @Author: xiaobin.zhu
 * @Date: 2022-03-08 15:06:18
 * @LastEditors: xiaobin.zhu
 * @LastEditTime: 2022-03-11 11:11:15
 * @Description: file content
 */

var zlib = require('zlib');
function r() {
    return localStorage.getItem("loginToken")
}

// gunzipSync = function (e, t) {
//     return y(new _(t), e)
// }
function L(e, t) {
    if ("1" == t)
        return [7, 65, 75, 31, 71, 101, 57, 0];
    for (var n = [], a = 0, r = t.length; a < r; a += 2)
        n.push(e.substr(1 * t.substr(a, 2), 1).charCodeAt());
    return n
}

function B(e, t) {
    for (var n, a = new Uint8Array(e.length), r = 0, c = e.length; r < c; r++)
        n = t[r % t.length],
            a[r] = e[r].charCodeAt() ^ n;
    return a
}

function U(e) {
    var t, n, a, r, c, u, i, o = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", s = "", f = 0;
    e = e.replace(/[^A-Za-z0-9\+\/\=]/g, "");
    while (f < e.length)
        r = o.indexOf(e.charAt(f++)),
            c = o.indexOf(e.charAt(f++)),
            u = o.indexOf(e.charAt(f++)),
            i = o.indexOf(e.charAt(f++)),
            t = r << 2 | c >> 4,
            n = (15 & c) << 4 | u >> 2,
            a = (3 & u) << 6 | i,
            s += String.fromCharCode(t),
            64 != u && (s += String.fromCharCode(n)),
            64 != i && (s += String.fromCharCode(a));
    return s
}

function getDecryptedData(encryptedData, exor, loginToken) {
    var a = L(loginToken, exor);
    var r = B(U(encryptedData), a)
    var decryptedData = zlib.gunzipSync(r).toString('base64');
    // var decryptedData = zlib.gunzipSync(r).toString();
    // console.log(decryptedData)
    return decryptedData
}

//   测试用例
// var encryptedData = ""

// res = getDecryptedData(encryptedData, "3922571404224658", "f4984314d122393d8dee3c843cbd16d76dd297c20e9b4fd6d554af6f3929d696")
// var fs = require('fs')
// fs.writeFile('./data.txt', res, function (err, code) {
//     if (err) console.log(err)
// })

