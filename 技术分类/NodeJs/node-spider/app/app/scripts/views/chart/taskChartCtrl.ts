//Created by uoto on 16/1/27.
import {Route, Controller} from "../../base/annotations";

@Route({//绑定路由
    route: '/taskChart', // 任务监控
    templateUrl: 'scripts/views/chart/taskChart.html',
    controllerAs: 'T'
})
@Controller


export class TaskChartCtrl {
    //查询状态
    constructor(public $scope) {
        // $scope.isDisabled = false;
        // $scope.dianji1 = function () {
        //     $scope.option = $scope.option1;
        //     $scope.isDisabled = 'true';
        // }
        // $scope.guanbi = function () {
        //     $scope.isDisabled = 'false';
        // }
        // $scope.dianji2 = function () {
        //     $scope.option = $scope.option2;
        //     $scope.isDisabled = 'true';
        // }
        // $scope.dianji2 = function () {
        //     $scope.popover = $scope.options;
        // }



        // 指定图表的配置项和数据
        $scope.option1 = {
            title: {
                text: '折线图堆叠'
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data:['邮件营销','联盟广告','视频广告','直接访问','搜索引擎']
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            toolbox: {
                feature: {
                    saveAsImage: {}
                }
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
                    name:'邮件营销',
                    type:'line',
                    stack: '总量',
                    data:[120, 132, 101, 134, 90, 230, 210]
                },
                {
                    name:'联盟广告',
                    type:'line',
                    stack: '总量',
                    data:[220, 182, 191, 234, 290, 330, 310]
                },
                {
                    name:'视频广告',
                    type:'line',
                    stack: '总量',
                    data:[150, 232, 201, 154, 190, 330, 410]
                },
                {
                    name:'直接访问',
                    type:'line',
                    stack: '总量',
                    data:[320, 332, 301, 334, 390, 330, 320]
                },
                {
                    name:'搜索引擎',
                    type:'line',
                    stack: '总量',
                    data:[820, 932, 901, 934, 1290, 1330, 1320]
                }
            ]
        };
        // 指定图表的配置项和数据
        $scope.option2 = {
            title: {
                text: '单线图'
            },
            xAxis: {
                type: 'category',
                data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            },
            yAxis: {
                type: 'value'
            },
            series: [{
                data: [820, 932, 901, 934, 1290, 1330, 1320],
                type: 'line'
            }]
        };
    }
}


