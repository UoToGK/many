import { EventEmitter } from "events";
import { decodeBase64 } from "./decode";
import { resolve } from "path";
import { CAPTURE_MARK } from "../flow/properties";
import * as fs from "fs";
import { Socket } from "../socket";
import WebViewElement = Electron.WebViewElement;
import WebContents = Electron.WebContents;
import IpcMessageEvent = Electron.WebViewElement.IpcMessageEvent;
const electron = require("electron")
const remote = electron.remote
import { writeLog2File } from "../base/logger";

const moment = require("moment");
const _ = require("lodash");
const name = "weixin_pub";
/**
 * Created by uoto on 16/2/18.
 * 微信公众号采集处理程序
 * 通过关键词依次查询公众号，获取查询列表的第一个结果，访问它的文章列表，然后抓取它的文章列表链接内容
 * 访问的链接如下：将 ${key} 替换为公众号即可搜索对应公众号列表
 * `http://weixin.sogou.com/weixin?type=1&query=${key}&ie=utf8&_sug_=y&_sug_type_=`
 *
 * 程序从 run 方法开始运行antispider
 * 先使用 getLinks 方法 获取到所有的文章列表后，使用 getContents 方法依次访问文章的链接列表采集文章内容
 * 将 文章内容 通过 capture 事件发送
 *
 */

export class WeixinPub extends EventEmitter {
    static preloadFile = "./wechat_webview.js";
    idx: number;
    idx2: number;
    allLinks: number;
    flg: string = "";
    running: boolean;
    webview: WebViewElement;
    div: HTMLDivElement;
    webContents: WebContents;
    timeout = 20 * 1000;
    currentKey: string;
    httpreferrer: string
    promise: Promise<any>;
    timer;
    selectorArr = [];
    constructor(
        private $log: angular.ILogService,
        private keys: string[],
        private filters: string[],
        private token: string,
        private projectId: string,
        private socket: Socket,
        public CollectorProxyService
    ) {
        super();
        this.$log.debug(`微信任务初始化start`)
        this.idx = this.idx2 = 0;
        this.running = false;

        let data = {
            token: this.token, //采集端唯一标识
            method: "captchaLog", //请求方法名
            id: "",
            projectId: this.projectId, //项目ID
            requestTime: new Date(), //请求打码平台的时间（直接传入 java.util.Date 格式的时间）
            responseTime: new Date(), //打码平台响应的时间（直接传入 java.util.Date 格式的时间）
            picBase64: "", //验证码图片的 Base64 码字符串
            picCode: ""
        };
        this.socket && this.socket.send(data);
    }



    run() {
        if (this.running) {
            return this.promise;
        }

        this.running = true;

        return (this.promise = new Promise(resolve => {
            this.on("done", () => {
                resolve();
                this.promise = null;
            });
            this.createWebView();
            this.goTohome();
        }));
    }

    stop() {
        this.running = false;
        this.emit("done");
        if (this.webview) {
            this.webview.stop();
        }
        this.promise = null;
        this.webview = null;
    }

    remove() {
        this.stop();
        if (this.div) {
            document.body.removeChild(this.div);
            this.div = null;
            console.debug(`结束该任务${this.keys[0]}采集`)
        }
    }
    // 创建采集处理程序
    private createWebView() {
        this.div = document.createElement("div");

        this.div.classList.add("capture-webview");

        this.div.innerHTML = `
        <webview src="about:blank" 
                class="capture-webview"
                plugins
                partition="electron"
                preload="${resolve(
            __dirname,
            WeixinPub.preloadFile
        )}"></webview>
    `;
        this.webview = <WebViewElement>this.div.querySelector("webview");
        this.webview.addEventListener("ipc-message", ev => {
            if (!this.running) {
                return;
            }
            clearTimeout(this.timer);
            // 分发反馈信号到对应处理器
            if (this[ev.channel]) {
                this[ev.channel](ev);
            }
        });
        this.webview.addEventListener('dom-ready', () => {
            // this.webview.openDevTools()
        })

        this.webview.addEventListener("did-finish-load", () => {

            this.webview.send(this.flg, this.keys[this.idx]);
        });
        this.webview.addEventListener('new-window', (ev) => {
            this.webview.httpreferrer = this.httpreferrer
            this.webview.src = ev.url;
        })
        document.body.appendChild(this.div);
    }

    // 采集文章列表链接
    private goTohome() {
        clearTimeout(this.timer);
        if (!this.running) return;

        const key = this.keys[this.idx]//keys is 公众号或者关键词
        if (key) {

            this.flg = "executeSearch";
            this.webview.src = `https://weixin.sogou.com/`;//直接打开首页
            this.gameOver();
            return;


        }
    }

    private gameOver() {

        if (this.idx2 == 10 || this.selectorArr.length < this.idx2) {
            this.remove();
            return;

        }
    }

    // 处理调试信息
    private debug(ev: IpcMessageEvent) {
        console.debug(...ev.args);
    }


    // 内容采集的反馈
    private contentResult(ev: IpcMessageEvent) {
        const content: any = ev.args[0] || {};
        content.key = this.currentKey;
        this.trySave(content);
        console.debug("weixin内容采集的反馈 ", content);


    }

    // 公众号搜索的反馈，将文字列表链接收集起来
    private search_results(ev: IpcMessageEvent) {
        this.selectorArr = ev.args[0];
        this.httpreferrer = ev.args[1].replace('\)', '');
        if (!this.selectorArr.length) {
            console.debug('在条件内无元素，请检查关键词或者条件')
            this.remove();
            return;
        }
        if (this.selectorArr.length < this.idx2) {
            console.debug('在条件内已经获取完')
            this.gameOver();
            return;
        }
        this.getNext();
    }
    async  getNext() {
        console.debug(`开始获取第${this.idx2 + 1}个元素`)
        this.webview.send('getReadyToContent', this.selectorArr[this.idx2])
        if (await !this.webview.isLoading()) {
            this.flg = "content"
        }
    }
    finished() {
        console.debug('完成采集')
        this.idx2++;
        if (this.selectorArr.length < this.idx2 || this.selectorArr.length == this.idx2) {
            console.debug('finished 在条件内无元素或者已经获取完，请检查关键词或者条件')
            this.running = false;
            this.webview.src = "about:blank";
            setTimeout(() => {
                this.div = this.webContents = this.webview = null;
                this.emit("done");
            }, 10);
            this.gameOver();
            return;
        }
        this.goTohome()
    }
    private Over() {
        console.debug(' 在条件内无元素，请检查关键词或者条件')
        this.remove();
    }
    _idx = 0;
    // 保存
    async trySave(content) {
        const _keywords = [];

        if (
            content.publishTime &&
            moment().isSame(content.publishTime, "day") &&
            content.content
        ) {
            this.filters.forEach(function (keyword) {
                if (content.content.includes(keyword)) {
                    _keywords.push(keyword);
                }
            });
        }
        content["_idx"] = ++this._idx;
        //TODO：将网页转换成base64位编码，传向后台进行处理
        await this.webview.send("replaceImg");
        content[CAPTURE_MARK.pagePreview] = await this.getPagePreview(this.webview);
        // content.key = _keywords.join();
        console.debug(`数据发给TaskExecutor`)
        this.emit("capture", content);
    }

    private getPagePreview(webview: WebViewElement) {
        return new Promise((resolve, reject) => {
            const filePath = `./${Date.now()}.mhtml`;
            // const pdfPath = `./print_${this.idx2}.pdf`;
            function err_callback(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(`删除临时文件成功`);
                }
            }
            try {
                // webview.getWebContents().printToPDF({}, (error, data) => {
                //     if (error) throw error
                //     fs.writeFile(pdfPath, data, (error) => {
                //         if (error) throw error
                //         console.debug('Write PDF successfully.')
                //     })
                // })
                webview.getWebContents().savePage(filePath, "MHTML", async error => {
                    if (!error) {
                        // done
                        await resolve(btoa(this.Uint8ToString(fs.readFileSync(filePath))));

                        await fs.existsSync(filePath) && fs.unlink(filePath, err_callback); // 删除临时文件
                    } else {
                        resolve("");
                        await fs.existsSync(filePath) && fs.unlink(filePath, err_callback); // 删除临时文件

                    }
                });
            } catch (e) {
                reject(e);
                fs.existsSync(filePath) && fs.unlink(filePath, err_callback); // 删除临时文件
            }
        });
    }

    private Uint8ToString(u8a) {
        const CHUNK_SZ = 0x8000;
        const c = [];
        for (let i = 0; i < u8a.length; i += CHUNK_SZ) {
            c.push(String.fromCharCode.apply(null, u8a.subarray(i, i + CHUNK_SZ)));
        }
        return c.join("");
    }
    // 处理验证码
    private seccode(ev: IpcMessageEvent) {
        decodeBase64(ev.args[0], result => {
            // 如果验证码处理成功，则将它的返回值填回
            // 否则刷新 webview 重试
            //console.log("--------------"+ev.args[0]);
            console.debug("打码返回的结果：", result);
            let requestTime = new Date().getTime();

            if (result.success == "true" || result.success == true) {
                //请求参数传送到后台
                let data = {
                    token: this.token, //采集端唯一标识
                    method: "captchaLog", //请求方法名
                    projectId: this.projectId, //项目ID
                    requestTime: requestTime, //请求打码平台的时间（直接传入 java.util.Date 格式的时间）
                    responseTime: new Date().getTime(), //打码平台响应的时间（直接传入 java.util.Date 格式的时间）
                    picBase64: ev.args[0], //验证码图片的 Base64 码字符串
                    picCode: result
                };
                this.socket && this.socket.send(data);
                this.webview.send("antispider", result.code); //flg = 'links' or 'content'
            } else {
                this.webview.reload();
            }
        });
    }

    private initProxyInfo(webview: WebViewElement) {
        var proxyList: KvObj = this.getProxyList();
        if (proxyList) {
            //如果有代理信息，
            let proxyInfo = "";
            let httpProxy = [];
            let httpsProxy = [];
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
                proxyInfo = "http=" + _.join(_.shuffle(httpProxy), ",") + ",direct://";
            }
            if (httpsProxy.length) {
                if (proxyInfo.length) {
                    proxyInfo += ";";
                }
                proxyInfo +=
                    "https=" + _.join(_.shuffle(httpsProxy), ",") + ",direct://";
            }
            if (proxyInfo) {
                console.log("weixin 采集端使用代理信息：" + proxyInfo);
                webview
                    .getWebContents()
                    .session.setProxy(
                        { pacScript: "", proxyRules: proxyInfo, proxyBypassRules: "" },
                        function () {
                            console.log("weixin done proxy kind of things");
                        }
                    );
            }
        }
    }

    getProxyList() {
        return new Promise((resolve, reject) => {
            this.CollectorProxyService.get(
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
}


