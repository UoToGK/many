// Created by uoto on 16/5/12.
/// <reference path="./typings/ElectronWebView.d.ts"/>
/// <reference path="../../../typings/lodash/lodash.d.ts"/>
/// <reference path="../../../typings/moment/moment-node.d.ts"/>

import { resolve } from "path";
import {
  messageWrapper,
  registerWebRequestListener,
  removeWebRequestListener
} from "./tools/events";
import {
  CAPTURE_MARK,
  BEHAVIOR,
  OPEN_LINK_TIMEOUT,
  COLUMNS
} from "./properties";
import { extend, isEmpty, debounce, join, shuffle } from "lodash";
import { ipcRenderer } from "electron";
import * as fs from "fs";
import { delay } from "../base/util";
import moment = require("moment");
import { writeLog2File } from "../base/logger";
import * as $ from "jquery";
const http = require("http");
const https = require("https");
// const request = require('request');

export module Work {
  const preload = resolve(__dirname, "tools/preload.js");
  let interrupt = false;
  let RepeatNum = 0;
  // add by zhuxiaobin
  let isCapture = false;
  // 创建执行线程
  export function create(steps, locals, isTest?, _columns?) {
    interrupt = false;
    let run = true,
      next = false;
    let cycles = isMoreCycle(steps);
    let captureData = {};
    let div = createDom(locals, steps, isTest);
    debugger;
    return {
      // 默认启动第一个执行线程，开始执行步骤
      promise: fork(steps, locals, captureData),
      stop() {
        // 停止任务
        run = false;
        captureData = null;
      },
      gotoNext() {
        next = true;
      },
      remove() {
        run = false;
        if (div) {
          $(div).remove();
          // document.body.removeChild(div);
          //div = null;
        }
      }
    };

    async function testHttpProxy(ip, port) {
      return new Promise((resolve, reject) => {
        //以下是接受数据的代码
        var opt: KvObj = {
          method: "GET", //这里是发送的方法
          path: "http://www.ip138.com", //这里是访问的路径
          headers: {
            // "User-Agent":"Mozilla/5.0 (Windows NT 6.1; WOW64; rv:5.0) Gecko/20100101 Firefox/5.0"
            //这里放期望发送出去的请求头
          }
        };
        opt.host = ip;
        opt.port = port;
        var body = "";
        var req = http
          .request(opt, function(res) {
            res
              .on("data", function(d) {
                body += d;
              })
              .on("end", function() {
                resolve(true);
              });
          })
          .on("error", function(e) {
            console.log("Got error: " + e.message);
            reject("Got error: " + e.message);
          });
        req.end();
      });
    }

    async function testHttpsProxy(ip, port) {
      return new Promise((resolve, reject) => {
        //以下是接受数据的代码
        var opt = {
          host: "60.205.205.48",
          port: "80",
          method: "GET", //这里是发送的方法
          path: "http://www.ip138.com", //这里是访问的路径
          // Mozilla/ 5.0(Linux; U; Android 2.2; en - us; Nexus One Build / FRF91) AppleWebKit / 533.1(KHTML, like Gecko) Version / 4.0 Mobile Safari / 533.1
          headers: {
            // "User-Agent":"Mozilla/5.0 (Windows NT 6.1; WOW64; rv:5.0) Gecko/20100101 Firefox/5.0"
            //这里放期望发送出去的请求头
          }
        };
        opt.host = ip;
        opt.port = port;
        var body = "";
        var req = https
          .request(opt, function(res) {
            res
              .on("data", function(d) {
                body += d;
              })
              .on("end", function() {
                resolve(true);
              });
          })
          .on("error", function(e) {
            console.log("Got error: " + e.message);
            reject("Got error: " + e.message);
          });
        req.end();
      });
    }

    async function getProxyList(locals) {
      return new Promise((resolve, reject) => {
        locals.CollectorProxyService.get(
          { findAll: "true" },
          proxyList => {
            resolve(proxyList);
          },
          errors => {
            console.error("[getProxyList]", errors);
            reject("Got error: " + errors.message);
          }
        );
      });
    }

    /**
     * 创建执行线程
     * @param steps
     * @param locals
     * @param autoRemove
     * @returns {Array|{}|null}
     */
    async function fork(steps, locals: any = {}, captureData, autoRemove?) {
      // locals.webviewId = new Date().valueOf();

      // await delay(500)
      locals.webviewId = Date.now();
      let webview = <ElectronWebView>document.createElement("webview");
      if (locals.referrer || locals.cookies) {
        webview.httpreferrer = locals.referrer;
        webview.getWebContents().session.cookies = locals.cookies;
      }
      webview.id = locals.webviewId;
      webview.src = "about:blank";
      webview.plugins = "plugins";
      webview.preload = preload;
      // webview.partition = `persist:${locals.webviewId}`;
      webview.classList.add("webview-test");
      // webview.reloadIgnoringCache();
      div.appendChild(<any>webview);

      webview.addEventListener("console-message", async ars => {
        // webview.openDevTools();
      });
      messageWrapper(webview);
      // console.warn(emitter)
      registerWebRequestListener(webview, isTest);

      if (window["v"] && !autoRemove) {
        await clearAllData(window["v"]);
      }

      webview.debug = true;
      webview.progress = locals.progress;

      try {
        if (locals.isSupportProxy == "Y") {
          initProxyInfo(locals, webview);
        }
        return await runSteps(steps, webview, locals, captureData);
      } catch (e) {
        throw e;
      } finally {
        await clearAllData(webview);

        writeLog2File(
          `div下的webview个数：${div.querySelectorAll("webview").length}`
        );
        /**
         * Error: Cannot call stop because the webContents is unavailable.
         * The WebView must be attached to the DOM and the dom-ready event emitted before this method can be called.
         */
        webview.addEventListener("dom-ready", () => {
          webview.stop();
        });

        // //  console.warn(webview)
        // webview.eventEmitter.emit("did-navigate");
        // webview.eventEmitter.emit("crashed");
        // webview.eventEmitter.emit("will-destroy");
        // emitter.emit("did-navigate");
        // emitter.emit("crashed");
        // emitter.emit("will-destroy");
        removeWebRequestListener(webview);
        if (div && webview) {
          // emitter.removeAllListeners();
          // div.removeChild(<any>webview);
          $(webview).remove();
        }
      }
    }

    // 初始化需要使用的代理情况
    async function initProxyInfo(locals, webviewDom) {
      var proxyList: KvObj = await getProxyList(locals);
      if (proxyList) {
        //如果有代理信息，
        let proxyInfo = "";
        //{proxyRules:"218.107.137.197:8080"}
        let httpProxy = [];
        let httpsProxy = [];
        //let webviewDom=document.getElementById(locals.webviewId);//待测试使用
        await delay(2000);
        if (proxyList.http) {
          //类型区分
          for (var ele of proxyList.http) {
            // var isok=await
            // await testHttpProxy(ele.ip,ele.port);
            httpProxy.push(ele.ip + ":" + ele.port);
          }
        }
        if (proxyList.https) {
          for (var ele of proxyList.https) {
            // console.log(await testHttpsProxy(ele.ip,ele.port));
            httpsProxy.push(ele.ip + ":" + ele.port);
          }
        }
        //拼接代理串
        if (httpProxy.length) {
          proxyInfo = "http=" + join(shuffle(httpProxy), ",") + ",direct://";
        }
        if (httpsProxy.length) {
          if (proxyInfo.length) {
            proxyInfo += ";";
          }
          proxyInfo += "https=" + join(shuffle(httpsProxy), ",") + ",direct://";
        }
        if (proxyInfo) {
          console.log("采集端使用代理信息：" + proxyInfo);
          webviewDom
            .getWebContents()
            .session.setProxy({ proxyRules: proxyInfo }, function() {
              console.log("done proxy kind of things");
            });
        }
      }
    }

    function toJson(oBZ) {
      return oBZ
        ? JSON.stringify(
            oBZ,
            function(key, value) {
              var val = value;

              if (
                typeof key === "string" &&
                key.charAt(0) === "$" &&
                key.charAt(1) === "$"
              ) {
                val = undefined;
              } else if (key === "steps") {
                val = "$steps";
              } else if (key === "progress") {
                val = "$progress";
              }

              return val;
            },
            4
          )
        : "";
    }

    /**
     * 辅助方法，创建一个debug调试方法用来打印调试信息
     * @param webview
     * @returns {(step:any, locals:any, ...args:any[])=>undefined}
     */
    function createDebug(webview) {
      return function(step, locals, ...args) {
        locals.progress.emit(
          "debug",
          // `[${step.behavior}] ${args.join(" ")} ;
          //             step: ${toJson(step)} ;
          //             locals:${toJson(locals)} ;
          //             currentUrl:${webview.src}`
          `[${step.behavior}] ${args.join(" ")} 
                      currentUrl:${webview.src}`
        );
      };
    }

    /**
     * 开始运行步骤列表
     * 运行过程中，会将所有的返回值收集然后返回
     * @param steps
     * @param webview
     * @param locals
     * @returns {any}
     */
    async function runSteps(steps, webview, locals, parentData?) {
      let resultList = [];
      // let captureData = {};
      isCapture = false;
      if (parentData) {
        // 合并数据
        extend(captureData, parentData);
      }
      let debug: any = createDebug(webview);
      for (let i = 0; i < steps.length; i++) {
        if (!run || next) {
          break;
        }
        let step: IStepOption = steps[i],
          result;
        if (step.behavior === BEHAVIOR.openLink) {
          // 打开连接？
          try {
            let startTime = Date.now();
            await openLink(step, webview, locals);
            if (step.deplyTime) {
              await delay(step.deplyTime * 1000);
            }
            debug(step, locals, "链接打开所用时间 :", Date.now() - startTime);
          } catch (e) {
            debug(step, locals, String(e));
            break;
          }
        } else if (step.behavior === BEHAVIOR.openLinkBlank) {
          // 打开新页面链接？
          let url, _locals;
          try {
            let startTime = Date.now();
            url = await webview.executor(step, locals); // 获取新页面链接

            debug(step, locals, "获取子链接所用时间 :", Date.now() - startTime);
          } catch (e) {
            debug(step, locals, String(e));
            break;
          }
          if (url && step.steps.length) {
            /**
             * 如果新页面链接存在，并且有子流程可以处理
             * 则 通过 fork创建新的执行线程执行它
             */
            // add by zhuxiaobin
            console.log(`cycles::${cycles}`);
            if (cycles) {
              _locals = await extend(locals, { $1: url, fork: true });
            } else {
              _locals = await extend({ $1: url, fork: true }, locals);
            }
            delete locals["parentSelector"];
            let startTime = Date.now();

            await fork(step.steps, _locals, true);
            if (step.deplyTime) {
              await delay(step.deplyTime * 1000);
            }
            debug(
              step,
              locals,
              "子链接采集处理所用时间 :",
              Date.now() - startTime
            );
          }
        } else if (step.isPaging) {
          // 分页？
          result = await paging(step, webview, locals, captureData);
        } else if (step.behavior === BEHAVIOR.autoPaging) {
          //新增下拉分页功能
          for (let i = 0; i <= step.limit * 2; i++) {
            result = await webview.executor(step, locals);
          }
          result = await runSteps(step.steps, webview, locals, captureData);
        } else if (step.behavior === BEHAVIOR.customCycle) {
          // 自定义循环

          result = await customCycle(step, webview, locals, captureData);
        } else if (step.behavior === BEHAVIOR.captures) {
          // 采集处理
          try {
            result = await webview.executor(step, locals);
            // console.log("朱晓彬 每次提取的数据:", result);
            // writeLog2File(`朱晓彬 每次提取的数据:"`, "", result);
          } catch (e) {
            debug(step, locals, String(e));
            break;
          }
        } else if (step.behavior === BEHAVIOR.cycle) {
          // 普通列表循序
          if (interrupt) {
            console.log("中断循环", step.behavior, ",interrupt=", interrupt);
          } else {
            result = await cycle(step, webview, locals, captureData);
          }
        } else if (step.behavior === BEHAVIOR.getVerificationCode) {
          result = await webview.executor(step, locals);
          extend(locals, result);
        } else {
          //click
          // 事件处理,输入处理

          result = await webview.executor(step, locals);
          console.debug(`得到事件结果：${result}`);
        }
        //当前步骤处理完毕，合并采集数据
        if (result === false) {
          captureData = false;
          break; // 有任意一个规则不符合匹配规则,则跳过本轮,下面的所有抓取则都无效
        } else if (Array.isArray(result)) {
          //循环采集的结果
          pushData(resultList, result);
        } else if (!isEmpty(result)) {
          //采集结果
          extend(captureData, result);
        }
      }

      if (resultList.length) {
        // 如果是循环列表结果
        return resultList;
      } else if (!isEmpty(captureData)) {
        // 如果是采集结果
        if (locals[CAPTURE_MARK.parentUrl]) {
          captureData[CAPTURE_MARK.parentUrl] = locals[CAPTURE_MARK.parentUrl];
        }
        if (locals[CAPTURE_MARK.keys]) {
          captureData[CAPTURE_MARK.keys] = locals[CAPTURE_MARK.keys];
        }
        //当打开新选项卡时离线pdf
        if (locals.fork) {
          if (locals.setting && locals.setting.isSaveSnapshoot == "Y") {
            captureData[CAPTURE_MARK.pagePreview] = await getPagePreview(
              webview
            );
          }
        }
        //打开新选项卡的情况不会被触发
        if (locals.forkCycle || !locals.fork) {
          //TODO: 新增重复校验 locals.RepeatNum
          if (locals.progress.isRepeat) {
            //测试是否是重复记录
            if (await locals.progress.isRepeat(captureData)) {
              RepeatNum = RepeatNum + 1;
              if (RepeatNum > 5) {
                run = false;
              }
            } else {
              if (!isCapture) {
                locals.progress.emit("capture", captureData);
              }
              isCapture = true;
              captureData = {};
            }
          } else {
            //fix repeat capture  by zhuxiaobin
            if (!isCapture) {
              locals.progress.emit("capture", captureData);
            }
            isCapture = true;
            captureData = {};
          }
          // locals.progress.emit("capture", captureData);
          // isCapture = true;
          // captureData = {};
        }

        return captureData;
      } else if (captureData === false) {
        // 普通任务步骤，或许没有返回结果
        return false; // 返回 false 代表 未匹配的采集
      } else {
        return null; // null 代表普通无返回结果
      }
    }

    // 获取页面快照，将页面转换为 mhtml ，在转换为 base64
    function getPagePreview(webview: ElectronWebView) {
      return new Promise(function(resolve, reject) {
        const filePath = `./${Date.now()}.mhtml`;
        function err_callback(err) {
          if (err) {
            console.log(err);
          } else {
            console.log(`删除临时文件成功`);
          }
        }
        try {
          // 保存为 mhtml
          webview.getWebContents().savePage(filePath, "MHTML", error => {
            if (!error) {
              // done 转换为 base64
              resolve(btoa(Uint8ToString(fs.readFileSync(filePath))));

              fs.existsSync(filePath) && fs.unlink(filePath, err_callback); // 删除临时文件
            } else {
              resolve("");
            }
          });
        } catch (e) {
          reject(e);
          fs.existsSync(filePath) && fs.unlink(filePath, err_callback); // 删除临时文件
        }
      });
    }

    // 打开链接
    function openLink(step: ILinkStep, webview, locals) {
      //如果配置的参数包含$开头的占位
      let url = step.url;
      if (step.url && /\$\d+/.test(step.url)) {
        //step.url 不为空并以$加数字开头
        //提取$占位符
        let placeholder = step.url.match(/\$\d+/)[0]; //如：$1
        let purl = locals[placeholder];
        purl = step.url.replace(placeholder, purl);
        url = purl || step.url; //得到真实的url
      }
      //增加文件后缀名的校验，防止文件下载的情况出现，导致出现弹出框阻止程序的执行
      if (
        /(\.pdf|\.mpg|\.mpeg|\.avi|\.rm|\.rmvb|\.mov|\.wmv|\.asf|\.dat|\.mp3|\.wma|\.rm|\.ram|\.wav|\.mid|\.midi|\.rmi|\.m3u|\.wpl\.ogg|\.ape|\.cda|\.exe|\.msi|\.bat|\.txt|\.rtf|\.iaf|\.wab|\.doc|\.docx|\.xls|\.xlsx|\.ppt|\.pptx|\.chm|\.reg|\.dll|\.ini|\.log|\.ctt|\.fla|\.swf|\.zip|\.rar|\.cab|\.ace|\.arc|\.arj|\.lzh|\.tar|\.uue|\.gzip|\.iso|\.bin|\.fcd|\.img|\.c2d|\.tao|\.dao|\.vhd|\.jpeg|\.jpg|\.gif|\.bmp|\.png|\.ico|\.icl|\.psd|\.tif|\.cr2|\.crw|\.cur|\.ani|\.m3u8)$/.test(
          url.toLowerCase()
        )
      ) {
        console.log("URL异常：", url);
        url = "about:blank";
      }
      let __finish = "loaded";

      if (url && !locals[CAPTURE_MARK.parentUrl]) {
        locals[CAPTURE_MARK.parentUrl] = url;
      }

      function promiseBody(resolve, reject, runCount = 1) {
        let __resolve, __timer;
        webview.charset = step.charset || null;

        // 这里处理为 `debounce` 是因为考虑到如果涉及到页面内跳转
        // 或者重定向之类的处理时,此 finish 方法会触发多次才能跳转到正确页面
        __resolve = debounce(function() {
          removeListener();
          resolve();
        }, 600);
        __timer = setTimeout(function() {
          removeListener();
          if (!run || next) {
            return __resolve();
          }
          reject(`Work[openlink]警告: timeout open in ${url}`);
        }, OPEN_LINK_TIMEOUT * runCount);

        webview.eventEmitter.on(__finish, tryFinish);
        webview.eventEmitter.on("pageNotFound", notFound);
        ipcRenderer.on("download", download);

        function download() {
          clearTimeout(__timer);
          resolve(`download file in '${url}'`);
          removeListener();
        }

        function notFound() {
          clearTimeout(__timer);
          reject("警告:页面404 " + url);
          removeListener();
        }

        function tryFinish() {
          clearTimeout(__timer);
          __resolve();
        }

        function removeListener() {
          ipcRenderer["removeListener"]("download", download);
          webview.eventEmitter.removeListener(__finish, tryFinish);
          webview.eventEmitter.removeListener("pageNotFound", notFound);
        }

        if (url && typeof url === "string") {
          webview.src = url.trim(); // 开始访问页面

          // console.debug(`访问页面:${webview.src}`);
          writeLog2File(`Work[openlink]访问页面:${webview.src}`);
        } else {
          reject("Work[openlink]警告: url 不能为空");
        }
      }

      return new Promise(promiseBody);
    }

    // 自定义循环
    async function customCycle(step, webview, locals, captureData) {
      let result = [];
      let debug: any = createDebug(webview);

      let list = _.uniq(step.data);

      for (let i = 0; i < list.length; i++) {
        if (!run) {
          break;
        }
        next = false;
        let _locals = { $0: list[i] };
        if (isUrl(list[i])) {
          _locals[CAPTURE_MARK.parentUrl] = list[i];
        } else {
          _locals[CAPTURE_MARK.keys] = list[i];
        }
        if (locals.fork) {
          _locals["forkCycle"] = true;
        }

        try {
          // 开始处理循环
          let data = await runSteps(
            step.steps,
            webview,
            extend(locals, _locals),
            captureData
          );
          data && pushData(result, data);
        } catch (e) {
          debug(
            step,
            locals,
            "Work[customCycle]警告: 子步骤执行异常出错",
            String(e.stack || e)
          );
        }
      }
      // add
      list = null;
      return result;
    }

    // 二进制转字符串
    function Uint8ToString(u8a) {
      const CHUNK_SZ = 0x8000;
      const c = [];
      for (let i = 0; i < u8a.length; i += CHUNK_SZ) {
        c.push(String.fromCharCode.apply(null, u8a.subarray(i, i + CHUNK_SZ)));
      }
      return c.join("");
    }

    function isUrl(str) {
      return str && str.startsWith("http") && str.length > 10;
    }

    // 循环处理器
    async function cycle(step, webview, locals, captureData) {
      let debug: any = createDebug(webview);

      let response = await webview.executor(step, locals);
      let result: any = [];

      if (!response.list || !response.list.length) {
        debug(step, locals, "Work[cycle]警告: 循环列表为空", response.msg);
        console.debug(
          step,
          locals,
          "Work[cycle]警告: 循环列表为空",
          response.msg
        );
        return result;
      }

      let list = response.list;

      for (let i = 0; i < list.length; i++) {
        if (!run || next) {
          break;
        }

        try {
          let data = null;
          let _locals = { parentSelector: list[i], forkCycle: locals.fork };
          // 开始处理循环列表 add by zhuxiaobin
          data = await runSteps(
            step.steps,
            webview,
            extend(locals, _locals),
            captureData
          );
          data && pushData(result, data);
        } catch (e) {
          debug(
            step,
            locals,
            "Work[cycle]警告:循环步骤执行报错",
            String(e.stack || e)
          );
        }
      }
      return result;
    }

    // 分页处理器
    async function paging(step: IPagingStep, webview, locals, captureData) {
      var len = 1;
      var result = [];
      var noResult = 0;
      let debug: any = createDebug(webview);
      while (true) {
        if (!run || next) {
          break;
        }

        let data = null;
        try {
          // 先执行分页处理的子步骤
          data = await runSteps(step.steps, webview, locals, captureData);
          // data && pushDat3a(result, data);
          // console.debug(`得到分页数据:${data}`);
        } catch (e) {
          debug(
            step,
            locals,
            "Work[paging]警告:分页循环出错",
            String(e.stack || e)
          );
        }

        /**
         * 如果分页未采集到数据，超过n页后，将停止分页继续采集
         */
        if (!data || !data.length) {
          noResult += 1;
        } else {
          noResult = 0; // 如果中途发现有内容,则重新初始化计数器
        }
        if (noResult == 3) {
          // 当连续3页无数据时,中断分页;
          // console.debug("分页 -> 结束,因为发现连续3页已匹配的无采集结果");
          writeLog2File(`分页 -> 结束,因为发现连续3页已匹配的无采集结果`);
          debug(step, locals, "分页 -> 结束,因为发现连续3页已匹配的无采集结果");
          break;
        }

        locals.progress.emit("paging", webview.src);

        // 如果有限制分页数量,标签满足条件时,中断它
        if (step.limit > 0 && step.limit == len) {
          locals.progress.emit(
            "debug",
            "分页 -> 结束,因为达到预设的分页数量 : " + step.limit + "页"
          );
          // debug(
          //   step,
          //   locals,
          //   "分页 -> 结束,因为达到预设的分页数量",
          //   step.limit,
          //   "页"
          // );

          break;
        }

        // 发送步骤判断是否还有下一页
        let hasNextPaging = await webview.executor(step, locals);

        if (!hasNextPaging) {
          writeLog2File(`分页 -> 结束,共有${len}页`);
          // console.debug("分页 -> 结束,共有 :", len, "页");
          break;
        }
        writeLog2File(`分页 -> 第 : ${++len}页`);
        // console.debug("分页 -> 第 :", ++len, "页");
        await clear(webview);
        if (step.deplyTime) {
          await delay(step.deplyTime * 1000);
        }
      }
      return result;
    }
  }

  /**
   * 清除缓存数据
   */
  export function clearAllData(webview) {
    return new Promise(function(resolve) {
      try {
        logTimestep("[clearAll]");
        let wc = webview.getWebContents();
        wc.session.clearStorageData(
          {
            storages: [
              "appcache",
              "cookies",
              "local storage",
              "serviceworkers"
            ],
            quotas: ["temporary", "persistent", "syncable"]
          },
          resolve()
        );
      } catch (e) {
        resolve();
      }
    });
  }

  /**
   * 清除缓存数据
   */
  function clear(webview) {
    return new Promise(function(resolve) {
      try {
        logTimestep("[clear]");
        let wc = webview.getWebContents();
        wc.session.clearStorageData(
          {
            storages: ["appcache", "serviceworkers"],
            quotas: ["temporary", "persistent", "syncable"]
          },
          resolve
        );
      } catch (e) {
        resolve();
      }
    });
  }

  // 带时间戳的控制台打印
  function logTimestep(msg) {
    console.info(
      `zxb : ${moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")}:${msg}`
    );
  }

  // 创建渲染dom
  function createDom(locals, steps, testRun) {
    let div = document.createElement("div");
    document.body.appendChild(div);

    if (testRun) {
      /**
       * 如果是测试运行模式，选择一个表格，将采集到的数据展示到表格中
       */
      let cols = queryColumns(steps);
      let dataView = $('<div class="webview-data-test"></div>');
      let table = $(
        '<table class="table table-bordered table-striped table-condensed table-hover"></table>'
      );
      let thead = $("<thead></thead>");
      thead.append(`<tr><th>序号</th>${renderCols(cols, locals.columns)}</tr>`);
      dataView.append(table);

      let tbody = $("<tbody></tbody>");

      table.append(thead, tbody);

      let html = "";
      let data = "";
      let idx = 0;

      let render = debounce(function() {
        tbody.append(html);
        html = "";
      }, 200);

      // 监听，如果有采集到的数据，渲染它
      locals.progress.on("capture", function(data) {
        idx++;
        html += `<tr><td>${idx}</td>${renderCapture(data, cols)}</tr>`;
        // data += `${idx}  ${renderCapture(data, cols)}\r\n`
        // fs.writeFile(`./${moment(Date.now()).format("YYYY-MM-DD")}.txt`, data, { flag: 'a' }, function (err) {
        //   err && console.error(err)
        //   console.log()
        // })
        render();
      });

      dataView.appendTo(div);
    } else {
      div.classList.add("capture-webview");
    }

    return div;
  }

  function renderCapture(data, cols) {
    // 渲染采集的数据到表格内容
    return cols
      .map(function(col: ICapture) {
        let val = normalStr(data[col.columnName] || "");
        return `<td title="${val}">${strLimit(val)}</td>`;
      })
      .join("");
  }

  function normalStr(str) {
    // 格式化标签，引号
    return String(str)
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // 截取字符串
  function strLimit(str) {
    if (str.length > 20) {
      return str.slice(0, 20) + "...";
    }
    return str;
  }

  // 将数据列转换为列头
  function renderCols(cols: ICapture[], tcolumns): string {
    return cols
      .map(function(col: ICapture) {
        return `<th>${getColumnDesc(col, tcolumns)}</th>`;
      })
      .join("");
  }

  export function getColumnDesc(col, tcolumns?) {
    // 获取列描述信息
    if (col && !col.columnDesc) {
      if (tcolumns) {
        col = tcolumns.find(column => column.columnName == col.columnName);
      } else {
        col = COLUMNS.find(column => column.columnName == col.columnName);
      }
    }
    return col ? col.columnDesc : "";
  }

  /**
   * 在步骤列表中查找采集/抓取的步骤信息
   * @param steps
   * @returns {Array}
   */
  export function queryColumns(steps) {
    const cols = [];
    const findColumn = (list: IStepOption[] = []) => {
      list.forEach(function(item) {
        if (item.steps && item.steps.length) {
          findColumn(item.steps);
        } else if (item.behavior === BEHAVIOR.captures) {
          cols.push(...(<ICaptureStep>item).captures);
        }
      });
    };

    findColumn(steps);

    return cols;
  }

  function pushData(list, data) {
    if (Array.isArray(data)) {
      list.push(...data);
    } else {
      list.push(data);
    }
  }
}
function isMoreCycle(steps: IStepOption[]): boolean {
  let count = 0;
  return (function calcCount(steps) {
    steps.forEach(step => {
      if (
        step.behavior == BEHAVIOR.cycle ||
        step.behavior == BEHAVIOR.customCycle
      ) {
        count++;
        if (step.steps) {
          return calcCount(step.steps);
        }
      } else {
        if (
          step.behavior == BEHAVIOR.openLinkBlank ||
          step.behavior == BEHAVIOR.paging ||
          step.behavior == BEHAVIOR.autoPaging
        ) {
          return calcCount(step.steps);
        }
      }
    });
    return count >= 2 ? true : false;
  })(steps);
}
