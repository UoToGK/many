/// <reference path="../flow/typings/ElectronWebView.d.ts"/>
import { EventEmitter } from "events";
import WebViewElement = Electron.webviewTag;
import WebContents = Electron.WebContents;
import { decodeBase64 } from "./decode";
import { resolve } from "path";
import IpcMessageEvent = Electron.IpcMessageEvent;
/**
 * 10.1.16.79
10.1.16.78    crawuser/crawPAIC2019
 * Created by uoto on 16/2/18.
 *
 * 微信采集程序
 *
 * 根据关键词搜索微信列表，然后采集列表的文章，采集链接如下，${key} 应该替换成关键词如： 中国人寿
 * `http://weixin.sogou.com/weixin?query=${key}&sourceid=inttime_day&ri=0&type=2&ie=utf8&tsn=1`
 *
 * 程序运行从 run 方法开始，
 * 启动时调用 getLinks 方法获取所有的文章列表地址，记录到 links 中
 * 然后从getLinks内部触发 getContents 依次访问收集到的文章列表地址，获取文章内容
 * contentResult 和 linksResult 分别是获取到文章链接和内容时的反馈
 * seccode 方法当程序检测到存在验证码程序时触发解码程序
 */
export class Weixin extends EventEmitter {
    static preloadFile = './webview/weixin.js';
    idx: number;
    idx2: number;
    links: any[];
    allLinks: number;
    flg: string = '';
    running: boolean;
    webview: ElectronWebView;
    timeout = 20 * 100;
    currentKey: string;

    constructor(private $log: angular.ILogService,
        private keys: string[]) {
        super();
        this.idx = this.idx2 = this.allLinks = 0;
        this.links = [];
        this.running = false;
    }

    private promise;

    run() {
        if (this.running) {
            return this.promise;
        }

        this.running = true;
        return this.promise = new Promise((resolve) => {
            this.on('done', () => {
                resolve();
                this.promise = null;
            });
            this.createWebView();
            this.getLinks();
        });
    }

    private timer;

    /**
     * 获取文章列表
     */
    getLinks() {
        clearTimeout(this.timer);
        if (!this.running) return;

        const key = this.currentKey = this.keys[this.idx];
        if (key) {
            this.webview.src = `http://weixin.sogou.com/weixin?query=${key}&sourceid=inttime_day&ri=0&type=2&ie=utf8&tsn=1`;
            this.idx++;
            this.flg = 'links';
            this.timer = setTimeout(() => this.getLinks(), this.timeout);
            return;
        }

        this.$log.debug(name, ' links all done', this.links);

        this.idx = this.idx2 = 0;

        this.getContents();
    }

    /**
     * 获取文章内容
     */
    getContents() {
        clearTimeout(this.timer);

        if (!this.running) return;

        const link = this.links[this.idx];

        if (link) {
            this.currentKey = link.key;

            if (link.links[this.idx2]) {
                this.webview.src = link.links[this.idx2];
            }

            this.idx2++;

            if (!link.links[this.idx2]) {
                this.idx++;
                this.idx2 = 0;
            }

            this.flg = 'content';
            this.timer = setTimeout(() => this.getContents(), this.timeout);

            return;
        }

        this.$log.log(name, ' content all done');

        this.running = false;
        this.webview.src = 'about:blank';
        setTimeout(() => {
            // end & destroy
            document.body.removeChild(<any>this.webview);
            this.emit('done');
        }, 10);
    }

    /**
     * 创建采集处理程序
     */
    private createWebView() {
        this.webview =<ElectronWebView> document.createElement('webview');
        this.webview.preload = resolve(__dirname, Weixin.preloadFile);
        document.body.appendChild(this.webview);
        this.webview.addEventListener('ipc-message', ev => {
            if (!this.running) {
                return;
            }
            clearTimeout(this.timer);
            // 分发反馈信号到对应处理器
            if (this[ev.channel]) {
                this[ev.channel](ev);
            }
        });
        this.webview.addEventListener("did-finish-load", () => this.didFinishLoad());
    }

    //验证码
    private seccode(ev: IpcMessageEvent) {
        // 参数内是验证码图片的 base64 数据
        decodeBase64(ev.args[0], (result) => {
            if (result) {
                // 发送给webview，填入验证码解析的内容
                this.webview.send('antispider', result);//flg = 'links' or 'content'
            } else {// 如果解码器无法解决，尝试刷新 webview，重新获取验证码
                this.webview.reload();
            }
        });
    }

    // 获取文章内容反馈，发送到事件 capture中
    private contentResult(ev: IpcMessageEvent) {
        const content: any = ev.args[0] || {};

        content.key = this.currentKey;

        this.emit('capture', content);
        this.$log.debug(name, ' content : ', content);
        this.getContents();// get next content
    }

    // 获取文章列表链接反馈
    private linksResult(ev: IpcMessageEvent) {
        this.links.push({
            key: this.currentKey,
            links: ev.args[0]
        });

        this.allLinks += ev.args[0].length;

        this.$log.debug(name, ' links : ', ev.args[0]);

        this.getLinks(); // get next links
    }

    // 当某个页面加载完成时触发发送 webview 指令
    private didFinishLoad() {
        setTimeout(() => this.webview.send(this.flg), 500);
    }
}