/**
 * 在 requestAnimationFrame 之前，我们主要使用 setTimeout/setInterval 来编写JS动画。

编写动画的关键是循环间隔的设置，一方面，循环间隔足够短，动画效果才能显得平滑流畅；另一方面，循环间隔还要足够长，才能确保浏览器有能力渲染产生的变化。

大部分的电脑显示器的刷新频率是60HZ，也就是每秒钟重绘60次。大多数浏览器都会对重绘操作加以限制，不超过显示器的重绘频率，因为即使超过那个频率用户体验也不会提升。因此，最平滑动画的最佳循环间隔是 1000ms / 60 ，约为16.7ms。

setTimeout/setInterval 有一个显著的缺陷在于时间是不精确的，setTimeout/setInterval 只能保证延时或间隔不小于设定的时间。因为它们实际上只是把任务添加到了任务队列中，但是如果前面的任务还没有执行完成，它们必须要等待。

requestAnimationFrame 才有的是系统时间间隔，保持最佳绘制效率，不会因为间隔时间过短，造成过度绘制，增加开销；也不会因为间隔时间太长，使用动画卡顿不流畅，让各种网页动画效果能够有一个统一的刷新机制，从而节省系统资源，提高系统性能，改善视觉效果。

综上所述，requestAnimationFrame 和 setTimeout/setInterval 在编写动画时相比，优点如下:

1.requestAnimationFrame 不需要设置时间，采用系统时间间隔，能达到最佳的动画效果。

2.requestAnimationFrame 会把每一帧中的所有DOM操作集中起来，在一次重绘或回流中就完成。

3.当 requestAnimationFrame() 运行在后台标签页或者隐藏的 <iframe> 里时，requestAnimationFrame() 会被暂停调用以提升性能和电池寿命（大多数浏览器中）。

requestAnimationFrame 使用(试试使用requestAnimationFrame写一个移动的小球，从A移动到B初):

function step(timestamp) {
    //code...
    window.requestAnimationFrame(step);
}
window.requestAnimationFrame(step);
 */

var lastTime = 0;
var prefixes = 'webkit moz ms o'.split(' '); //各浏览器前缀
var requestAnimationFrame = window.requestAnimationFrame;
var cancelAnimationFrame = window.cancelAnimationFrame;
var prefix;
//通过遍历各浏览器前缀，来得到requestAnimationFrame和cancelAnimationFrame在当前浏览器的实现形式
for (var i = 0; i < prefixes.length; i++) {
    if (requestAnimationFrame && cancelAnimationFrame) {
        break;
    }
    prefix = prefixes[i];
    requestAnimationFrame = requestAnimationFrame || window[prefix + 'RequestAnimationFrame'];
    cancelAnimationFrame = cancelAnimationFrame || window[prefix + 'CancelAnimationFrame'] || window[prefix + 'CancelRequestAnimationFrame'];
}
//如果当前浏览器不支持requestAnimationFrame和cancelAnimationFrame，则会退到setTimeout
if (!requestAnimationFrame || !cancelAnimationFrame) {
    requestAnimationFrame = function (callback, element) {
        var currTime = new Date().getTime();
        //为了使setTimteout的尽可能的接近每秒60帧的效果
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function () {
            callback(currTime + timeToCall);
        }, timeToCall);
        lastTime = currTime + timeToCall;
        return id;
    };
    cancelAnimationFrame = function (id) {
        window.clearTimeout(id);
    };
}
//得到兼容各浏览器的API
window.requestAnimationFrame = requestAnimationFrame;
window.cancelAnimationFrame = cancelAnimationFrame;

