//Created by uoto on 16/1/27.
import {Route, Controller} from "../../../../base/annotations";
import "../../../../base/directives/pageDirective";
import {PagingOption} from "../../../../base/directives/paging/PagingOption";

@Route({//绑定路由
    route: '/planBatch/planBatchMonitor', // 任务监控
    templateUrl: 'scripts/views/planBatch/subPages/batchMonitor/planBatchMonitor.html',
    controllerAs: 'T'
})
@Controller
export class PlanBatchMonitorCtrl {
    public routinePlanId="";
    //查询状态
    statusList =[
        {name:"请选择","code":""},
        {name:"待执行","code":"0"},
        {name:"执行中","code":"1"},
        {name:"成功","code":"2"},
        {name:"部分失败","code":"3"},
        {name:"失败","code":"4"}
    ];
    currentTime =new Date();
    paging: PagingOption<> = {};
    private pagingDetail: PagingOption<> = {};
    constructor(public $scope,public dialog,public $routeParams,public planBatchMonitorServer,public $filter,public batchTaskServer) {
        this.paging.params = {
            orderBy: "START_TIME",
            order: "desc",
            startTime:"",
            endTime:"",
            status:"",
            routinePlanId:$routeParams.planId
        };
        this.paging.resource = planBatchMonitorServer;
    }
    //查询功能
    public query(){
        if(this.paging.params.startTime!='undefined'&&this.paging.params.startTime!=""&&this.paging.params.startTime!='null'){
            this.paging.params.startTime = this.$filter('date')(Date.parse(this.paging.params.startTime), 'yyyy-MM-dd');
        }else{
            this.paging.params.startTime="";
        }
        if(this.paging.params.endTime!='undefined'&&this.paging.params.endTime!=""&&this.paging.params.endTime!='null'){
            this.paging.params.endTime = this.$filter('date')(Date.parse(this.paging.params.endTime), 'yyyy-MM-dd');
        }else{
            this.paging.params.endTime="";
        }

        this.paging.reload(true);
    }

    public clear(){
        this.paging.params.startTime="";
        this.paging.params.endTime="";
        this.paging.params.status="";
    }
    //查看详情
    public detail(type,batchId,code){
        $("#"+type).modal("show");
        this.pagingDetail.params = {
                orderBy: "START_TIME",
                order: "desc",
                status:code,
                batchId:batchId
            };
        if (this.pagingDetail.resource != this.batchTaskServer) {
            this.pagingDetail.resource = this.batchTaskServer;
        } else {
            this.pagingDetail.currentPage = 0;
            this.pagingDetail.reload(true);
        }
    }
    //计算时间差
    public timeDifference(startTime) {
        var date3 = this.currentTime.getTime() - startTime;//时间差的毫秒数
        //计算出相差天数
        var days = Math.floor(date3 / (24 * 3600 * 1000));
        //计算出小时数
        var leave1 = date3 % (24 * 3600 * 1000);    //计算天数后剩余的毫秒数
        var hours = Math.floor(leave1 / (3600 * 1000));
        //计算相差分钟数
        var leave2 = leave1 % (3600 * 1000);        //计算小时数后剩余的毫秒数
        var minutes = Math.floor(leave2 / (60 * 1000));
        //计算相差秒数
        var leave3 = leave2 % (60 * 1000);      //计算分钟数后剩余的毫秒数
        var seconds = Math.round(leave3 / 1000);
        return " 耗时 " + days + "天 " + hours + "小时 " + minutes + " 分钟" + seconds + " 秒";
    }

    back() {
        window.history.go(-1);
    }

    public async cancelPlan(planBatch)
    {
        if (confirm("是否取消该计划批次?"))
        {
	        const response = await this.planBatchMonitorServer.post("cancelPlanBatch", planBatch).$promise;
	        if (response && Number(response.code)===10000)
	        {
                alert("取消计划批次成功！");
                this.query();
	        }
	        else
	        {
		        alert("取消计划批次失败！");
	        }
        }
    }
    
    test(startTime,endTime){
        var time=endTime-startTime;
        if(endTime!=null && startTime!=null ) {
            var seconds = time / 1000;
            var resout = seconds + "秒"
            var points = seconds / 60;

            if (points > 1) {
                var points = parseInt(seconds / 60);
                var resout = points + "分"
            }
            var points = seconds / 60;
            if (points > 60) {
                var points = parseInt(seconds / 60);
                var shi = parseInt(points / 60);
                var newfen = points % 60;
                if (newfen == 0) {
                    var resout = shi + "小时"
                } else {
                    var resout = shi + "小时" + newfen + "分"
                }
            }
        }
        return resout;
    }

    perform(startTime){
         var end=new Date();
         var ti=end-startTime;
        var seconds = ti / 1000;
        var resout = seconds + "秒"
        var points = seconds / 60;
        if (points > 1) {
            var points = parseInt(seconds / 60);
            var resout = points + "分"
        }
        var points = seconds / 60;
        if (points > 60) {
            var points = parseInt(seconds / 60);
            var shi = parseInt(points / 60);
            var newfen = points % 60;
            if (newfen == 0) {
                var resout = shi + "小时"
            } else {
                var resout = shi + "小时" + newfen + "分"
            }
        }
            return resout;
    }

}


