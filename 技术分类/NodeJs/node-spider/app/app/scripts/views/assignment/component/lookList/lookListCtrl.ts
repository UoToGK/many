//Created by uoto on 16/1/27.
import {Route, Controller} from "../../../../base/annotations";
var config = require("../../../../../resource/config.yaml");

@Route({//绑定路由
    route: '/assignment/lookList', // 任务监控
    templateUrl: 'scripts/views/assignment/component/lookList/lookList.html',
    controllerAs: 'T'
})

@Controller
export class LookListCtrl {
    constructor(public $scope,
                public $mdDialog,
                public $routeParams,
                public $http) {

    }
}

