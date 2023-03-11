//Created by uoto on 16/1/27.
import {Route, Controller} from "../../base/annotations";
import {userInfo} from "os";

@Route({//绑定路由
    route: '/collectionApply', //任务管理
    templateUrl: 'scripts/views/collectionApply/collectionApply.html',
    controllerAs: 'T'
})
@Controller
export class CollectionApplyCtrl {
    public list: Collection[];

    constructor(public CollectionApplyService) {
        this.list = CollectionApplyService.query({
            "queryExaminePassApplication": true,
            "userName": userInfo().username
        });
    }

    startTask(item: Collection) {
        const url = encodeURIComponent(item.url);
        location.href = '#/task?create=true&url=' + url;
    }
}

class Collection {
    url: string;
    acquisitionName: string;
    acquisitionType: string;
    createrTime: string;
    creater: string;
}