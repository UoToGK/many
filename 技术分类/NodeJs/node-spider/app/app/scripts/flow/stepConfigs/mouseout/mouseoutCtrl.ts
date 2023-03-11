// Created by uoto on 16/5/6.

import { Controller } from "../../../base/annotations";

@Controller
export class StepMouseOutCtrl {
    public step;

    constructor(public flow: IFlow) {
        this.step = flow.currentStep;

        // 执行鼠标离开
        this.run();
    }

    async run() {
        await this.flow.currentDesigner.executor(this.step);
    }
}