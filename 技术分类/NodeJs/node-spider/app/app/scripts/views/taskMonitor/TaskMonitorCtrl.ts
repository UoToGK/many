//Created by uoto on 16/1/27.
import {Route, Controller} from "../../base/annotations";
import "../../base/directives/pageDirective";
var config = require("../../../resource/config.yaml");


@Route({//绑定路由
    route: '/taskMonitor', // 任务监控
    templateUrl: 'scripts/views/taskMonitor/taskMonitor.html',
    controllerAs: 'T'
})
@Controller
export class TaskMonitorCtrl {
    private taskList:any[] = [];
    public totalNum:number = 0;
    public projectList=null;
    private item= "";
	private taskName = "";
    constructor(public $scope, public $http,public TaskGroupInfoManage,public getTaskInfo) {
        this.$scope.isLoading=true;

        let _me=this;
        $scope.initData=function(){
            _me.initList();
        };
        // this.initList();

        //初始化图表
        this.initChart();
        this.$scope.isLoading=false;

    }

    initList(){
      //取selected
        let _me=this;
        this.$http({
            headers:{'Content-Type': 'application/x-www-form-urlencoded'},
            method: 'get',
            url: config.api_address+`/api/v1/project/list/${sessionStorage.getItem("user")}`
        }).success((response)=> {
            _me.projectList = response.data.data.data;
            var sessionSeled = localStorage.getItem("seled");
	        if(sessionSeled == "null")
                _me.item = "";
            else
		        _me.item = sessionSeled;
            this.taskAjax(_me.item);
        });
    }

    // 后台请求列表数据
    taskAjax(item){
        let _me=this;
        this.TaskGroupInfoManage.post({method:'getTaskGroupInfo',reload:true, projectId:item, taskName:this.taskName,
            pageNo:this.$scope.cp,
            pageSize:this.$scope.size},{},(response)=>{
            if(Number(response.code)===10000 && response.data) {
                _me.taskList = response.data.Page.data;
                this.taskList.forEach(item => {
                    this.totalNum += Number(item.successDataCounts) + Number(item.failureDataCounts);
                });
                if(_me.$scope.totalSize.length<1) { // 初始化分页按钮
                    //当如果$scope.totalSize.length>0表示页码值已经获取到，不再重新获取。
                    _me.$scope.initPageNumber(response.data.Page);
                }
            }else{
                this.taskList=[];
                console.log("Error:",response);
            }
        });
        // this.$http({
        //     headers:{'Content-Type': 'application/x-www-form-urlencoded'},
        //     method:"post",
        //     url:config.api_address+`/api/v1/monitor/getTaskGroupInfo?reload=true`,
        //     data:{
        //         projectId:item,
        //         pageNo:this.$scope.cp,
        //         pageSize:this.$scope.size
        //     }
        // }).success((response)=>{
        //     if(Number(response.code)===10000 && response.data) {
        //         _me.taskList = response.data.Page.data;
        //         this.taskList.forEach(item => {
        //             this.totalNum += Number(item.successDataCounts) + Number(item.failureDataCounts);
        //         });
        //         if(_me.$scope.totalSize.length<1) { // 初始化分页按钮
        //             //当如果$scope.totalSize.length>0表示页码值已经获取到，不再重新获取。
        //             _me.$scope.initPageNumber(response.data.Page);
        //         }
        //     }else{
        //         this.taskList=[];
        //         console.log("Error:",response);
        //     }
        // })
    }

    changeTask(item){
        this.$scope.cp=1;
        localStorage['seled'] = item;
        this.$scope.start=1;
        this.$scope.total=1;
        this.$scope.totalSize=[];
        this.taskAjax(item);
    }


    //图表部分
    public initChart() {
        this.$scope.option = {
            title: {
                text: '折线图堆叠'
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: ['采集量']
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
                data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    name: '采集量',
                    type: 'line',
                    stack: '总量',
                    data: [120, 132, 101, 134, 90, 230, 210]
                }
            ]
        };
    }
    public taskId="";
    public url="";
    public initBatchChart(taskId){
        if(!taskId){
            taskId =this.taskId;
        }else{
            this.taskId = taskId;
        }

        this.url =config.api_address+'/batchTask?staticsByTask=true&staticsType=batch&taskId='+taskId;
        this.getChartDatas(this.url);
    }

    public initMonthChart(){
        this.url =config.api_address+'/batchTask?staticsByTask=true&staticsType=month&taskId='+this.taskId;
        this.getChartDatas(this.url);
    }
    public initYearChart(){
        this.url =config.api_address+'/batchTask?staticsByTask=true&staticsType=day&taskId='+this.taskId;
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

    public query()
    {
        this.changeTask(this.item);
    }

    public clear()
    {
        this.item = null;
        this.taskName = "";
        this.query();
    }

    public cancelProcess(taskId:string){
        var _me = this;
        if(window.confirm("您正在执行取消执行操作，请确认是否继续执行？")) {
            this.getTaskInfo.post({method:'cancelQueneTask'},{taskId:taskId},function (response) {
                if(response.code==10000){
                    alert("取消成功");
                    _me.taskAjax(_me.item);
                }
            })
        }
    }

    
}
