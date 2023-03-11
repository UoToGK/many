// Created by uoto on 16/4/20.

import { wrapper } from "./tools/events";
import { readFileSync } from "fs";
import { ipcRenderer } from "electron";
import { formatDomToObject } from "./tools/dom";
import markNode from "./tools/markNode";
import { EVENTS } from "./properties";
import _ = require("lodash");
import requireAll = require("requireall");
import { writeLog2File } from "../base/logger";

var insertCSS = `${__dirname}/tools/webview.css`;
var emitter = wrapper(document, readFileSync(insertCSS, "utf-8"));

//当选中元素后
emitter.on(EVENTS.elementSelect, function (e: MouseEvent) {

  // 通知元素选择的事件，将元素转换为一个类元素对象 formatDomToObject
  ipcRenderer.sendToHost(EVENTS.elementSelect, formatDomToObject(e));
});

window.addEventListener("focus", function () {
  var active = <any>document.activeElement;
  if (active && /input|textarea/.test(active.localName)) {
    active.blur();
  }
});

window.addEventListener("download", function () {
  ipcRenderer.sendToHost("download");
});

var _debug = console.debug;
console.debug = function (...args) {
  ipcRenderer.sendToHost("debug", ...args);
  _debug.apply(console, args);
};

var mods = requireAll("stepExecutors/**/*.ts", { cwd: __dirname });
var executors = _.defaultsDeep({}, ...mods);

// 拦截 error 事件
window.onerror = function (message, file, line) {
  ipcRenderer.sendToHost("error", message, `${file}:${line}`);
  // emitter.removeAllListeners();  增加此句后采集网站的错误会影响到规则录入
  console.debug("[webview.onerror] : ", `message:${message}`, `file:${file}`, `line:${line}`);
  return true;
};

window.onbeforeunload = function () {
  writeLog2File(`加载页面触发onbeforeunload `);
  emitter.removeAllListeners();
};

// 拦截 alert
window.alert = function (msg) {
  console.debug("[webview.alert] : ", msg);
};

// 重定向通知
ipcRenderer.on("redirect", function (e, location) {
  window["onRedirect"] && window["onRedirect"](location);
});

// 调用 `webview` 执行器的通用代理接口
ipcRenderer.on(EVENTS.executor, function (
  e,
  data,
  locals,
  resolveChannel,
  rejectChannel
) {
  let type = data.type,
    behavior = data.behavior;
  if (type && markNode[type]) {
    // 标记处理

    _executor(markNode[type]);
  } else if (_.isFunction(executors[behavior])) {
    // 行为处理


    _executor(executors[behavior]);
  } else {
    // 必须给与响应,即使是异步给与也可以
    // 但是如果没有任何匹配的处理器,将拒绝此次请求
    failBack();
  }

  async function _executor(fn) {
    try {
      await fn(data, locals || {}, resolveChannel, rejectChannel);
    } catch (e) {
      ipcRenderer.sendToHost(
        rejectChannel,
        `运行时报错:${getErrMsg(e)} `,
        `data: ${JSON.stringify(data)}`,
        `locals: ${JSON.stringify(locals || {})}`
      );
    }
  }

  function getErrMsg(e) {
    if (typeof e === "string") {
      return e;
    }
    return e ? e.stack : String(e);
  }

  function failBack() {
    ipcRenderer.sendToHost(rejectChannel, "无法找到处理器", data);
  }
});

var fireLoaded; // 保证只触发一次
document.addEventListener("DOMContentLoaded", fireLoadedHandle);
window.addEventListener("load", function (e) {
  window["_loaded"] = true;
  fireLoadedHandle(e);
});

// 此方法用来保证在触发在卡死与某些脚本时的网站,用来有效触发loaded事件
var mo = new MutationObserver(_.debounce(fireLoadedHandle, 20 * 1000));
delayElement(function () {
  mo.observe(document.body, {
    childList: true,
    subtree: true
  });
});

function delayElement(callback) {
  if (document.body) {
    callback();
  } else {
    setTimeout(delayElement.bind(null, callback), 13);
  }
}

function fireLoadedHandle(e) {
  if (location.href === "about:blank") {
    return;
  }
  // 如果存在onload处理器,那么等待onload处理完成后再执行
  if ((window.onload || document.body.onload) && e.type != "load") {
    return;
  }
  setTimeout(function () {
    if (!fireLoaded) {
      ipcRenderer.sendToHost("loaded");
    }
    mo.disconnect();
    fireLoaded = true;
  }, 1);
}

interface Window {
  _ajaxCount;
}

window._ajaxCount = 0;

let oldSend = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.send = function () {
  window._ajaxCount += 1;
  this._fire = false;
  this.addEventListener("load", function () {
    if (!this._fire) {
      window._ajaxCount -= 1;
    }
    this._fire = true;
  });
  this.addEventListener("error", function () {
    if (!this._fire) {
      window._ajaxCount -= 1;
    }
    this._fire = true;
  });
  oldSend.apply(this, arguments);
};
