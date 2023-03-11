//Created by uoto on 16/7/8.
import {Controller} from "../../../base/annotations";
import {MARK} from "../../properties";

@Controller
export class StepSelectCtrl {
    public step:ISelectStep;

    constructor(public $scope, public flow:IFlow) {
        this.step = flow.currentStep;

        this.getList();
        if (this.step.value) {
            this.setValue();
        }
    }

    async setValue() {
        await this.flow.currentDesigner.executor(this.step);
    }

    public list;

    // 选择元素
    async getList() {
        var data = await this.flow.currentDesigner.executor({
            type: MARK.select_options,
            step: this.step
        });

        this.list = data.list;
    }
}
