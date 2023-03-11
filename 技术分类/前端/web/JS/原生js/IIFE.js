for (var i = 0; i < 4; i++) {
    (function (i) {
        setTimeout(() => {
            console.log(i)
        })
    }(i))
}
console.log('start')
// ############ 等价 #################
for (let i = 4; i < 8; i++) {
    setTimeout(() => {
        console.log(i)
    })
}

// complain IIFE其实也是创建了一个独立作用域，为i每次都创建了一个本地变量，保存在当前作用域中，当定时器的回调触发的时候，就可以正确取到值

// let 也是因为可以形成块级作用域


for (var i = 4; i < 8; i++) {
    setTimeout(() => {
        console.log(i)
    })
}
// 新开了一个异步定时器线程，主线程上任务只有for循环，异步任务里面没有i，由于闭包的特性或者说作用域链，向上一级查询i变量，此时循环完毕，i=8，所以输出4个8，
// setTimeout 最低间隔时间也是4ms，最新规定，老版本浏览器一般是10ms