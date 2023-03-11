// Created by uoto on 16/5/17.
import {Controller} from "../../../base/annotations";
import {MARK} from "../../properties";

@Controller
export class StepPagingCtrl {
    public step:IPagingStep;
    public readonly=true ;

    constructor(public $scope, public flow:IFlow) {
        this.step = flow.currentStep;

        this.mark();
        this.initData();
    }

    // 选择元素
    async mark() {
        await this.flow.currentDesigner.executor({
            type: MARK.paging,
            step: this.step
        });
    }

    public toEdit(){
        this.readonly=!this.readonly;
    }

    deplyList =[];

    initData(){
        var start =0;
        for(var i=0;i<20;i++){
            if(i<10){
                start= i;
            }else{
                start= start+5;
            }
            this.deplyList.push(start);
        }
    }
}