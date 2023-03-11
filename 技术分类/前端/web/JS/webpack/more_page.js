/**
 * [多页面配置](https://www.jianshu.com/p/11f5d23484e9)
 */


async function A() {
    for (let index = 0; index < 1000; index++) {
        console.log('A' + index)
    }
}


async function B() {
    for (let index = 0; index < 1000; index++) {
        console.log('B' + index)
    }
}
A();
B();