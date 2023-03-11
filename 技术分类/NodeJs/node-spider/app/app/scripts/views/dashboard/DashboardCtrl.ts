//Created by uoto on 16/1/27.

import {Route, Controller} from "../../base/annotations";
var config = require("../../../resource/config.yaml");


@Route({//绑定路由
    route: '/dashboard',
    templateUrl: `${__dirname}/dashboard.html`,
    controllerAs: 'T'
})
@Controller
export class DashboardCtrl {
    public logs: any[];
    public chartConfig: any;
    constructor(public $scope,public $http) {
       
        $scope.setTitle(name);

        this.setChartConfig();
        this.logs = this.makeTestLogs();
        this.initChartMonth();
        this.initChartDay();
       
    }

    public initChartMonth(){
        // this.$scope.isLoading=true;
        this.$scope.option = {
            title: {
                text: '采集量(月)'
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data:['采集量']
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: ['周一','周二','周三','周四','周五','周六','周日']
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    name:'采集量',
                    type:'line',
                    stack: '总量',
                    data:[]
                }
            ]
        };
        this.$http({
            headers:{'Content-Type': 'application/x-www-form-urlencoded'},
            method: 'get',
            url: config.api_address+'/batchTask?staticsByMonth=true',
        }).success((response)=> {
            if(Number(response.code)===10000 && response.data) {
                this.$scope.option.xAxis.data = response.data.data.titles;
                this.$scope.option.series[0].data=response.data.data.datas;
            }

        });


    }


    public initChartDay(){
       
        this.$scope._option = {
            title: {
                text: '采集量(天)'
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data:['采集量']
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: ['周一','周二','周三','周四','周五','周六','周日']
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    name:'采集量',
                    type:'line',
                    stack: '总量',
                    data:[]
                }
            ]
        };

        this.$http({
            headers:{'Content-Type': 'application/x-www-form-urlencoded'},
            method: 'get',
            url: config.api_address+'/batchTask?staticsDayHome=true',
        }).success((response)=> {
            if(Number(response.code)===10000 && response.data) {
                this.$scope._option.xAxis.data = response.data.data.titles;
                this.$scope._option.series[0].data=response.data.data.datas;
            //    this.$scope.isLoading=false;
            }

        });


    }


    setChartConfig() {
        this.chartConfig = {
            options: {
                chart: {
                    type: 'line',
                    zoomType: 'x'
                },
                tooltip: {
                    xDateFormat: '%Y-%m-%d %H:%M:%S',
                    valueDecimals: 2
                },
                xAxis: {
                    type: 'datetime',
                    dateTimeLabelFormats: {
                        hour: '%H:%M'
                    },
                    minRange: 1000, // 不能放大超过1s
                    minTickInterval: 1000 // 放大间隔最小为1s
                }
            },
            series: {
                data: [100.0, 99.0, 100.0, 98.039216, 100.0, 99.0, 100.0, 100.0, 100.0, 100.0, 97.087379, 99.0, 99.009901, 100.0, 99.0, 100.0, 99.009901, 100.0, 100.0, 98.039216, 100.0, 100.0, 100.0, 99.009901, 99.009901, 100.0, 99.009901, 100.0, 99.0, 100.0, 100.0, 99.0, 100.0, 99.009901, 100.0, 99.0, 99.0, 99.009901, 99.009901, 100.0, 100.0, 99.009901, 100.0, 99.009901, 100.0, 99.0, 98.039216, 100.0, 99.0, 100.0, 99.0, 100.0, 100.0, 100.0, 100.0, 100.0, 99.0, 100.0, 100.0],
                name: '192.168.17.136'
            },
            title: {
                text: "1212"
            }
        }    ;
    }

    makeTestLogs() {
        return [
            {name: '1、从项目管理中，新建项目，设置项目成员'},
            {name: '2、设置采集任务，目前支持采集任务（常规采集任务、微信公众号任务及相关插件任务）'},
            {name: '3、从计划管理中，创建采集计划、将采集任务加入采集计划'},
            {name: '4、左侧菜单最下面的图标，即任务运行监控'}
        ];
    }

    showLogDetails(log, e) {
    }
}