// Created by uoto on 16/5/6.

import {Controller} from "../../../base/annotations";

@Controller
export class StepClickCtrl {
    public step;

    constructor(public flow:IFlow) {
        this.step = flow.currentStep;

        // 执行点击
        this.run();
    }

    async run() {
        await this.flow.currentDesigner.executor(this.step);
    }
}