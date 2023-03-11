//Created by uoto on 16/1/27.

import {Route, Controller} from "../../base/annotations";
import moment = require('moment');

@Route({
    route: '/face', //任务运行监控
    templateUrl: `${__dirname}/face.html`,
    controllerAs: 'T'
})
@Controller
export class FaceCtrl {
    public taskList;
    public runList;

    constructor($scope, public TaskExecutor) {
        // 这里将任务运行控制器中的关键列表获取到，用于展示
        this.taskList = TaskExecutor.taskList;
        this.runList = TaskExecutor.runList;
    }

    getTime(task:ITaskItem) {
        // 获取任务运行持续时间
        return formatTime(Date.now() - this.TaskExecutor.TIMES[task.taskId]);
    }

    getTotal(task:ITaskItem) {
        // 获取任务采集的数据数量
        return this.TaskExecutor.TOTALS[task.taskId];
    }
}

function formatTime(time) {
    var s = Math.ceil(time / 1000) || 0;
    if (s < 60) {
        return `${s} 秒`;
    }
    return `${Math.floor(s / 60)} 分钟 ${s % 60} 秒`;
}