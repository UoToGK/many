//Created by uoto on 16/6/22.

import { Controller } from "../../../base/annotations";
import { MARK } from "../../properties";

@Controller
export class StepOpenLinkBlankCtrl {
    public step: ILinkBlankStep;

    public currentTask;

    constructor(public flow: IFlow) {
        this.step = flow.currentStep;
        this.currentTask = flow.currentTask;
        this.mark();
        this.gotoDesigner();
        this.initData()
    }

    mark() {
        this.flow.currentDesigner.executor({
            type: MARK.defaults,
            step: this.step
        });
    }

    async gotoDesigner() {
        var data = await this.flow.currentDesigner.executor(this.step);
        this.initDefault(data);
        this.flow.designerMain.addDesigner({
            steps: this.step.steps,
            label: '子页面',
            currentTask: this.currentTask
        });
    }

    // 选择元素
    async select() {
        var data = await this.flow.currentDesigner.executor({
            type: MARK.cycleSelect,
            step: this.step
        });
    }

    initDefault(data) {
        console.debug(`打开新链接延时${this.step.deplyTime}`)
        if (!this.step.steps) {
            this.step.steps = [
                {
                    behavior: 'openLink',
                    name: '打开链接',
                    url: this.step.url,
                    deplyTime: this.step.deplyTime
                }
            ]
        }

        (<ILinkStep>this.step.steps[0]).demoUrl = data;
        this.step.steps[0].autoActive = true;
    }
    deplyList = [];
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