// Created by uoto on 16/4/7.
import {Dialog} from "../../../../base/util";

interface Opt {
    $mdDialog:any
    closeTo:any
}

export function importConfig(opt:Opt):Promise<any> {
    return opt.$mdDialog.show({
        controller: ImportConfigDialogCtrl,
        controllerAs: 'T',
        templateUrl: `${__dirname}/importConfig.html`,
        closeTo: opt.closeTo
    });
}

class ImportConfigDialogCtrl extends Dialog {
    public data:any;

    constructor(public $scope,
                public $mdDialog) {
        super($mdDialog);
        this.data = {};
    }

    selectFile() {
        $('#file').click();
    }
}