//Created by uoto on 16/6/20.
import {Route, Controller} from "../../../../base/annotations";
import "../../../../base/directives/echarts-severs.ts"
import "../../../../base/directives/echarts-communication.ts"

@Route({//绑定路由
    route: '/serverMonitor/changeChart', // 历史变化图
    templateUrl: 'scripts/views/serverMonitor/subPages/changeChart/changeChart.html',
    controllerAs: 'T'
})
@Controller
export class ChangeChartCtrl {// 所有带有 Ctrl

    public serverIp:string = "";

    constructor(public $scope,
                public $mdDialog,
                public $routeParams){
        this.serverIp = $routeParams.serverIp;
    }
    Rate:Number = 0;
    Info:Number = 0;

    rates = [
        {"key":1,"value":"过去30分钟"},
        {"key":2,"value":"过去1小时"},
        {"key":3,"value":"过去24小时"}
    ];
    infos = [
        {"key":1,"value":"过去30分钟"},
        {"key":2,"value":"过去1小时"},
        {"key":3,"value":"过去24小时"}
    ];

    back() {
        window.location.href = '#/serverMonitor/changeChart';
    }
    show()
    {
        switch (this.Rate){
            case 1:
                this.Rate=30;break;
            case 2:
                this.Rate=60;break;
            case 3:
                this.Rate=1440;break;
        }
        this.$scope.initECharts();
    }

    back() {
        window.history.go(-1);
        //window.location.href = '#/taskMonitor';
    }
}