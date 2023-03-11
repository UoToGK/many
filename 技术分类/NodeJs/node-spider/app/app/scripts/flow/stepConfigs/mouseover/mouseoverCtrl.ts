// Created by uoto on 16/5/6.

import { Controller } from "../../../base/annotations";

@Controller
export class StepMouseOverCtrl {
    public step;

    constructor(public flow: IFlow) {
        this.step = flow.currentStep;

        // 执行鼠标进入
        this.run();
    }

    async run() {
        console.debug(this.step)
        await this.flow.currentDesigner.executor(this.step);
    }
}