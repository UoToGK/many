// Created by uoto on 16/4/7.
import {Dialog} from "../../../../base/util";

interface Opt {
    $mdDialog: any,
    task: ITaskItem
}

export function getTaskName(opt: Opt): Promise<any> {

    return opt.$mdDialog.show({
        controller: GetTaskNameCtrl,
        controllerAs: 'T',
        templateUrl: `${__dirname}/dialog.html`,
        locals: {
            task: opt.task
        }
    });
}

class GetTaskNameCtrl extends Dialog {
    public name: string;
    public emergencyLevel: string;
    public isSupportProxy: string;
    public customTaskType:string;

    constructor(public $scope,
                public $mdDialog,
                public task: ITaskItem) {
        super($mdDialog);
        this.isCancel="N";
        this.name = task.name || '';
        this.customTaskType=task.taskType ||'electron.dynamic'
        this.emergencyLevel = task.priority || "5";
        this.isSupportProxy=task.isSupportProxy;
        if(!task.isSupportProxy){
            this.isSupportProxy="N";
        }
    }
}