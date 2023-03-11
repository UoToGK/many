// Created by uoto on 16/4/7.
import {Dialog} from "../../../../base/util";

interface Opt<T> {
    $mdDialog: any
    closeTo: any
    isCreate: boolean,
    task: T
}

export function weixinTaskItem<T>(opt: Opt<ITaskItem>): Promise<T> {
    return opt.$mdDialog.show({
        controller: WeixinTaskItemDialogCtrl,
        controllerAs: 'T',
        templateUrl: `${__dirname}/weixinTaskItem.html`,
        closeTo: opt.closeTo,
        locals: {
            isCreate: opt.isCreate,
            task: opt.task
        }
    });
}

class WeixinTaskItemDialogCtrl extends Dialog {
    constructor(public $scope,
                public $mdDialog,
                public task: ITaskItem,
                public TaskManage,
                private $timeout) {
        super($mdDialog);
        if (task.id) {
            this.queryRule(task);
        } else {
            task.steps = [{
                steps: this.steps = [],
                filters: this.filters = []
            }];
        }
    }

    config: { steps, filters };
    steps: string[];
    filters: string[];

    paste(e, list) {
	    this.$timeout(() => {
            if (e.target.value && e.target.value.trim()) {
                let words = e.target.value.trim().split(';');
                words.forEach(word => {
                    if (word && !list.includes(word)) {
                        list.push(word)
                    }
                });
                e.target.value = '';
            }
        }, 1);
    }

    queryRule(task) {
            //获取规则
            this.TaskManage.get({opt:"get",taskId: task.id}, (res) => {
                if (res.code == 10000) {
                    var rule = JSON.parse(res.data.data.rule)[0];
                    // task.steps.steps = rule.steps.steps;
                    // task.steps.filters = rule.steps.filters;

                    this.task.steps = [rule];
                    this.steps = rule.steps;
                    this.filters = rule.filters;
                }else{
                    this.config = {steps: [], filters: []};
                    this.task.steps = [this.config];
                    this.steps =this.config.steps;
                    this.filters =this.config.steps;
                }
            });

    }

    add(chip, list) {
        if (!chip) {
            list.pop();
        }
    }
}