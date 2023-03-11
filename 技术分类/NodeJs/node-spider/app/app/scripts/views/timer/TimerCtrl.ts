//Created by uoto on 16/1/27.

import {Route, Controller} from "../../base/annotations";
import "../../base/directives/pageDirective";
// import "../../base/directives/zTreeList";
var config=require("../../../resource/config.yaml");
import {setTimer} from "./component/setTimer/setTimer";
import moment = require('moment');
import {IPlan} from "../../../../interface/IPlanManage";
import {CAPTURE_MARK} from "../../flow/properties";

@Route({
    route: '/timer', //定时器
    templateUrl: `${__dirname}/timer.html`,
    controllerAs: 'T'
})
@Controller
export class TimerCtrl {
    public list=[];
    public searchName="";

    constructor(
        public $scope,
        public $mdDialog,
        public $http
    ) {
        let _me=this;
        $scope.setTitle(name);
        $scope.initData=function(){
            _me.queryList();
        };
    }

    /**
     * 查询该用户下的所有计划列表
     */
    queryList() {
        let _me=this;
        this.$http({
            method:"get",
            url:config.web_api_host+`/api/v1/plan/list/${sessionStorage.getItem("user")}?reload=true&limit=${this.$scope.size}&current=${this.$scope.cp}&keyword=${this.searchName}`
        }).success(function(response){
            if(Number(response.code)===10000 && response.data) {

                _me.list=response.data.data.data;
                _me.$scope.initPageNumber(response.data.data);

                if(_me.$scope.totalSize.length<1) { // 初始化分页按钮
                    //当如果$scope.totalSize.length>0表示页码值已经获取到，不再重新获取。
                    _me.$scope.initPageNumber(response.data.data);
                }
            }else{
                this.list=[];
                alert(response.msg);
                console.log("Error:",response);
            }
        });
    }


    /**
     * 新增或者修改计划（不包含任务）时所需要的字段
     * @type {{name: string; userId: string; frequencyType: number; startTime: string; endTime: string; timer: {bootTimeMinute: any; bootTime: any; interval: any; type: any; days: any; months: any; weekDays: any}}}
     */
    public currentPlan={
        name:'',
        userId:'',
        frequencyType:0,
        startTime:'',
        endTime:'',
        timer:{
            bootTimeMinute:null,
            bootTime:null,
            interval:null,
            type:null,
            days:null,
            months:null,
            weekDays:null
        }
    };

    /**
     * 初始化 currentPlan.timer
     *
     * 因为不同类型的计划中timer对应的参数是不同的。
     * @returns {{}}
     */
    initTimer(){
        let _timer={};
        for(let key in this.currentPlan.timer){
            if(this.currentPlan.timer[key]){
                _timer[key]=this.currentPlan.timer[key];
            }
        }
        return _timer;
    }

    /**
     * 新建一个空计划
     */
    addPlan(){
        let _timer=this.initTimer();
        _timer=JSON.stringify(_timer);
        let _me=this;
    // alert(this.currentPlan.startTime)   &&/^[0-9]$/g.test(this.currentPlan.startTime) &&/^[0-9]$/g.test(this.currentPlan.endTime)
      if( /\S/.test(this.currentPlan.name)&&/\S/.test(this.currentPlan.startTime) &&/\S/.test(this.currentPlan.endTime)){
          jQuery.ajax({
              headers:{'Content-Type':'application/json'},
              processData:false,
              method:"post",
              url:config.web_api_host+`/api/v1/plan/save/${sessionStorage.getItem("user")}`,
              data:JSON.stringify({
                  name:this.currentPlan.name,
                  userId:this.currentPlan.userId,
                  frequencyType:this.currentPlan.frequencyType,
                  startTime:this.currentPlan.startTime,
                  endTime:this.currentPlan.endTime,
                  timer:_timer
              }),
              success:function(response) {
                  if (Number(response.code) === 10000) {
                      // TODO: 提示用户计划保存成功
                      alert("计划保存成功！");
                      $('#editPlan').modal('hide')
                      _me.queryList();
                  } else {
                      alert(response.msg);
                      console.log("Error:", response);
                  }
              }
          });
      }else {
            if(!/\S/.test(this.currentPlan.name)){
                alert("请输入计划名称");
                return;
            }
            if(!/\S/.test(this.currentPlan.startTime)){
                alert("请输入计划开始时间");
                return;
            }
            if(!/\S/.test(this.currentPlan.endTime)){
                alert("请输入计划结束时间");
                return;
            }
      }

    }

    planIdentify=0;
    queryPlan(_identify){
        this.planIdentify=_identify;
        this.add=false;
        this.update=true;
        let _me=this;
        this.$http({
            method:"get",
            url:config.web_api_host+`/api/v1/plan/get/${_identify}`
        }).success(function(response){
            if(Number(response.code)===10000){
                let _data=response.data.data;
                _me.currentPlan.name=_data.name;
                _me.currentPlan.userId=_data.userId;
                _me.currentPlan.frequencyType=_data.frequencyType;
                _me.currentPlan.startTime=new Date(_data.startTime);
                if(/\d+/g.test(_data.endTime)) {
                    _me.currentPlan.endTime = new Date(_data.endTime);
                }else{
                    _me.currentPlan.endTime =null;
                }
                let _timer=JSON.parse(_data.timer);
                _me.currentPlan.timer.bootTimeMinute=_timer.bootTimeMinute;
                _me.currentPlan.timer.bootTime=_timer.bootTime;
                if(_timer.interval) {
                    _me.currentPlan.timer.interval = _timer.interval;
                }else{
                    _me.currentPlan.timer.interval=null;
                }
                if(_timer.type) {
                    _me.currentPlan.timer.type = _timer.type;
                }else{
                    _me.currentPlan.timer.type=null;
                }
                if(_timer.days) {
                    _me.currentPlan.timer.days = _timer.days;
                }else{
                    _me.currentPlan.timer.days=null;
                }
                if(_timer.months) {
                    _me.currentPlan.timer.months = _timer.months;
                }else{
                    _me.currentPlan.timer.months=null;
                }
                if(_timer.weekDays) {
                    _me.currentPlan.timer.weekDays=_timer.weekDays;
                }else{
                    _me.currentPlan.timer.weekDays=null;
                }
            }else{
                alert(response.msg);
                console.log("Error:",response);
            }
        });
    }
    /**
     * 更新计划名称
     * @param _identify: 计划ID.
     */
    updatePlan(){
        let _timer=this.initTimer();
        _timer=JSON.stringify(_timer);
        let _me=this;
        jQuery.ajax({
            headers:{'Content-Type':'application/json'},
            processData:false,
            method:"post",
            url:config.web_api_host+`/api/v1/plan/update/${sessionStorage.getItem("user")}/${this.planIdentify}`,
            data:JSON.stringify({
                name:this.currentPlan.name,
                userId:this.currentPlan.userId,
                frequencyType:this.currentPlan.frequencyType,
                startTime:this.currentPlan.startTime,
                endTime:this.currentPlan.endTime,
                timer:_timer
            }),
            success:function(response) {
                _me.queryList();
                if (Number(response.code) === 10000) {
                    // TODO: 提示用户计划保存成功
                    alert("计划保存成功！");
                    $("#editPlan").modal('hide');
                } else {
                    alert(response.msg);
                    console.log("Error:", response);
                }


            }
        });
    }

    /**
     * 删除计划
     * @param identify：计划ID
     * tip：删除计划时要提醒用户，并让用户确认是否要删除，以防止误点。
     */
    remove(identify) {
        let _me=this;
        if(window.confirm("您正在执行删除计划操作，请确认是否继续执行？")) {//删除计划时要提醒用户，并让用户确认是否要删除，以防止误点。
            this.$http({
                method:"delete",
                url:config.web_api_host+`/api/v1/plan/delete/${identify}`
            }).success(function (response) {
                if (Number(response.code) === 10000) {
                    // TODO: 提示用户计划已经删除完成
                    alert("计划已删除！");
                    _me.queryList();
                } else {
                    console.log("Error:", response);
                }
            });
        }
    }

    add=true;
    update=false;

    /**
     * 显示对应的按钮（添加和保存按钮）
     * @param _flag
     */
    showButton(_flag){
        this.add = true;
        this.update = false;
    }
    $scope.cancelTaskIdList=["1"];
    $scope.checkedTaskIdList=[];
    zTreeOnCheck(event, treeId, treeNode) {
        if(!treeNode.checked){
            this.cancelTaskIdList.push(treeNode.id);
        }else{
            _.remove(_me.cancelTaskIdList,function(ele) {
                return ele=treeNode.id;
            });
        }
        console.log(_me.cancelTaskIdList);
        alert(treeNode.tId + ",onCheck " + treeNode.name+"  "+treeNode.checked);
    };

    //单过取消
    initTree(){
        let _me=this;
        this.$scope.cancelTaskIdList=["1"];
        this.$scope.checkedTaskIdList=[];
        this.$scope.setting={
            check:{
                autoCheckTrigger:true,
                enable:true,
                chkboxType:{
                    "Y":"ps",
                    "N":"s"
                }
            },
            callback: {
                onClick:function(event, treeId, treeNode) {
                    //alert(treeNode.tId + ",onClick " + treeNode.name);
                }
                ,onCheck: function (event, treeId, treeNode) {
                    if(treeNode.checked){
                        _.remove(_me.$scope.cancelTaskIdList,function(ele) {
                            return ele==treeNode.id;
                        });
                    }else{
                        _me.$scope.cancelTaskIdList.push(treeNode.id);
                    }
                    console.log(_me.$scope.cancelTaskIdList);
                    //alert(treeNode.tId + ",onCheck " + treeNode.name+"  "+treeNode.checked);
                }
            }
        };


        this.$scope.zNodes=[];
        // $(document).ready(function () {
        //     _me.$scope.zTreeObj = $.fn.zTree.init(_me.$scope.el, _me.$scope.setting, _me.$scope.zNodes);
        // });
    }


    public planIdentify;
    /**
     * 初始化树
     * @param _identify
     */
    public filterKey;
    initTreeData(_identify,opt){
        if(opt){
            this.filterKey="";
        }
        let _me=this;
        if(_identify=='undefined'||_identify==""){
            _identify=this.planIdentify;
        }else{
            this.planIdentify=_identify;
        }

        this.initTree();//初始化树的配置
        this.$http({
            method:"get",
            url:config.web_api_host+`/api/v1/plan/tree/${sessionStorage.getItem("user")}/${_identify}?filterKey=${this.filterKey}`

        }).success(function(response){
            if(Number(response.code)===10000){
                //TODO:将获取到的树状结构对象赋值给当前对象的$scope兑现下的treeData属性
                //_me.$scope.treeData=response;

                if(Number(response.code)===10000 && (response.data.data instanceof Array)) {
                    _me.$scope.zNodes = response.data.data;
                    $(document).ready(function () {
                                _me.$scope.zTreeObj = $.fn.zTree.init(_me.$scope.el, _me.$scope.setting, _me.$scope.zNodes);
                    });
                }
            }else{
                console.log("Error:",response);
            }
        });
    }
    //ng-keydown="T.filterTree($event)"
    filterTree(event){
        if (event.keyCode == "13") {
            this.initTreeData("");

        }
    }

    /**
     * 找到树节点上所有被选中的任务ID
     * @returns {Array}
     */
    captureTaskId(){
        let _nodes=this.$scope.zTreeObj.getCheckedNodes();//拿到所有选中的节点对象
        let _list=[];
        for(let i=0;i<_nodes.length;i++){
            _list.push(_nodes[i].id);
            // if(/^(task)(\d|\w+)/gi.test(_nodes[i].id)){//只需要任务ID，任务ID均以TASK开头
            //     _list.push(_nodes[i].id);
            // }
        }
        return _list;
    }

    /**
     * 设置计划，给计划添加任务，或者任务组，或者项目。然后并保存计划。
     *
     * 弹出的模态框下的提交保存计划按钮触发该事件。
     */
    savePlan(){
        let _list=this.captureTaskId();
        console.log( _list);
        this.$http({
            method:"post",
            url:config.web_api_host+`/api/v1/plan/updateTask/${this.planIdentify}`,
            data:{tids:this.captureTaskId(),ctids:this.$scope.cancelTaskIdList}
        }).success(function(response){
            if(Number(response.code)===10000){
                alert("保存成功！");
            }else{
                console.log("Error:",response);
            }
        });
    }


    // 新建编辑定时器
        async editTimer(item, isCreate: boolean) {
        const _me =this;
        const plan: IPlan = await setTimer({
            $mdDialog: this.$mdDialog,
            plan: isCreate ? {timer: TimerCtrl.getTimer()} : item,
            closeTo: closeTo(item),
            isCreate:isCreate
        });

        if (plan) {
            let _timer={};
            for(let key in plan.timer){
                if(typeof plan.timer[key] =='number'){
                    _timer[key]=plan.timer[key];
                }else{
                    if(Object.keys(plan.timer[key]).length>0){
                        _timer[key]=plan.timer[key];
                    }
                }

            }
            _timer=JSON.stringify(_timer);
            plan.timer = _timer;

            plan.userId = `${sessionStorage.getItem("user")}`;
            plan.startTime=new Date( plan.startTime.getTime() -(plan.startTime.getTimezoneOffset()*60*1000));
            if (plan.endTime) {
                plan.endTime=new Date( plan.endTime.getTime() -(plan.endTime.getTimezoneOffset()*60*1000));
            }
            if(isCreate){
                jQuery.ajax({
                    headers:{'Content-Type':'application/json'},
                    processData:false,
                    method:"post",
                    url:config.web_api_host+`/api/v1/plan/save/${sessionStorage.getItem("user")}`,
                    data:JSON.stringify(plan),
                    success:function(response) {
                        if (Number(response.code) === 10000) {
                            // TODO: 提示用户计划保存成功
                            alert("计划保存成功！");
                        } else {
                            alert(response.msg);
                            console.log("Error:", response);
                        }
                        _me.queryList();
                    }
                });
            }else{
                delete plan.$$hashKey;
                jQuery.ajax({
                    headers:{'Content-Type':'application/json'},
                    processData:false,
                    method:"post",
                    url:config.web_api_host+`/api/v1/plan/update/${sessionStorage.getItem("user")}/${item.id}`,
                    data:JSON.stringify(plan),
                    success:function(response) {
                        if (Number(response.code) === 10000) {
                            // TODO: 提示用户计划保存成功
                            alert("计划保存成功！");
                        } else {
                            alert(response.msg);
                            console.log("Error:", response);
                        }
                        _me.queryList();
                    }
                });
            }

        }

    }


    // 返回一个默认的定时器配置
    static getTimer(): Timer {
        return {
            bootTime: [],
            interval: 0,
            type: 0,
            bootTimeMinute: 0,//设置分钟
            days: [],
            months: [],
            weeks: [],
            weekDays: []
        }
    }


    // 格式化计划属性信息，如将时间规范为 Date，字符串规范为 number等
    static formatPlan(plan: IPlan,isCreate) {
        let _timer = TimerCtrl.getTimer();
        if(isCreate){
         plan.timer = _timer;
        }else{
            let timeObj = JSON.parse(plan.timer);
            plan.timer = $.extend(true,{}, _timer, timeObj);
        }
        if (plan.startTime) {
                plan.startTime = new Date(plan.startTime);
            }

            if (plan.endTime) {
                plan.endTime = new Date(plan.endTime);
            }
        return plan;
    }


    static formatMsg(plan: IPlan) {
        let msg,
            bootTime = plan.timer.bootTime,
            days = plan.timer.days,
            weekDays = formatWeekDays(plan.timer.weekDays),
            months = plan.timer.months,
            weeks = formatWeek(plan.timer.weeks),
            start = formatData(plan.startTime),
            end = formatData(plan.endTime);

        // 设置分钟
        let minute = '第 0 分';
        if (plan.timer.bootTimeMinute) {
            minute = `第 ${plan.timer.bootTimeMinute} 分`;
        }
        switch (plan.frequencyType) {
            case 0://一次
                msg = `此计划将在 ${start} (${bootTime} 的${minute} ) 启动`;//${minute}
                break;
            case 1://每天
                msg = `每天 (${bootTime}) 的${minute} ) 启动, 从 ${start} 开始,持续到 ${end} (不含当天) 结束`;
                break;
            case 2://每周
                msg = `每周 [${weekDays}] 的 (${bootTime}) 的${minute} ) 启动, 从 ${start} 开始,持续到 ${end} (不含当天) 结束`;
                break;
            case 3://每月
                if (plan.timer.type == 0) {
                    msg = `每[${months}]月, [${days}]日 (${bootTime}) 的${minute} ) 启动, 从 ${start} 开始,持续到 ${end} (不含当天) 结束`;
                } else {
                    msg = `每[${months}]月, 第[${weeks}]周, 每周[${weekDays}] 的 (${bootTime}) 的${minute} ) 启动, 从 ${start} 开始,持续到 ${end} (不含当天) 结束`;
                }
                break;
        }
        return msg;
    }

    /**
     * 暂停计划
     * @param {string} planId
     */
    suspend(planId:string){
        let _me=this;
        if(window.confirm("您正在执行暂停计划操作，请确认是否继续执行？")) {
            this.$http({
                method:"get",
                url:config.web_api_host+`/api/v1/plan/suspend/${planId}`
            }).success(function (response) {
                if (Number(response.code) === 10000) {
                    alert("计划已暂停！");
                    _me.queryList();
                } else {
                    console.log("Error:", response);
                }
            });
        }
    }

    /**
     * 启用计划
     * @param {string} planId
     */
    start(planId:string){
        let _me=this;
        if(window.confirm("您正在执行启用计划操作，请确认是否继续执行？")) {
            this.$http({
                method:"get",
                url:config.web_api_host+`/api/v1/plan/start/${planId}`
            }).success(function (response) {
                if (Number(response.code) === 10000) {
                    alert("计划已启用！");
                    _me.queryList();
                } else {
                    console.log("Error:", response);
                }
            });
        }
    }


}


function closeTo(e: MouseEvent) {
    if (e && e.target && e.type) {
        return e.target;
    }
    return '#newBtn';
}
function formatWeekDays(days) {
    const map = {
        '2': '一',
        '3': '二',
        '4': '三',
        '5': '四',
        '6': '五',
        '7': '六',
        '1': '日',
    };
    return (days || []).map(function (d) {
        return map[d];
    })
}

function formatData(date) {
    if (date) {
        return moment(date).format('YYYY-MM-DD');
    }
    return '';
}

function formatWeek(weeks) {
    const map = {
        0: '最后',
        1: '一',
        2: '二',
        3: '三',
        4: '四'
    };
    return (weeks || []).map(function (week) {
        return map[week];
    })
}



