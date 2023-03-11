// Created by uoto on 16/4/7.
import {Dialog} from "../../../../base/util";

interface Opt<T> {
    $mdDialog:any
    closeTo:any
    isCreate:boolean,
    task:T
}

export function expressTaskItem<T>(opt:Opt<ITaskItem>):Promise<T> {
    return opt.$mdDialog.show({
        controller: ExpressTaskItemDialogCtrl,
        controllerAs: 'T',
        templateUrl: `${__dirname}/expressTaskItem.html`,
        closeTo: opt.closeTo,
        locals: {
            isCreate: opt.isCreate,
            task: opt.task
        }
    });
}

class ExpressTaskItemDialogCtrl extends Dialog {
    constructor(public $scope,
                public $mdDialog,
                public task,
                public isCreate) {
        super($mdDialog);
    }
}