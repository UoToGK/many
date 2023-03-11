// Created by uoto on 16/4/7.
import {Dialog} from "../../../../base/util";

interface Opt<T> {
    $mdDialog: any
    closeTo: any
    isCreate: boolean,
    task: T
}

export function editGroupItem<T>(opt: Opt<ITaskItem>): Promise<T> {
    return opt.$mdDialog.show({
        controller: GroupItemDialogCtrl,
        controllerAs: 'T',
        templateUrl: `${__dirname}/groupItem.html`,
        closeTo: opt.closeTo,
        locals: {
            isCreate: opt.isCreate,
            task: opt.task
        }
    });
}

class GroupItemDialogCtrl extends Dialog {
    constructor(public $scope,
                public $mdDialog,
                public task: ITaskItem,
                public isCreate: boolean) {
        super($mdDialog);
        //delete task.rule;
    }
}