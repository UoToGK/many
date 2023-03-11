//Created by uoto on 16/7/23.

import {Route, Controller} from "../../base/annotations";
import {seeDataDialog} from "./component/seeData/seeData";

@Route({
    route: '/viewBatchData', //定时器
    templateUrl: `${__dirname}/viewBatchData.html`,
    controllerAs: 'T'
})
@Controller
export class ViewBatchDataCtrl {
    public batchOption: PagingOption = {
       // invokeParam: 'batchPager',
       // reload: true
    };

    constructor(public TaskManage,
                public DataManage,
                public $mdDialog,
                public $routeParams) {
        this.batchOption.params = {taskId: $routeParams.id};
        this.batchOption.resource = TaskManage;
    }

    seeData(batch) {
        // 展示任务采集的数据
        seeDataDialog(this.$mdDialog, batch.batchId, this.$routeParams.id, batch.extractCount);
    }

    back() {
        window.location.href = decodeURIComponent(this.$routeParams.source);
    }
}