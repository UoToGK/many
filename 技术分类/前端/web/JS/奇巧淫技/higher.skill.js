/**
 *解析url
 */
function parseURL(url) {
    var a = document.createElement('a');
    a.href = url;
    return {
        host: a.hostname,
        port: a.port,
        query: a.search,
        params: (function () {
            var ret = {},
                seg = a.search.replace(/^\?/, '').split('&'),
                len = seg.length, i = 0, s;
            for (; i < len; i++) {
                if (!seg[i]) { continue; }
                s = seg[i].split('=');
                ret[s[0]] = s[1];
            }
            return ret;
        })(),
        hash: a.hash.replace('#', '')
    };
}

/**
 * 有的时候我们会写双重 for 循环做一些数据处理，我们有的时候希望满足条件的时候就直接跳出循环。以免浪费不必要资源
 */

firstLoop:
for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
        if (i === j) {
            continue firstLoop; // 继续 firstLoop 循环
            // break firstLoop; // 中止 firstLoop 循环
        }
        console.log(`i = ${i}, j = ${j}`);
    }
}
// 输出
i = 1, j = 0
i = 2, j = 0
i = 2, j = 1

for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
        if (i === j) {
            continue
        }
        console.log(`i = ${i}, j = ${j}`);
    }
}
// 输出
i = 0, j = 1
i = 0, j = 2
i = 1, j = 0
i = 1, j = 2
i = 2, j = 0
i = 2, j = 1

/**
 * 由于 void 会忽略操作数的值，因此在操作数具有副作用的时候使用 void 会更加合理。
 * 阻止默认事件

阻止默认事件的方式是给事件设置返回值false



//一般写法

<a href="http://example.com" onclick="f();return false">文字</a>
使用void运算符可以取代上面写法

<a href="javascript:void(f())">文字</a>


所以void()表达式结果是SyntaxError
 */

// 如果访问者的属性是被继承的，它的 get 和set 方法会在子对象的属性被访问或者修改时被调用。如果这些方法用一个变量存值，该值会被所有对象共享。

function myclass() {
}

var value;
Object.defineProperty(myclass.prototype, "x", {
    get() {
        return value;
    },
    set(x) {
        value = x;
    }
});

var a = new myclass();
var b = new myclass();
a.x = 1;
console.log(b.x); // 1
// 这可以通过将值存储在另一个属性中解决。在 get 和 set 方法中，this 指向某个被访问和修改属性的对象。

function myclass() {
}

Object.defineProperty(myclass.prototype, "x", {
    get() {
        return this.stored_x;
    },
    set(x) {
        this.stored_x = x;
    }
});

var a = new myclass();
var b = new myclass();
a.x = 1;
console.log(b.x); // undefined


// start 不像访问者属性，值属性始终在对象自身上设置，而不是一个原型。然而，如果一个不可写的属性被继承，它仍然可以防止修改对象的属性
function myclass() {
}

myclass.prototype.x = { aa: 1 };
Object.defineProperty(myclass.prototype, "y", {
    writable: false,
    value: 1
});

var a = new myclass();
a.x.aa = 2;
console.log(a.x.aa); // 2
console.log(myclass.prototype.x.aa); // 1
a.y = 2; // Ignored, throws in strict mode
console.log(a.y); // 1
console.log(myclass.prototype.y); // 

// ===================================================================================================
// 不像访问者属性，值属性始终在对象自身上设置，而不是一个原型。然而，如果一个不可写的属性被继承，它仍然可以防止修改对象的属性
function myclass() {
}

myclass.prototype.x = 1;
Object.defineProperty(myclass.prototype, "y", {
    writable: false,
    value: 1
});

var a = new myclass();
a.x = 2;
console.log(a.x); // 2
console.log(myclass.prototype.x); // 1
a.y = 2; // Ignored, throws in strict mode
console.log(a.y); // 1
console.log(myclass.prototype.y); // 

// end 不像访问者属性，值属性始终在对象自身上设置，而不是一个原型。然而，如果一个不可写的属性被继承，它仍然可以防止修改对象的属性