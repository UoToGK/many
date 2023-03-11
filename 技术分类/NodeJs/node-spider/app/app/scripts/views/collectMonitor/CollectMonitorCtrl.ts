//Created by uoto on 16/1/27.
import {Route, Controller} from "../../base/annotations";
import {mdDeleteConfirm} from "../../base/util";
var config = require("../../../resource/config.yaml");
import moment = require('moment');

@Route({//绑定路由
    route: '/collectMonitor', // 采集端监控
    templateUrl: 'scripts/views/collectMonitor/collectMonitor.html',
    controllerAs: 'T'
})
@Controller
export class CollectMonitorCtrl {
    public isFirst: boolean = true;
    public currentTime: any = moment().format('YYYY-MM-DD HH:mm:ss');
    public collectList;
    public time;
    public selectedRate = '1';
    public ratelist = [
        {value: "每隔1分", minute: "1"},
        {value: "每隔2分", minute: "2"},
        {value: "每隔5分", minute: "5"},
        {value: "每隔10分", minute: "10"}
    ];

    constructor(public $scope,
                public CollectorService,
                public $routeParams,
                public $http,
                public $interval) {
        // 更新频率
        $scope.option = 1;
        this.collectList = CollectorService.query({findAll: true});
        this.isFirst = true;
        $scope.time = 2 * 1000 * 60;
        $scope.timer = 0;
        let _me = this;

        $scope.initData = function () {
            _me.init();
        }
    }

    init() {
        this.$scope.timer = this.$interval(() => {// 初始定时器，按照客户所选频率刷新监控信息
            this.collectList = this.CollectorService.query({findAll: true});
        }, this.$scope.time);

        if (this.$scope.timer) {// 取消定时器
            let _me = this;
            this.$scope.$on('$destroy', function () {
                _me.$interval.cancel(_me.$scope.timer);
            });
        }
    }

    // 设置定时器
    outTime() {
        let _me = this;
        this.$scope.timer = this.$interval(() => {
            this.collectList = this.CollectorService.query({findAll: true});
            this.changeTime();
        }, _me.time);
    }

    // 切换更新时间
    changeTime() {
        if (this.isFirst)
            this.currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
        else
            this.currentTime = moment(this.currentTime).add(this.time, 'milliseconds').format('YYYY-MM-DD HH:mm:ss');
    }

    //下拉切换
    show() {
        this.isFirst = false;
        this.time = Number(this.currentTime) * 1000 * 60;
        if (this.$scope.timer) {
            this.$interval.cancel(this.$scope.timer);
            this.outTime();
        }
    }
}
