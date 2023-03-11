import {Dialog} from "../../../../base/util";
interface Opt<T> {
    $mdDialog: any
    closeTo: any,
    tsId?:string
}
export function redirectTaskDialog<T>(opt: Opt<string>): Promise<T> {
    return opt.$mdDialog.show({
        controller: RedirectTaskCtrl,
        controllerAs: 'T',
        templateUrl: `${__dirname}/redirectTask.html`,
        closeTo: opt.closeTo,
        locals: {
            tsId: opt.tsId
        }
    });
}
class RedirectTaskCtrl extends Dialog{
    constructor(public $scope,
                public $mdDialog,
                public tsId: string) {
        super($mdDialog);
    }
}