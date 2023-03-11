//Created by uoto on 16/6/20.

import {Dialog} from "../../../../base/util";
import {Work} from "../../../../flow/Works";

export function seeDataDialog($mdDialog, batchId, taskId, pageSize): Promise<any> {
    return $mdDialog.show({
        controller: SeeDataDialogCtrl,
        controllerAs: 'T',
        templateUrl: `${__dirname}/seeData.html`,
        locals: {batchId, taskId, pageSize}
    });
}

class SeeDataDialogCtrl extends Dialog {
    constructor(public $scope,
                public $mdDialog,
                public DataManage,
                public TaskManage,
                public batchId,
                public taskId,
                public pageSize) {
        super($mdDialog);
        this.pageSize = 100;
        this.queryData();
    }

    public batchData;

    queryData() {
        this.batchData = this.DataManage.get('paging', {
            limit: 100,
            values: angular.toJson({batchId: this.batchId}),
            taskId: this.taskId
        });

        this.TaskManage.get('findRuleByTaskId', {taskId: this.taskId}, (res) => {
            try {
                this.setCols(JSON.parse(res.steps))
            } catch (e) {
            }
        });
    }

    public cols;

    setCols(steps: IStepOption[]) {
        this.cols = Work.queryColumns(steps);
        this.cols.forEach(function (item) {
            item.columnDesc = Work.getColumnDesc(item);
            item.columnName = item.columnName.toUpperCase() || '';
        })
    }

    exports() {

    }
}
