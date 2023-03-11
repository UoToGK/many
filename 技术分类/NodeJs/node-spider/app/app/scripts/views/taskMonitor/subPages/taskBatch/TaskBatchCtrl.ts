//Created by uoto on 16/6/20.
import {Route, Controller} from "../../../../base/annotations";
import "../../../../base/directives/pageDirective";
var os=require('os');
var http = require('http');
var fs = require('fs');
var exec = require('child_process').exec;
var config = require("../../../../../resource/config.yaml");

@Route({//绑定路由
    route: '/taskMonitor/taskBatch', // 任务批次
    templateUrl: 'scripts/views/taskMonitor/subPages/taskBatch/taskBatch.html',
    controllerAs: 'T'
})
@Controller
class taskMonitorTaskBatchCtrl {// 所有带有 Ctrl
    public pid: string = "";
    public taskName: string = "";
    totalNum: Number = 0;
    successTotal: Number = 0;
    public batchList = [];
    public checkData = [];
    public columnMap = [];
    public taskId;
    public status:string = "";
    public startPreTime:string = "";
    public startNextTime:string = "";
	public statusList =[
		{name:"请选择","code":""},
		{name:"待执行","code":"0"},
		{name:"执行中","code":"1"},
		{name:"成功","code":"2"},
		{name:"失败","code":"4"}
	];
    
    
    constructor(public $scope,
                public $mdDialog,
                public $http,
                public $routeParams,
                public getTaskInfo) {
        this.pid = $routeParams.pid;
        this.taskName = $routeParams.taskName;
        this.taskId = $routeParams.taskId;

        let _me = this;
        $scope.checkListShow = false;
        $scope.backOrClose = "返回";
        $scope.initData = function () {
            _me.getTaskInfoAjax(_me.taskId);
        };
    }

    test(startTime,endTime){
        var time=endTime-startTime;
        if(endTime!=null && startTime!=null ){
            var seconds =time/1000;
            var  resout=seconds+"秒"
            var points=seconds/60;
            if(points>1){
                var points=parseInt(seconds/60);
                var  resout=points+"分"
            }
            var points = seconds / 60;
            if (points > 60) {
                var points = parseInt(seconds / 60);
                var shi = parseInt (points/60);
                var newfen=  points%60;
                if(newfen==0){
                    var resout=shi+"小时"
                }else {
                    var resout=shi+"小时"+newfen+"分"
                }

            }
        }
        return resout;
    }


    getTaskInfoAjax(taskId) {
        this.getTaskInfo.post({
            method:'getTaskInfo',
	        reload:true,
	        taskId:taskId,
	        pageNo: this.$scope.cp,
	        status:this.status,
	        startPreTime:this.startPreTime,
	        startNextTime:this.startNextTime,
            pageSize: this.$scope.size},{},(response) => {
            if (Number(response.code) === 10000 && response.data) {
                this.batchList = response.data.Page.data;
                //this.totalNum = response.data.totalNum;
                // this.batchList.forEach(item => this.totalNum += Number(item.successDataCounts) + Number(item.failureDataCounts));
                this.batchList.forEach(item => {
                    item.taskId = this.taskId;
	                this.successTotal += Number(item.successDataCounts);
                });

                if (this.$scope.totalSize.length < 1) { // 初始化分页按钮
                    //当如果$scope.totalSize.length>0表示页码值已经获取到，不再重新获取。
                    this.$scope.initPageNumber(response.data.Page);
                }
            } else {
                this.batchList = [];
                console.log("Error:", response);
            }
        });
        // this.$http({
        //     headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        //     method: 'post',
        //     url: config.api_address + '/api/v1/monitor/getTaskInfo',
        //     data: {
        //         taskId: taskId,
        //         pageNo: this.$scope.cp,
        //         pageSize: this.$scope.size,
        //         reload: true
        //     },
        // }).success((response) => {
        //     if (Number(response.code) === 10000 && response.data) {
        //         this.batchList = response.data.Page.data;
        //         this.totalNum = response.data.totalNum;
        //         // this.batchList.forEach(item => this.totalNum += Number(item.successDataCounts) + Number(item.failureDataCounts));
        //         this.batchList.forEach(item => this.successTotal += Number(item.successDataCounts));
        //         if (this.$scope.totalSize.length < 1) { // 初始化分页按钮
        //             //当如果$scope.totalSize.length>0表示页码值已经获取到，不再重新获取。
        //             this.$scope.initPageNumber(response.data.Page);
        //         }
        //     } else {
        //         this.batchList = [];
        //         console.log("Error:", response);
        //     }
        // });
    }
	
	public clear(){
		this.status="";
		this.startPreTime="";
		this.startNextTime="";
	}
    
    public batch:any = {};
    //查看数据
    public checkDataList(batch) {
	    this.checkData = [];
	    this.columnMap = [];
        this.batch = angular.copy(batch);
        this.$scope.checkListShow = true;
        let _me = this;
        this.$http({
            method: "GET",
            url: config.api_address + `/api/v1/task/data/${batch.taskId}`,
            params: {
                'batchId': batch.batchId,
                'current': 1,
                'limit': 100,
                'reload': true
            }
        }).success((response) => {
            if (Number(response.code) === 10000) {
                this.$scope.checkData = response.data.data.data;
                this.$scope.columnMap = response.data.data.columnMap;
            } else {
                this.$scope.checkData = [];
                console.log("Error:", response);
            }
        })
    }
    
    private runFlag:boolean = false;
    public exportData(batch)
    {
	    var _me = this;
	    if (_me.runFlag)
	    {
	    	alert("数据正在导出中,请勿重复操作...");
	    	return;
	    }
	    _me.runFlag = true;
	    var fileDir = os.homedir() + "/Downloads/";
	    fs.exists(fileDir, function(exists) {
		    if (!exists)
		    {
			    fs.mkdir(fileDir, function(err){
				    if(err)
				    {
					    alert(fileDir + " 文件夹创建失败！");
					    _me.runFlag = false;
					    return;
				    }
			    });
		    }
	    });
	    var fileUrl  = config.api_address + `/api/v1/task/export/${batch.taskId}?batchId=${batch.batchId}`;
	    var filename = fileDir + (new Date().getTime()) + '.xls';
	    var req=http.get(fileUrl, function (res) {
		    var size = 0;
		    var chunks = [];
		    if(res.statusCode==200)
		    {
			    res.on('data', function (chunk)
			    {
				    size += chunk.length;
				    chunks.push(chunk);
			    });
			    res.on('end', function ()
			    {
				    var data = Buffer.concat(chunks, size);
				    fs.writeFile(filename, data, {}, function(err)
				    {
					    if(err)
						    alert("数据导出失败")
					    else
					    {
					    	alert("数据导出成功，文件保存地址：" + filename);
						    // exec('explorer ' + filename, function(err, stdout, stderr) {} );
					    }
					    _me.runFlag = false;
				    });
			    });
		    }
		    else
		    {
			    _me.runFlag = false;
		    }
	    }).on('error', function (e) {
		    alert("Got error: " + e.message);
		    _me.runFlag = false;
	    });
        req.end();
    }
    
    //关闭蒙层
    checkBack() {
        this.$scope.checkListShow = false;
    }

    back() {
        // window.history.go(-1);
        window.location.href = '#/taskMonitor';
    }

    public cancelQueneTask(taskId:string,batchId:string){
        var _me = this;
        if(window.confirm("您正在执行取消执行操作，请确认是否继续执行？")) {
            this.getTaskInfo.post({method:'cancelQueneTask'},{taskId:taskId,batchId:batchId},function (response) {
                if(response.code==10000){
                    alert("取消成功");
                    _me.getTaskInfoAjax(taskId);
                }
            })
        }
    }
}
