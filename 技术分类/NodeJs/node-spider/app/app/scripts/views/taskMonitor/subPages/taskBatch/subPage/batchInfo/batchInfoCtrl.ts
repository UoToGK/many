//Created by uoto on 16/6/20.
import {Route, Controller} from "../../../../../../base/annotations";
import "../../../../../../base/directives/pageDirective";
var config = require("../../../../../../../resource/config.yaml");

@Route({//绑定路由
    route: '/taskMonitor/taskBatch/batchInfo', // 批次详情
    templateUrl: 'scripts/views/taskMonitor/subPages/taskBatch/subPage/batchInfo/batchInfo.html',
    controllerAs: 'T'
})
@Controller
class taskMonitorTaskBatchBatchInfoCtrl {// 所有带有 Ctrl
    public pid:string = "";
    public batchId:string = "";
    public taskName:string = "";
    public taskId:string = "";
    public successTotal:string = "";
    totalNum:string = "";
    public batchInfo=[];

    constructor(public $scope,
                public $mdDialog,
                public $http,
                public $routeParams){
        this.pid = $routeParams.pid;
        this.taskName = $routeParams.taskName;
        this.successTotal = $routeParams.successTotal;
        this.taskId = $routeParams.taskId;
        this.batchId = $routeParams.batchId;

        this.$scope.total = $routeParams.total;

        let _me=this;
        $scope.initData=function() {
            _me.getBatchInfoAjax(_me.taskId, _me.batchId);
        };
    }

    getBatchInfoAjax(taskId,batchId){

        this.$http({
            headers:{'Content-Type': 'application/x-www-form-urlencoded'},
            method: 'post',
            url: config.api_address+'/api/v1/monitor/getBatchInfo',
            data: {
                reload:true,
                batchId:batchId,
                taskId:taskId,
                pageNo:this.$scope.cp,
                pageSize:this.$scope.size},
        }).success((response)=> {
            if(Number(response.code)===10000 && response.data) {
                this.batchInfo = response.data.Page.data;
                if(this.$scope.totalSize.length<1) { // 初始化分页按钮
                    //当如果$scope.totalSize.length>0表示页码值已经获取到，不再重新获取。
                    this.$scope.initPageNumber(response.data.Page);
                }
            }else{
                this.batchInfo=[];
                console.log("Error:",response);
            }
        })
    }

    back() {
        window.history.go(-1);
        //window.location.href = '#/taskMonitor/taskBatch';
    }
}