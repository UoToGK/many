//Created by uoto on 16/1/27.
import {Route, Controller} from "../../base/annotations";
import "../../base/directives/pageDirective";
var config = require("../../../resource/config.yaml");
import {PagingOption} from "../../base/directives/paging/PagingOption";
import moment = require('moment');

@Route({//绑定路由
    route: '/planBatch', // 任务监控
    templateUrl: 'scripts/views/planBatch/planBatch.html',
    controllerAs: 'T'
})
@Controller
export class PlanBatchCtrl {
    planId="";
    paging: PagingOption<> = {};
    constructor(public $scope,public planMonitorServer,public $http,public $routeParams) {
        this.paging.params = {
            orderBy: "START_TIME",
            order: "desc",
            userId:sessionStorage.getItem("user")
        };
        this.paging.resource = planMonitorServer;

        //初始化图表
        this.initChart();
    }

    public query (){
        this.paging.reload(true);
    }

    public clear(){
        this.paging.params.planName="";
    }


    public initChart(){
        this.$scope.option = {
            title: {
                text: '监控信息'
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data:['批次']
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
                    data:[120, 132, 101, 134, 90, 230, 210]
                }
            ]
        };


    }
    public url="";
    public initBatchChart(planId){
        if(!planId){
            planId =this.planId;
        }else{
            this.planId = planId;
        }

        this.url =config.api_address+'/planBatchMonitor?staticsByPlanId=true&staticsType=batch&planId='+planId;
        this.getChartDatas(this.url);
    }

    public initMonthChart(){
        this.url =config.api_address+'/planBatchMonitor?staticsByPlanId=true&staticsType=month&planId='+this.planId;
        this.getChartDatas(this.url);
    }
    public initYearChart(){
        this.url =config.api_address+'/planBatchMonitor?staticsByPlanId=true&staticsType=day&planId='+this.planId;
        this.getChartDatas(this.url);
    }

    public getChartDatas(url){
        this.$http({
            headers:{'Content-Type': 'application/x-www-form-urlencoded'},
            method: 'get',
            url: url,
        }).success((response)=> {
            if(Number(response.code)===10000 && response.data) {
                this.$scope.option.xAxis.data = response.data.data.titles;
                this.$scope.option.series[0].data=response.data.data.datas;

            }

        });
    }







}


