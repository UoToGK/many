const { devDependencies, dependencies, devDependencies2, dependencies2 } = require('./diff.json');
function toArray(object) {
    var arr = [];
    for (var key in object) {
        if (object.hasOwnProperty(key)) {
            let o = {};
            o[key] = object[key];
            // var map = new Map();
            // map.set(key, element)
            arr.push(o)
        }
    }
    return arr
}

function diff(arr1, arr2, flag) {
    return flag ? arr1.filter(v => !arr2.includes(v)) : arr2.filter(v => !arr1.includes(v))
}
console.log(array2Json(diff(toArray(dependencies), toArray(dependencies2), true)))
// console.log(diff(toArray(dependencies), toArray(dependencies2), false))

function array2Json(arr) {
    var o = {};
    arr.forEach(v => {
        for (const key in v) {
            if (v.hasOwnProperty(key)) {
                o[key] = v[key]
            }
        }
    });
    return JSON.stringify(o)
}