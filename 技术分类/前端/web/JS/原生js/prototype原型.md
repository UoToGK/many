```js
圣杯模式
function inherit( Target , Origin){

    function F();

    F.prototype = Origin.prototype;

    Target.prototype = new F();
    //把Target的构造函数指向归位
    Target.prototype.constructor = Target;
    // 如果不增加这个uber，你的原型是只想F的实例，而F只是一个中间变量，不清晰
    //所以在Target的原型上增加uber，为了让我们知道Target真正继承自谁
    Target.prototype.uber= Origin.prototype;

}
```
