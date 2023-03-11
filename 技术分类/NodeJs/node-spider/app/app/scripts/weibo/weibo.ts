import {EventEmitter} from "events";
import WebViewElement = Electron.WebViewElement;
import {resolve} from "path";
import IpcMessageEvent = Electron.WebViewElement.IpcMessageEvent;
/**
 * Created by uoto on 16/2/18.
 * 百度微博采集程序
 * 通过百度微博搜索关键词，然后采集列表内容
 * 搜索地址如下：将 ${key} 替换为关键词即可进行搜索
 * `http://www.baidu.com/s?rtt=2&tn=baiduwb&rn=50&wd=${key}&ct=0&clk=sortbytime`
 *
 * 此程序 通过 run 方法启动，由 getLinks方法获取所有微博列表，然后将列表处理成结果
 * 通过contentResult 方法反馈保存
 */
export class Weibo extends EventEmitter {
    static preloadFile = './webview/weibo.js';
    idx: number;
    idx2: number;
    links: any[];
    allLinks: number;
    flg: string = 'content';
    running: boolean;
    webview: WebViewElement;
    timeout = 20 * 100;
    currentKey: string;
    timer;

    constructor(private $log: angular.ILogService,
                private keys: string[]) {
        super();
        this.idx = this.idx2 = this.allLinks = 0;
        this.links = [];
        this.running = false;
    }

    private promise;

    // 开始采集
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

    // 搜索关键词获取微博内容
    getLinks() {
        clearTimeout(this.timer);
        if (!this.running) return;

        const key = this.currentKey = this.keys[this.idx];
        if (key) {
            this.webview.src = `http://www.baidu.com/s?rtt=2&tn=baiduwb&rn=50&wd=${key}&ct=0&clk=sortbytime`;
            this.idx++;
            this.timer = setTimeout(() => this.getLinks(), this.timeout);
            return;
        }

        this.$log.debug(name, ' links all done', this.links);
        this.emit('done');
    }

    // 创建采集处理程序
    private createWebView() {
        this.webview = document.createElement('webview');
        this.webview.preload = resolve(__dirname, Weibo.preloadFile);
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

    // 微博内容采集反馈程序，保存
    private contentResult(ev: IpcMessageEvent) {

        const list = ev.args[0];
        if (list && list.length) {
            list.forEach(item => item['key'] = this.currentKey);
            this.emit('capture', list)
        }

        this.getLinks();
    }

    private didFinishLoad() {
        setTimeout(() => this.webview.send(this.flg), 500);
    }
}