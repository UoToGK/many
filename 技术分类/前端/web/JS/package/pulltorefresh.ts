class PullToRefresh {
    static VERSION = "1.0.0"

    public defaultOptions = {
        // 下拉时的文字
        pullText: "下拉以刷新页面",
        // 下拉时的图标
        pullIcon: "&#8675;",
        // 释放前的文字
        relaseText: "释放以刷新页面",
        // 释放后的文字
        refreshText: "刷新",
        // 释放后的图标
        refreshIcon: "&hellip;",
        // 当大于 60px 的时候才会触发 relase 事件
        threshold: 60,
        // 最大可以拉到 80px 的高度
        max: 80,
        // 释放后，高度回到 50px
        reloadHeight: 50
    };
    // 记录当前状态 pending/pulling/releasing/refreshing
    public _state = 'pending';
    // touchstart 时的 Y 轴的位置
    public pullStartY = null;
    // touchmove 时的 Y 轴的位置
    public pullMoveY = null;
    // 手指移动的距离
    public dist = 0;
    // refresh-element 要移动的距离，跟手指距离的值不同，因为要有阻尼效果
    public distResisted = 0;
    // 检测是否支持 passive 事件，我们可以传递 passive 为 true 来明确告诉浏览器，事件处理程序不会调用 preventDefault 来阻止默认滑动行为。
    public supportsPassive = false;
    options: any;
    constructor(options) {
        this.options = util.extend({}, this.defaultOptions, options);
    }
    createRefreshElement() {

    }

}
const util = {
    extend: function (target, obj1?, obj2?) {
        for (let i = 1, len = arguments.length; i < len; i++) {
            for (let prop in arguments[i]) {
                if (arguments[i].hasOwnProperty(prop)) {
                    target[prop] = arguments[i][prop]
                }
            }
        }

        return target
    }
};