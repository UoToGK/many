//Created by uoto on 16/6/20.

import {seeDataDialog} from "../../../viewBatchData/component/seeData/seeData";
export function seeTaskBatchList($mdBottomSheet, task:ITaskItem):Promise<any> {
    return $mdBottomSheet.show({
        controller: SeeTaskDialogCtrl,
        controllerAs: 'T',
        templateUrl: `${__dirname}/seeTask.html`,
        locals: {task}
    });
}

class SeeTaskDialogCtrl {
    constructor(public $scope,
                public $mdDialog,
                public TaskManage,
                public task:ITaskItem) {
        this.queryBatchList();
    }

    public batchList;

    queryBatchList() {
        this.TaskManage.get('batchPager', {
            values: angular.toJson({taskId: this.task.id})
        }, (res) => {
            this.batchList = res.data;
        });
    }

    seeData(batch) {
        //seeDataDialog(this.$mdDialog, batch, this.task);
}
}