// Created by uoto on 16/4/15.
import {Detection} from "./tools/Detection";
import {messageWrapper} from "./tools/events";
import {EventEmitter} from "events";
import {EVENTS} from "./properties";
import {getStepParent} from "../base/util";
import {Work} from "./Works";
import {element} from "angular";

/**
 * 流程设计器
 */
export class Designer {
    private behaviorDetection:Detection = null;
    private eventEmitter:EventEmitter;

    constructor(public webview:ElectronWebView,
                public steps:IStepOption[],
                public $mdDialog,
                private designerMain) {
        this.eventEmitter = messageWrapper(webview);
        this.behaviorDetection = new Detection(this, designerMain);
        this.bindAll();
    }

    // 派发步骤执行信息，交给webview执行一个步骤
    executor(step, locals?) {
        return this.webview.executor(step, locals).then((data) => {
            setTimeout(()=> element(this.webview).scope().$root.$digest());
            return data;
        });
    }

    set src(url:string) {
        this.webview.src = url; // 设置webview访问的url
        this.eventEmitter.emit(EVENTS.srcChange, url);
    }

    get src() {
        return this.webview.src;
    }

    // 修改、获取 webview 的charset
    set charset(charset) {
        this.webview.charset = charset;
    }

    get charset() {
        return this.webview.charset;
    }

    private bindAll() {
        // 用户选定了一个新的步骤时触发此方法
        // 在这里把它加入到步骤流里面
        this.behaviorDetection.on(EVENTS.newStep, (step:IStepOption, tag:TagInfo) => {
            this.addStep(step, tag);
        });
    }

    // 添加步骤
    addStep(step:IStepOption, tag?) {
        var stepParent,
            activeStep:IStepOption = this.designerMain.activeStep;
        this.steps[0].isDynamic=messageWrapper.prototype.isDynamic;

        if (activeStep) {
            // 如果是采集的步骤
            // 并且刚好当前激活的也是采集的步骤
            // 那么就把它俩的采集步骤合并
            if (activeStep.isCapture && step.isCapture) {
                (<ICaptureStep>activeStep).captures
                    .push((<ICaptureStep>step).captures[0]);
                return;
            }

            // 如果是循环节点,我们直接把下一个step放到循环孩子的队列里
            if (activeStep.isCycle || activeStep.isPaging) {
                stepParent = activeStep.steps;
            } else {
                // 否则找到它的父亲
                stepParent = getStepParent(this.steps, activeStep);
            }
        } else {
            // 或者直接放到整个步骤流的根
            stepParent = this.steps;
        }

        // 如果找到这个节点了
        // 我们就把新创建的步骤放到这个队列的最后
        // 并且设置自动激活功能,让它可以自动激活配置面板
        if (stepParent) {
            stepParent.push(step);
            step.autoActive = true;
        }
    }

    /**
     * 获取采集列数量
     * @param steps
     * @returns {number}
     */
    static getColsNum(steps):number {
        var cols = Work.queryColumns(steps), res = 0;

        if (!cols.length) {
            return 0;
        } else {
            res = cols.map(col => {
                return +col.columnName.replace('column', '');
            }).sort().reverse()[0];
        }

        return res;
    }
}