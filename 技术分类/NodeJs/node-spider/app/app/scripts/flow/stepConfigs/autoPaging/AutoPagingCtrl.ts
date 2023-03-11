// Created by uoto on 16/5/17.
///<reference path="../../typings/Flow.d.ts"/>
import { Controller } from "../../../base/annotations";
import { MARK } from "../../properties";

@Controller
export class StepAutoPagingCtrl {
    public step: IPagingStep;

    constructor(public flow: IFlow) {
        this.step = flow.currentStep;

        this.mark();
    }

    // 选择元素
    async mark() {
        if (this.step.limit) {
            for (let index = 0; index < this.step.limit; index++) {
                await this.flow.currentDesigner.executor({
                    type: MARK.autoPaging,
                    step: this.step
                });

            }
        } else {
            await this.flow.currentDesigner.executor({
                type: MARK.autoPaging,
                step: this.step
            });
        }

    }


}