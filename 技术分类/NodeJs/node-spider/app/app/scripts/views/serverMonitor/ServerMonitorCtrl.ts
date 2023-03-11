//Created by uoto on 16/1/27.
import {Route, Controller} from "../../base/annotations";
import "../../base/directives/pageDirective";
var config = require("../../../resource/config.yaml");
import moment = require('moment');


@Route({//绑定路由
    route: '/serverMonitor', // 服务器监控
    templateUrl: 'scripts/views/serverMonitor/serverMonitor.html',
    controllerAs: 'T'
})
@Controller
export class ServerMonitorCtrl {
    public selected;
    Group:Number = 0;
    public isFirst:boolean = true;
    public currentTime:any;
    public serverList = [];
    public time;
    public timer;
    constructor(public $scope,
                public $mdDialog,
                public TaskManage,
                public $routeParams,
                public TaskExecutor,
                public $http,
                public $interval,
                public $filter) {
        $scope.time = 1*1000*60;
        $scope.timer = 0;
        this.isFirst = true;

        let _me=this;
        $scope.initData=function(){
            _me.init();
        };

        $scope.ratelist = [
            {value : "每隔1分", minute : "1"},
            {value : "每隔2分", minute : "2"},
            {value : "每隔5分", minute : "5"},
            {value : "每隔10分", minute : "10"}
        ];
        $scope.selectedRate=$scope.ratelist[1].minute;

    }
    // 下拉列表

    init(){
        this.serverAjax();//获取采集器监控信息
        this.$scope.timer = this.$interval(()=>{// 初始定时器，按照客户所选频率刷新监控信息
            this.serverAjax();
        },this.$scope.time);

        if(this.$scope.timer){// 取消定时器
            let _me=this;
            this.$scope.$on('$destroy',function(){
                _me.$interval.cancel(_me.$scope.timer);
            });
        }
    }
    // 改变更新时间
    changeTime(){
        if(this.isFirst){
            this.currentTime =moment().format('YYYY-MM-DD HH:mm:ss')
        }else {
            this.currentTime =moment(this.currentTime).add(this.time,'milliseconds').format('YYYY-MM-DD HH:mm:ss')
        }
    }
    // 设置定时器
    outTime(){
        let _me = this;
        this.$scope.timer = this.$interval(()=>{
            this.serverAjax();
        },_me.time);
    }
    // 下拉切换
    show(){
        this.isFirst = false;
        this.time=Number(this.$scope.selectedRate)*1000*60;
        if (this.timer){
            this.$interval.cancel(this.timer);
            this.outTime();
        }
    }


    // 后台请求列表数据
    serverAjax(){
        this.$http({
            headers:{'Content-Type': 'application/x-www-form-urlencoded'},
            method: 'post',
            url: config.api_address+'/api/v1/monitor/listServerInfo?reload=true',
            data: {
                pageNo:this.$scope.cp,
                pageSize:this.$scope.size
            },
        }).success((response)=> {
            if(Number(response.code)===10000 && response.data) {
                this.serverList = response.data.Page.data;
                let _total=0;
                let _list=null;
                for(let i=0;i<this.serverList.length;i++){
                    _list=JSON.parse(this.serverList[i].totalDiskVolume);

                    for(let n=0;n<_list.length;n++){
                        _total+=_list[n].used;
                    }
                    this.serverList[i].usedDiskVolume=_total;
                    _total=0;
                }
                this.changeTime();
                if(this.$scope.totalSize.length<1) { // 初始化分页按钮
                    //当如果$scope.totalSize.length>0表示页码值已经获取到，不再重新获取。
                    this.$scope.initPageNumber(response.data.Page);
                }
            }else{
                alert(response.msg);
                this.serverList=[];
            }

        });
    }

    // 弹窗 总容量
    getTotal(val)
    {
        var total:Number = 0;
        var arr:any[] = JSON.parse(val);
        arr.forEach(item =>{
            total += Number(item.total);
        });
        return total / 1000 / 1000;
    }

    private modalData:any[] = [];

    // 总容量弹窗
    showModal(val){
        this.modalData = [];
        $("#myModal").modal("show");
        this.modalData = JSON.parse(val);
    }

    skipToChart(_Ip){
        this.$scope.serverIp=_Ip;
        location.href='#/serverMonitor/changeChart';
    }
}
