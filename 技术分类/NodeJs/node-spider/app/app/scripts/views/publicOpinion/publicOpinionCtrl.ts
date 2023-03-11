//Created by uoto on 16/1/27.
import {Route, Controller} from "../../base/annotations";
import {mdDeleteConfirm} from "../../base/util";
var config = require("../../../resource/config.yaml");
import moment = require('moment');

@Route({//绑定路由
    route: '/publicOpinion', // 舆情管理
    templateUrl: 'scripts/views/publicOpinion/publicOpinion.html',
    controllerAs: 'T'
})
@Controller
export class PublicOpinionCtrl {
    constructor(public $scope,
                public $rootScope,
                public $mdDialog,
                public $routeParams,
                public TaskExecutor,
                public $http,
                public $interval,
                public $filter
    ) {

    }
    public urlList = [
        {url:"http:www.iconfont.cn/search/index?q=链接"},
        {url:"http:www.iconfont.cn/search/index?q=链接"},
        {url:"http:www.iconfont.cn/search/index?q=链接"},
        {url:"http:www.iconfont.cn/search/index?q=链接"},
        {url:"http:www.iconfont.cn/search/index?q=链接"}
    ]
}
