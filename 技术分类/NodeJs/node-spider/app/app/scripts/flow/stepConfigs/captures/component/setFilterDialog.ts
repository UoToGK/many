//Created by uoto on 16/7/15.

import {Dialog} from "../../../../base/util";

interface Opt {
    $mdDialog:any
    capture:ICapture
}

export function setFilterDialog(opt:Opt):Promise<any> {
    return opt.$mdDialog.show({
        controller: SetCaptureFilterDialog,
        controllerAs: 'T',
        templateUrl: `${__dirname}/setFilterDialog.html`,
        locals: {
            capture: opt.capture
        }
    });
}

class SetCaptureFilterDialog extends Dialog {
    constructor(public $scope,
                public $mdDialog,
                public capture:ICapture) {
        super($mdDialog);
        if (!capture.match) {
            capture.match = {dateEq: '='};
        }
        if (capture.match.dateLike == 'date' && capture.match.date) {
            capture.match.date = new Date(capture.match.date);
        } else {
            capture.match.date = null;
        }
    }
}