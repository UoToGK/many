// Created by uoto on 16/4/7.
import {Dialog} from "../../../../base/util";

interface Opt<T> {
    $mdDialog: any
    closeTo: any
    isCreate: boolean,
    task: T
}

export function weiboTaskItem<T>(opt: Opt<ITaskItem>): Promise<T> {
    return opt.$mdDialog.show({
        controller: WeiboTaskItemDialogCtrl,
        controllerAs: 'T',
        templateUrl: `${__dirname}/weiboTaskItem.html`,
        closeTo: opt.closeTo,
        locals: {
            isCreate: opt.isCreate,
            task: opt.task
        }
    });
}

class WeiboTaskItemDialogCtrl extends Dialog {

    constructor(public $scope,
                public $mdDialog,
                public task: ITaskItem,
                public TaskManage,
                private $timeout) {
        super($mdDialog);

        if (task.id) {
            this.queryRule();
        } else {
            task.steps = [];
        }
    }

    queryRule() {
        this.TaskManage.get('findRuleByTaskId', {taskId: this.task.id}, (res) => {
            try {
                this.task.steps = JSON.parse(res.steps);
            } catch (e) {
                this.task.steps = [];
            }
        });
    }

    paste(e) {
        this.$timeout(() => {
            if (e.target.value && e.target.value.trim()) {
                let words = e.target.value.trim().split(';');
                words.forEach(word => {
                    if (word && !this.task.steps.includes(word)) {
                        this.task.steps.push(word)
                    }
                });
                e.target.value = '';
            }
        }, 1);
    }

    add(chip) {
        if (!chip) {
            this.task.steps.pop();
        }
    }
}