// Created by uoto on 16/4/15.

import {Designer} from "../Designer";
import {EventEmitter} from "events";
import {createBehavior} from "./component/createBehavior/createBehavior";
import {BEHAVIOR, EVENTS, MARK, REGEXP, getColumnByBehavior} from "../properties";
import {uuid} from "../../base/util";

/**
 * 用户操作行为探测
 * 然后生成操作面板给用户选择
 * 最后创建流程步骤
 * @name Detection
 * @extends EventEmitter
 * @constructor
 */
export class Detection extends EventEmitter {
    private webview: ElectronWebView;
    private eventEmitter: EventEmitter;
    private executor;
    private $mdDialog;

    constructor(private designer: Designer, private designerMain) {
        super();
        this.webview = designer.webview;
        this.$mdDialog = designer.$mdDialog;
        this.eventEmitter = this.webview.eventEmitter;
        this.executor = this.webview.executor;

        this._bindAll();
    }

    get columnNo() {
        return /*this.designerMain.columnNo++*/;
    }

    private _bindAll() {
        // 当用户点击选择了一个元素,触发对话框让用户来决定这个元素的操作项
        this.eventEmitter.on(
            EVENTS.elementSelect, (tag) => this.openDialog(tag));
    }

    // 打开选择操作项的对话框
    openDialog(tag: TagInfo) {
        // 解析标签行为，转换为可选择的选项供用户选择
        createBehavior({$mdDialog: this.$mdDialog, tag})
            .then((action) => this.transform(tag, action))
            .then((step) => {
                if (step) {
                    this.emit(EVENTS.newStep, step, tag);
                }
            });
    }

    // 转换动作为step
    async transform(tag: TagInfo, action) {
        if (!action) {
            return null;
        }
        var behavior: string = action.behavior;

        // 1. 创建一个step
        var step: any = {
            behavior, // 操作行为
            id: uuid('step'),
            selector: tag.selector,
            name: action.name // 操作名称
        };

        if (behavior === BEHAVIOR.cycle) {
            // 1.1 循环操作
            step.isCycle = true;
            step.type = behavior;
            step.steps = [];
            step.selector = step.selector_sour = await this.webview.executor({
                type: MARK.cyclePath,
                selector: tag.selector
            });
            step.filters = {
                ignoreNodes: ['empty']
            };
        } else if (behavior === BEHAVIOR.paging) {
            // 1.2 分页
            step.isPaging = true;
            step.type = behavior;
            step.selector = await this.webview.executor({type: MARK.paging_path, tag});
            step.limit = 1; // 默认增量,并且抓取1页
            step.steps = [];
        } else if (REGEXP.capture.test(behavior)) {
            // 1.3 抓取操作
            step.isCapture = true;

            // 修改操作行为为 抓取(captures)
            step.behavior = BEHAVIOR.captures;

            // 将采集动作放到group中
            let preview = tag[behavior] || tag.innerText || behavior;
            var paths = await this.webview.executor({
                type: MARK.paths,
                tag
            });

            step.captures = [{
                selector: tag.selector,
                unique: false,
                paths,
                behavior,
                preview
            }];

            
        } else if (behavior === BEHAVIOR.openLinkBlank) {
            // 1.4 打开新标签
            step.paths = await this.webview.executor({type: MARK.paths, tag});
            step.demoUrl = tag.href;
            step.url = '$1';
        }

        // 2 返回结果
        return step;
    }

    /**
     * 手动创建预定的步骤
     * @param designer
     * @param type
     */
    static create(designer: Designer, type) {
        switch (type) {
            case BEHAVIOR.customCycle: // 自定义循环处理步骤
                designer.addStep(Detection.createCustomCycle());
                break;
            case BEHAVIOR.openLink:// 打开连接
                designer.addStep(Detection.createOpenLink());
                break;
            case BEHAVIOR.pageContent:// 采集body内容
                designer.addStep(Detection.createPageCapture(BEHAVIOR.pageContent, '页面内容'));
                break;
            case BEHAVIOR.pageTitle:// 采集标题
                designer.addStep(Detection.createPageCapture(BEHAVIOR.pageTitle, designer.webview.getTitle()));
                break;
            case BEHAVIOR.pageUrl:// 采集url
                designer.addStep(Detection.createPageCapture(BEHAVIOR.pageUrl, designer.webview.getURL()));
                break;
            case BEHAVIOR.base64:// 采集图片base64
                designer.addStep(Detection.createPageCapture(BEHAVIOR.base64, '图片base64'));
                break;
            case BEHAVIOR.download:// 附件下载
                designer.addStep(Detection.createPageCapture(BEHAVIOR.download, '附件下载'));
                break;
            case BEHAVIOR.imgURL:// 采集图片链接
                designer.addStep(Detection.createPageCapture(BEHAVIOR.imgURL, '图片链接'));
                break;
            case BEHAVIOR.autoPaging://下拉分页
                designer.addStep(Detection.createAutoPageCapture());
                break;

        }
    }

    // 获取自定义循环组件
    static createCustomCycle() {
        return {
            type: 'cycle',
            behavior: BEHAVIOR.customCycle,
            name: '自定义循环',
            isCycle: true,
            data: [],
            steps: []
        }
    }

    static createOpenLink() {
        return {
            behavior: BEHAVIOR.openLink,
            name: '打开链接'
        }
    }

    // 创建采集步骤
    static createPageCapture(behavior, preview): ICaptureStep {
        return {
            behavior: BEHAVIOR.captures,
            name: '采集',
            isCapture: true,
            captures: [
                {
                    ...getColumnByBehavior(behavior),
                    unique: false,
                    behavior,
                    preview
                }
            ]
        }
    }
    //下拉分页
    static createAutoPageCapture(): ICaptureStep{
        return {
            //type树节点展示的样式
            type: 'cycle',
            //behavior根据行为确定右边展示的页面
            behavior: BEHAVIOR.autoPaging,
            name: '下拉分页',
            isCycle: true,
            data: [],
            steps: []
        }
    }
}


