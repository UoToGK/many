//Created by uoto on 16/3/2.

import {Controller} from "../../../base/annotations";
import {MARK} from "../../properties";

@Controller
export class StepCycleCtrl {
    public step:ICycleStep;
    public size = 0;

    constructor(public flow:IFlow) {
        this.step = flow.currentStep;

        this.select();
    }

    expert() {
        if (this.step.expert) {
            if (!this.step.custom_selector) {
                this.step.custom_selector = this.step.selector;
            }
        }
    }

    // 选择元素
    async select() {
        var data = await this.flow.currentDesigner.executor({
            type: MARK.cycleSelect,
            step: this.step
        });
        this.setVars(data);
    }

    // 扩大选择范围
    async expand() {
        var data = await this.flow.currentDesigner.executor({//当前的流程设计执行
            type: MARK.cycleExpand,//标记循环扩大
            step: this.step//当前的步骤
        });
        this.setVars(data);//设置变量
    }

    // 缩小选择范围
    async reset() {
        var data = await this.flow.currentDesigner.executor({
            type: MARK.cycleReset,
            step: this.step
        });
        this.setVars(data);
    }

    setVars(data) {
        this.size = data.size;
        this.step.selector = data.selector;
        if(this.step.custom_selector){
            this.step.custom_selector= data.selector;
        }
    }
}