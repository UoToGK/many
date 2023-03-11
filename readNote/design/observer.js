/**
 * 观察者模式实现
 * [一些理解](  https://segmentfault.com/a/1190000003846584, https://www.jianshu.com/p/0bd3c3b89692 )
 * 观察者模式最主要的作用的：解决类或对象之间的耦合，解耦两个相互依赖的对象，使其依赖于观察者的消息机制。
 */

//简单实现
function Events() {
    this.on = function (eventName, callBack) {
        if (!this.handles) {
            this.handles = {};
        }
        if (!this.handles[eventName]) {
            this.handles[eventName] = [];
        }
        this.handles[eventName].push(callBack);
    }
    this.emit = function (eventName, obj) {
        if (this.handles[eventName]) {
            for (var i = 0; o < this.handles[eventName].length; i++) {
                this.handles[eventName][i](obj);
            }
        }
    }
    return this;
}


//第二种
var Observer = (function () {
    //防止消息队列暴露而被篡改，所以将消息容器作为静态私有变量保存
    var __messages = {};

    return {
        //注册信息接口 
        regist: regist,
        //发布信息的接口
        fire: fire,
        //移除信息接口
        remove: remove
    }
    function regist(type, fn) {
        //如果此消息不存在，则应该创建一个该消息类型
        if (typeof __messages[type] === 'undefined') {
            //将对象推入到该消息对应的动作执行队列中
            __messages[type] = [fn];
            //如果此消息存在
        } else {
            //将动作方法推入该消息对应的动作执行序列中  
            __messages[type].push(fn);
        }
    }
    function fire(type, args) {
        //如果该消息没有被注册，则返回
        if (!__messages[type]) {
            return;

        }
        //定义消息信息
        var events = {
            type: type,
            args: args || {}
        },
            i = 0;
        len = __messages[type].length;


        for (; i < len; i++) {
            //依次执行注册的消息对应的动作序列
            __messages[type][i].call(this, events);
        }
    }
    function remove(type, fn) {
        //如果消息动作队列存在
        if (fn) {
            if (__messages[type] instanceof Array) {
                //从最后一个消息动作遍历
                var i = __messages[type].length - 1;
                for (; i >= 0; i--) {
                    //如果存在该动作则在消息动作中移除相应动作
                    __messages[type][i] === fn && __messages[type].splice(i, 1);
                }
            }
        } else {
            //如果不传入回调，则移除所有该事件
            __messages[type].length = 0
        }
    }
})();
