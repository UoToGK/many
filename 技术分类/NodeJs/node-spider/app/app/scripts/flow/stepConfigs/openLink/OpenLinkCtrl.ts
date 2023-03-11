//Created by uoto on 16/3/2.
/// <reference path="../../typings/Flow.d.ts" />
import { Controller } from "../../../base/annotations";

@Controller
export class StepOpenLinkCtrl {
    public step: ILinkStep;

    constructor(public flow: IFlow) {
        this.step = flow.currentStep;
        // console.log(flow)
        if (this.step.url) {
            this.setUrl();
        }

        this.initData();
    }

    deplyList = [];
    setUrl() {
        this.flow.currentDesigner.charset = this.step.charset || null;
        let url = this.step.url;
        if (url && /\$\d+/.test(url)) { //step.url 不为空并包含$加数字开头
            let purl = this.flow.locals[url] || this.step.demoUrl;
            //提取$占位符,用于将点位符替换为真实的网址
            let placeholder = url.match(/\$\d+/)[0];//如：$1
            purl = url.replace(placeholder, purl);
            this.flow.currentDesigner.src = purl;
        } else {
            this.flow.currentDesigner.src = url;
        }
    }

    charsetList = [
        { charset: "", value: "请选择" },
        { charset: "UTF-8", value: "UTF-8" },
        { charset: "GBK", value: "GBK" }
    ];


    initData() {
        var start = 0;
        for (var i = 0; i < 20; i++) {
            if (i < 10) {
                start = i;
            } else {
                start = start + 5;
            }
            this.deplyList.push(start);
        }

    }

}