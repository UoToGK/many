(function () {
    /**
     * 然而 underscore 可不会写得如此简单，我们从 var root = this 开始说起。
之所以写这一句，是因为我们要通过 this 获得全局对象，然后将 _ 对象，挂载上去。
然而在严格模式下，this 返回 undefined，而不是指向 Window，幸运的是 underscore 并没有采用严格模式，可是即便如此，也不能避免，因为在 ES6 中模块脚本自动采用严格模式，不管有没有声明 use strict。
如果 this 返回 undefined，代码就会报错，所以我们的思路是对环境进行检测，然后挂载到正确的对象上。我们修改一下代码：
var root = (typeof window == 'object' && window.window == window && window) ||
           (typeof global == 'object' && global.global == global && global);
在这段代码中，我们判断了浏览器和 Node 环境，可是只有这两个环境吗？那我们来看看 Web Worker。

在 Web Worker 中，是无法访问 Window 对象的，所以 typeof window 和 typeof global 的结果都是 undefined，所以最终 root 的值为 false，将一个基本类型的值像对象一样添加属性和方法，自然是会报错的。
那么我们该怎么办呢？
虽然在 Web Worker 中不能访问到 Window 对象，但是我们却能通过 self 访问到 Worker 环境中的全局对象。我们只是要找全局变量挂载而已，所以完全可以挂到 self 中嘛。
而且在浏览器中，除了 window 属性，我们也可以通过 self 属性直接访问到 Winow 对象
console.log(window.self === window); //true

到了这里，依然没完，让你想不到的是，在 node 的 vm 模块中，也就是沙盒模块，runInContext 方法中，是不存在 window，也不存在 global 变量的，查看代码。

但是我们却可以通过 this 访问到全局对象，所以就有人发起了一个 PR，代码改成了：
var root = (typeof self == 'object' && self.self == self && self) ||
           (typeof global == 'object' && global.global == global && global) ||
           this;
           到了这里，还是没完，轮到微信小程序登场了。

因为在微信小程序中，window 和 global 都是 undefined，加上又强制使用严格模式，this 为 undefined，挂载就会发生错误，所以就有人又发了一个 PR，代码变成了：

var root = (typeof self == 'object' && self.self == self && self) ||
           (typeof global == 'object' && global.global == global && global) ||
           this ||
           {};
     */
    var root = (typeof self == 'object' && self.self == self && self) ||
        (typeof global == 'object' && global.global == global && global) ||
        this || {};

    var util = {
        extend: function (target) {
            for (var i = 1, len = arguments.length; i < len; i++) {
                for (var prop in arguments[i]) {
                    if (arguments[i].hasOwnProperty(prop)) {
                        target[prop] = arguments[i][prop]
                    }
                }
            }

            return target
        },
        getStyle: function (element, prop) {
            return element.currentStyle ? element.currentStyle[prop] : document.defaultView.getComputedStyle(element)[prop]
        },
        getScrollOffsets: function () {
            var w = window;
            if (w.pageXOffset != null) return { x: w.pageXOffset, y: w.pageYOffset };
            var d = w.document;
            if (document.compatMode == "CSS1Compat") {
                return {
                    x: d.documentElement.scrollLeft,
                    y: d.documentElement.scrollTop
                }
            }
            return { x: d.body.scrollLeft, y: d.body.scrollTop }
        },
        addEvent: function (element, type, fn) {
            if (document.addEventListener) {
                element.addEventListener(type, fn, false);
                return fn;
            } else if (document.attachEvent) {
                var bound = function () {
                    return fn.apply(element, arguments)
                }
                element.attachEvent('on' + type, bound);
                return bound;
            }
        },
        indexOf: function (array, item) {
            if (array.indexOf) {
                return array.indexOf(item);
            } else {
                var result = -1;
                for (var i = 0, len = array.length; i < len; i++) {
                    if (array[i] === item) {
                        result = i;
                        break;
                    }
                }
                return result;
            }
        },
        addClass: function (element, className) {
            var classNames = element.className.split(/\s+/);
            if (util.indexOf(classNames, className) == -1) {
                classNames.push(className);
            }
            element.className = classNames.join(' ')
        },
        removeClass: function (element, className) {
            var classNames = element.className.split(/\s+/);
            var index = util.indexOf(classNames, className)
            if (index !== -1) {
                classNames.splice(index, 1);
            }
            element.className = classNames.join(' ')
        },
        isValidListener: function (listener) {
            if (typeof listener === 'function') {
                return true
            } else if (listener && typeof listener === 'object') {
                return util.isValidListener(listener.listener)
            } else {
                return false
            }
        },
        removeProperty: function (element, name) {
            if (element.style.removeProperty) {
                element.style.removeProperty(name);
            } else {
                element.style.removeAttribute(name);
            }
        }
    };

    function EventEmitter() {
        this.__events = {}
    }

    EventEmitter.prototype.on = function (eventName, listener) {
        if (!eventName || !listener) return;

        if (!util.isValidListener(listener)) {
            throw new TypeError('listener must be a function');
        }

        var events = this.__events;
        var listeners = events[eventName] = events[eventName] || [];
        var listenerIsWrapped = typeof listener === 'object';

        // 不重复添加事件
        if (util.indexOf(listeners, listener) === -1) {
            listeners.push(listenerIsWrapped ? listener : {
                listener: listener,
                once: false
            });
        }

        return this;
    };

    EventEmitter.prototype.once = function (eventName, listener) {
        return this.on(eventName, {
            listener: listener,
            once: true
        })
    };

    EventEmitter.prototype.off = function (eventName, listener) {
        var listeners = this.__events[eventName];
        if (!listeners) return;

        var index;
        for (var i = 0, len = listeners.length; i < len; i++) {
            if (listeners[i] && listeners[i].listener === listener) {
                index = i;
                break;
            }
        }

        if (typeof index !== 'undefined') {
            listeners.splice(index, 1, null)
        }

        return this;
    };

    EventEmitter.prototype.emit = function (eventName, args) {
        var listeners = this.__events[eventName];
        if (!listeners) return;

        for (var i = 0; i < listeners.length; i++) {
            var listener = listeners[i];
            if (listener) {
                listener.listener.apply(this, args || []);
                if (listener.once) {
                    this.off(eventName, listener.listener)
                }
            }

        }

        return this;

    };

    function Sticky(element, options) {
        EventEmitter.call(this);
        this.element = typeof element === "string" ? document.querySelector(element) : element;
        this.options = util.extend({}, this.constructor.defaultOptions, options)
        this.init();
    }

    Sticky.version = '1.0.0';

    Sticky.defaultOptions = {
        offset: 0
    }

    var proto = Sticky.prototype = new EventEmitter();

    proto.constructor = Sticky;

    proto.init = function () {

        this.calculateElement();

        this.bindScrollEvent();
    };

    proto.calculateElement = function () {
        // 计算出元素距离文档的位置
        if (this.element) {
            var rect = this.element.getBoundingClientRect();
            this.eLeft = rect.left + util.getScrollOffsets().x;
            this.eTop = rect.top + util.getScrollOffsets().y - this.options.offset;
        }
    };

    proto.bindScrollEvent = function () {
        var self = this;

        util.addEvent(window, "scroll", function (event) {
            if (util.getScrollOffsets().y > self.eTop) {
                self.setSticky();
            } else {
                self.setNormal();
            }
        })
    };

    proto.setSticky = function () {
        if (this.status == "sticky") return;
        this.status = "sticky";
        util.addClass(this.element, 'sticky');
        this.setElementSticky();
        this.emit("onStick");
    };

    proto.setNormal = function () {
        if (this.status !== "sticky") return;
        this.status = "normal";
        util.removeClass(this.element, 'sticky');
        this.setElementNormal();
        this.emit("onDetach");
    };

    proto.setElementSticky = function () {
        this.element.style.position = "fixed";
        this.element.style.left = this.eLeft + 'px';
        this.element.style.top = this.options.offset + 'px';
    };

    proto.setElementNormal = function () {
        util.removeProperty(this.element, "position")
        util.removeProperty(this.element, "left")
        util.removeProperty(this.element, "top")
    };

    if (typeof exports != 'undefined' && !exports.nodeType) {
        if (typeof module != 'undefined' && !module.nodeType && module.exports) {
            exports = module.exports = Sticky;
        }
        exports.Sticky = Sticky;
    } else {
        root.Sticky = Sticky;
    }
}());