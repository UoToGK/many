//Created by uoto on 16/6/20.

import {Dialog} from "../../../../base/util";

export function GoToEdit($mdDialog): Promise<any> {
    return $mdDialog.show({
        controller: GoToEditCtrl,
        controllerAs: 'T',
        templateUrl: `${__dirname}/gotoEdit.html`
    });
}

class GoToEditCtrl extends Dialog {
    public taskId;
    constructor(public $scope,
                public $mdDialog) {
        super($mdDialog);
    }
}