// Created by uoto on 16/5/27.
import {Controller} from "../../../base/annotations";

@Controller
export class StepFillCtrl {
    public step;

    constructor(public flow:IFlow) {
        this.step = flow.currentStep;
        if (this.step.value) {
            flow.currentDesigner.executor(this.step, flow.locals);
        }
    }

    change() {
        this.flow.currentDesigner.executor(this.step, this.flow.locals);
    }
}