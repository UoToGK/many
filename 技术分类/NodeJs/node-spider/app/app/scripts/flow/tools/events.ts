/// <reference path="../../../../typings/angularjs/angular.d.ts" />
// Created by uoto on 16/4/15.
//事件模块
//发送事件到主机or发送事件到webview
import { onFrameReady, getCssPath, queryElement } from "./dom";
import { EventEmitter } from "events";
import { EXECUTOR_TIMEOUT, ATTRS, REGEXP, EVENTS, BEHAVIOR, MARK_AUTOPAGING_EXECUTOR_TIMEOUT } from "../properties";
import { delay } from "../../base/util";
import _ = require("lodash");
import { writeLog2File } from "../../base/logger";


// 监听器个数,默认 `10` 个,在监听大于10个时会警告
// 设置为 `0` 时将无限制,可以任意设置监听器
const MaxListener = 0;

var didLoaded = "loaded"; // did-finish-load
/**
 * 通信接口封装
 * 使信息通过 `events.EventEmitter` 来代理发送
 * @param webview
 * @returns {"events".EventEmitter}
 */
export function messageWrapper(webview: ElectronWebView) {
  var eventEmitter = new EventEmitter().setMaxListeners(MaxListener);

  webview.addEventListener("ipc-message", function (e: any) {
    writeLog2File(`加载页面发射${e.channel}`);
    if (e.channel === "isDynamic") {
      messageWrapper.prototype.isDynamic = e.args[0];
      return;
    }
    eventEmitter.emit(e.channel, e.args.length <= 1 ? e.args[0] : e.args);
  });
  webview.addEventListener("dom-ready", function (e) {
    writeLog2File(`加载页面dom-ready`, ``, e);
    eventEmitter.emit("dom-ready", e);
  });
  webview.addEventListener("did-finish-load", function (e) {
    writeLog2File(`加载页面 did-finish-load`, ``, e);
    eventEmitter.emit("did-finish-load");
  });
  webview.addEventListener("did-fail-load", function (e) {
    eventEmitter.emit("did-fail-load");
  });

  webview.eventEmitter = eventEmitter;
  eventEmitter.on('will-navigate', ev => {
    writeLog2File(`webview监听will-navigate`, ``, ev);
  })
  eventEmitter.on("debug", function (args) {
    if (args && Array.isArray(args)) {
      writeLog2File(`webview监听 debug`, ``, args);
      console.debug(...args);
    } else {
      writeLog2File(`webview监听 debug`, ``, args);
      console.debug(args);
    }
  });

  eventEmitter.on("error", function (args) {
    writeLog2File(`webview监听 error`, ``, args);
  });

  eventEmitter.on("new-window", function (e) {
    writeLog2File(`webview监听 new-window`, ``, e.url);
    webview.src = e.url;
  });

  eventEmitter.on("setRedirect", function () {
    writeLog2File(`webview监听 setRedirect`);
    webview.redirect = true;
  });
  eventEmitter.on('did-navigate-in-page', function (ev) {
    writeLog2File(`webview监听 did-navigate-in-page`);
  })
  eventEmitter.on("unRedirect", function () {
    writeLog2File(`webview监听 unRedirect`);
    webview.redirect = false;
  });

  var { once, removeListener } = eventEmitter;
  once = once.bind(eventEmitter);
  removeListener = removeListener.bind(eventEmitter);

  /**
   * 执行step
   * @param data 步骤信息
   * @param locals 环境上下文数据
   * @example
   * <example>
   *     <file name="file.ts">
   *         async function fn(steps:IStepOption[]){
   *             for (let i=0; i<steps.length; i++){
   *               let res = await webview.executor(steps[i] , {});
   *               console.log(res);
   *             }
   *         }
   *     </file>
   * </example>
   * @returns {Promise}
   */
  webview.executor = function (data, locals?: any): Promise<any> {
    return new Promise(function (resolve, reject) {
      var id = getNextId();
      var resolveEvent = `executor_proxy_resolve_${id}`;
      var rejectEvent = `executor_proxy_reject_${id}`;

      once(resolveEvent, resolveHandle); //成功回调
      once(rejectEvent, rejectHandle); //失败回调
      var timeout;
      if (data.behavior === BEHAVIOR.autoPaging) {

        timeout = window.setTimeout(function () {
          removeListener(resolveEvent, resolveHandle);
          removeListener(rejectEvent, rejectHandle);
          reject(
            "executorTimeout : step = " +
            angular.toJson(data, true) +
            "; locals = " +
            angular.toJson(locals, true)
          );
        }, MARK_AUTOPAGING_EXECUTOR_TIMEOUT);//当存在下拉次数比较多的时容易导致超时
      } else {
        timeout = window.setTimeout(function () {
          removeListener(resolveEvent, resolveHandle);
          removeListener(rejectEvent, rejectHandle);
          reject(
            "executorTimeout : step = " +
            angular.toJson(data, true) +
            "; locals = " +
            angular.toJson(locals, true)
          );
        }, EXECUTOR_TIMEOUT);
      }


      let startTime = Date.now();

      try {
        data = _.cloneDeep(data);
        delete data.$$dom;
        if (data.step) {
          delete data.step.$$dom;
        }
        if (data.steps) {
          delete data.steps;
        }
        locals = _.cloneDeep(locals || {});
        delete locals.progress;
        safeSend(webview, data, locals, resolveEvent, rejectEvent);
      } catch (e) {
        // 如果出现异常,就把刚注册的事件取消掉,并且将异常抛出
        removeListener(resolveEvent, resolveHandle);
        removeListener(rejectEvent, rejectHandle);

        throw e;
      }

      function debugTime() {
        if (webview.debug && data && data.behavior) {
          webview.progress.emit(
            "debug",
            `[${data.behavior}]步骤执行时间 : ${Date.now() - startTime}`
          );
        }
      }

      //步骤执行成功的回调处理方法，returnVal 为返回的数据：json\数组
      function resolveHandle(returnVal) {
        writeLog2File(`成功回调触发,得到returnVal值`);
        clearTimeout(timeout);
        resolve(returnVal);
        removeListener(rejectEvent, rejectHandle);
        removeDomReady();
        debugTime();
      }

      //步骤执行失败的回调处理方法
      function rejectHandle(rejectVal) {
        writeLog2File(`错误回调触发,得到rejectVal值`, "");
        clearTimeout(timeout);
        reject(rejectVal);
        removeListener(resolveEvent, resolveHandle);
        removeDomReady(); //删除 did-finish-load 监听
        debugTime(); //计算些步骤的执行时间
      }

      function removeDomReady() {
        eventEmitter.removeAllListeners(didLoaded);
      }
    });
  };

  return eventEmitter;
}

var id = 0;

function getNextId() {
  return ++id;
}

// 安全的发送器
function safeSend(webview: ElectronWebView, ...args) {
  if (webview.src) {
    try {
      // 在调用 `webview.isLoading()` 方法时,如果页面未加载完成时
      // `webview` 没有准备好,会抛出异常 `on promise`
      console.log(`webview已准备就绪:${!webview.isLoading()}`)
      if (!webview.isLoading()) {
        // 如果webview已准备就绪
        return send();
      }
    } catch (e) {
      // 如果它没有准备就绪,那等它准备就绪后,调用发送
      return webview.eventEmitter.on(didLoaded, send);
    }
    // 这里多次触发send事件没有关系
    // 因为上面的确认触发的 resolve 只会触发一次
    webview.eventEmitter.on(didLoaded, send);
    send();
  } else {
    // 当webview没有src属性时,表示为空的webview,抛出一个异常
    throw new Error("WebView did not load the page");
  }

  function send() {
    webview.send(EVENTS.executor, ...args);
  }
}

const IGER = {
  "application/x-shockwave-flash": true,
  "application/x-font-woff": true
};

/**
 * 给未设置content-type的目标网页/文本设置gbk编码
 */
export function registerWebRequestListener(webview, isTest?) {
  webViewList.push(webview);

  return new Promise(async function (resolve, reject) {
    let session = await getSession(webview);

    let resourceMap = {};

    function addTimer(url, type) {
      resourceMap[url] = setTimeout(function () {
        // webview && webview.progress && webview.progress.emit('badResource', webview.src, url, type);
      }, 30 * 1000); // 30s 超时
    }

    function clearTimer(url) {
      clearTimeout(resourceMap[url]);
      delete resourceMap[url];
    }

    session.webRequest.onBeforeSendHeaders(function (details, callback) {
      let { resourceType, requestHeaders } = details;
      requestHeaders["User-Agent"] = "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.82 Electron/1.3.0 Safari/537.36"
      if (resourceType != "mainFrame") {
        // 不计算主页面
        addTimer(details.url, resourceType);
      }
      callback({ cancel: false, requestHeaders: details.requestHeaders });
    });

    session.webRequest.onCompleted(function (details) {
      let { resourceType } = details;
      if (resourceType !== "mainFrame") {
        //clearTimer(details.url);
      }
    });

    session.webRequest.onHeadersReceived(function (details, callback) {
      let { responseHeaders, statusCode, resourceType } = details;

      if (resourceType === "mainFrame" && statusCode === 404) {
        webview.eventEmitter.emit("pageNotFound", 404);
        return callback({ cancel: true });
      }
      let contentType = responseHeaders["Content-Type"] || [];
      let type = contentType[0] + "";
      if (
        webview.charset &&
        type &&
        type.indexOf("text/") > -1 &&
        type.indexOf("charset") === -1
      ) {
        contentType = [`${contentType[0]}; charset=${webview.charset}`];
        responseHeaders["Content-Type"] = contentType.toString();
      }

      if (
        !isTest &&
        /*/image|video|audio/.test(resourceType) ||*/ IGER[contentType.toString()]
      ) {
        return callback({ cancel: true });
      }
      /*
             var Location = responseHeaders['Location'];
             // 重定向捕捉
             if (webview.redirect && (statusCode === 302 || statusCode === 301) && Location && Location[0]) {
             webview.send('redirect', Location[0]);
             return callback({cancel: true});
             }
             */

      callback({ cancel: false, responseHeaders: responseHeaders });
    });
    //-----------------------------------------------------

    const filter = {
      urls: ["*iris111*", "*.html11"]
    };
    session.webRequest.onBeforeRequest(filter, (details, callback) => {
      //阻止弹框
      //增加文件后缀名的校验，防止文件下载的情况出现，导致出现弹出框阻止程序的执行
      //阻止 ad.doubleclick.net 网站的广告弹出 /galaxy|sogoubrand_position/.test(details.url.toLowerCase())||
      if (
        /galaxy\.sogoucdn\.com/.test(details.url.toLowerCase()) ||
        /ad\.doubleclick\.net/.test(details.url.toLowerCase()) ||
        /x\.union\.meituan\.com\/movie/.test(details.url.toLowerCase()) ||
        /szbbs.sznews.com\/shortcut.php/.test(details.url.toLowerCase())

      ) {
        callback({ cancel: true });
      } else if (
        /(\.pdf|\.mpg|\.mpeg|\.avi|\.rm|\.rmvb|\.mov|\.wmv|\.asf|\.dat|\.mp3|\.wma|\.rm|\.ram|\.wav|\.mid|\.midi|\.rmi|\.m3u|\.wpl\.ogg|\.ape|\.cda|\.exe|\.msi|\.bat|\.txt|\.rtf|\.iaf|\.wab|\.doc|\.docx|\.xls|\.xlsx|\.ppt|\.pptx|\.chm|\.reg|\.dll|\.ini|\.log|\.ctt|\.fla|\.swf|\.zip|\.rar|\.cab|\.ace|\.arc|\.arj|\.lzh|\.tar|\.uue|\.gzip|\.iso|\.bin|\.fcd|\.img|\.c2d|\.tao|\.dao|\.vhd|\.cr2|\.crw|\.cur|\.ani|\.m3u8|\.jsp)$/.test(
          details.url.toLowerCase()
        )
      ) {
        //增加文件后缀名的校验，防止文件下载的情况出现，导致出现弹出框阻止程序的执行
        callback({ cancel: true });
      } else {
        callback({ cancel: false });
      }
    });
    resolve();
  });
}

var webViewList = [];
window.onbeforeunload = function () {
  writeLog2File(
    `webview 页面触发onbeforeunload ==webViewList个数 ${webViewList.length}`
  );
  webViewList.forEach(removeWebRequestListener);
};

async function getSession(webview) {
  let { remote } = require("electron");
  while (true) {
    // let wc = webview.getWebContents();
    let wc = remote.getCurrentWebContents();
    if (wc && wc.session) {
      return wc.session;
    }
    await delay(13);
  }
}

export function removeWebRequestListener(webview: ElectronWebView) {
  try {
    _.pull(webViewList, webview);
    let wc = webview.getWebContents();
    if (wc && wc.session) {
      wc.session.webRequest.onHeadersReceived(null);
      wc.session.webRequest.onBeforeSendHeaders(null);
      wc.session.removeAllListeners();
      // wc.emit("destroyed");
      // wc.emit("did-navigate");
      // wc.emit("crashed");
      // wc.emit("will-destroy");
      // wc.session.clearCache(() => {
      //   // console.log("clear Cache");
      // });
      // wc.session.clearStorageData(() => {
      //   // console.log("clear storageData");
      // });
      // wc.session.clearHostResolverCache(() => {
      //   // console.log("clearHostResolverCache");
      // });
      // wc.clearHistory();
      // wc.removeAllListeners();
      wc.stop();
    }
  } catch (e) {
    writeLog2File(`[removeWebRequestListener]`, "", e);
    // console.log("[removeWebRequestListener]", e);
  }
}

/**
 * 拦截document事件
 * 并且将该dom下的所有iframe事件也做封装
 * 使事件通过 `events.EventEmitter` 来代理发送
 * 除非dom上绑定属性 `allowed = true`的事件,其它都不允许触发任何事件
 * @param document
 * @param css
 * @returns {"events".EventEmitter}
 */
export function wrapper(document, css?) {
  //在默认情况下，同一个指定的事件，最多可以绑定10个事件处理函数。也可以通过下面的方法修改:
  var eventEmitter = new EventEmitter().setMaxListeners(MaxListener);
  var select;
  eventEmitter.on("mousedown", function (e) {
    select = e.target;
    if (REGEXP.igTag.test(select.localName)) {
      select = null;
    }
  });
  eventEmitter.on("mouseup", function (e) {
    if (select && select === e.target) {
      eventEmitter.emit(EVENTS.elementSelect, e);
    }
    select = void 0;
  });

  interceptor(document, eventEmitter, css);

  return eventEmitter;
}
// mouseenter mouseleave
var events = " mousedown mouseup mouseover mouseout  click dblclick keydown keyup focus input keypress".split(
  " "
);

//事件拦截
function interceptor(
  doc: IframeDocument,
  eventEmitter: EventEmitter,
  css?: string
) {
  if (!doc || doc.isAddEvent) {
    return;
  }

  events.forEach(function (type) {
    doc.addEventListener(
      type,
      function (e) {
        eventEmitter.emit(type, e);
        interceptorEvent(e);
      },
      true
    );
  });


  //阻止所有事件,但是有 custom 的事件除外 事件句柄在捕获阶段执行
  doc.addEventListener("click", interceptorEvent, true);


  /** 鼠标滑过后,突出标签样式 */
  doc.addEventListener(
    "mouseover",
    function (e) {
      var target = <HTMLElement>e.target;
      if (REGEXP.igTag.test(target.localName)) {
        return;
      }
      target.setAttribute(ATTRS.hover, "true");
      stop(e);
    },
    true
  );


  doc.addEventListener(
    "mouseout",
    function (e) {
      var target = <HTMLElement>e.target;

      if (REGEXP.igTag.test(target.localName)) {
        return;
      }
      target.removeAttribute(ATTRS.hover);
      stop(e);
    },
    true
  );
  css && putCss(doc, css);

  var fire = _.debounce(function () {
    eventInterceptor(doc, eventEmitter, css);
  }, 100);

  doc.isAddEvent = true;

  var win: any = doc.defaultView;
  var oldPush = win.history.pushState;
  var oldReplace = win.history.replaceState;
  /**DOM 变动  更新*/
  doc.addEventListener("DOMContentLoaded", function () {
    //4月6日修改 处理electron升级bug
    if (win.MutationObserver) {
      var observer = new MutationObserver(fire);
      observer.observe(doc.body, {
        childList: true,
        subtree: true
      });
    }
    fire();
  });

  win.history.pushState = function () {
    oldPush.apply(this, arguments);
    dispatchEvent(win);
  };

  win.history.replaceState = function () {
    oldReplace.apply(this, arguments);
    dispatchEvent(win);
  };
  let open = win.open;
  win.open = function (url, name) {
    if (window["onOpen"]) {
      window["onOpen"](url, name);
    } else {
      open.call(win, url, name);
    }
  };

  // 锁定对象原型,不许扩展
  win.Object.freeze(win.HTMLElement.prototype);
  win.Object.freeze(win.Node.prototype);
  win.Object.freeze(win.Element.prototype);
}

function dispatchEvent(win) {
  var e = document.createEvent("Event");
  e.initEvent("popstate", true, true);
  win.dispatchEvent(e);
}

interface IframeDocument extends Document {
  iframePath: string; // iframe的路径
  parentDoc: IframeDocument; // 父document,也就是iframe框架所属的document
  isAddEvent: boolean; //事件拦截后,这个属性设置为true
}

async function eventInterceptor(doc: IframeDocument, eventEmitter, css) {
  var frames = Array.prototype.slice.call(doc.querySelectorAll("iframe")),
    iframe;

  // 拦截form表单的提交事件
  _.each(doc.forms, function (form: HTMLFormElement) {
    if (!form["eventInterceptor"]) {
      let old = form.onsubmit;
      form.onsubmit = function (ev) {
        if (!old || old.call(this, ev) !== false) {
          // 当form表单提交get事件时,做此处理
          if (form.method.toLowerCase() === "get" && window["onGetForm"]) {
            window["onGetForm"](this, ev);
            return false;
          }
        }
      };
    }
    form["eventInterceptor"] = true;
  });

  for (let i = 0; (iframe = frames[i++]);) {
    if (iframe._interceptor) {
      continue;
    }
    iframe._interceptor = true;
    let iframeDoc;
    try {
      // frame准备就绪后才执行操作
      // 当此 iframe 访问的页面为跨域访问时
      // 此处访问 `contentDocument` 会报错
      await onFrameReady(iframe);
      iframeDoc = <IframeDocument>iframe.contentDocument;
    } catch (e) {
      continue;
    }

    if (iframeDoc) {
      setIframeVars(iframeDoc, doc, iframe);
      interceptor(iframeDoc, eventEmitter, css);
    }
  }
}

export function setIframeVars(doc, parentDoc, iframe) {
  doc.iframePath = getCssPath(iframe, false);
  doc.parentDoc = parentDoc;
}

function interceptorEvent(e) {
  /**  
   * 除非触发事件的元素有allowed允许触发,否则全部阻止
   */
  if (e.target.allowed) {

    setTimeout(function () {
      delete e.target.allowed; //之后,将删掉此属性
    });
  } else {
    stop(e)
  }
}

/**
 * 将css样式加入
 * @param doc
 * @param css
 * @returns {Promise<void>}
 */
async function putCss(doc, css) {
  var style = doc.createElement("style");
  style.id = "iris_style";
  style.dataset["for"] = "iris";
  style.appendChild(doc.createTextNode(css));
  if (doc.head || doc.body) {
    (doc.head || doc.body).appendChild(style);
  } else {
    let el = await queryElement("head", doc);
    if (el) {
      el.appendChild(style);
    }
  }
}


function stop(e: MouseEvent) {
  if (e.type == 'mouseover') {
    e.preventDefault();
  } else if (e.type == 'mouseout') {
    e.preventDefault();
  } else {
    e.preventDefault();
    e.stopPropagation();
  }
}


