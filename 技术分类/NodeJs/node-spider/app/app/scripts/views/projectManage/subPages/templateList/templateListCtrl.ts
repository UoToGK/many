//Created by uoto on 16/6/20.
import {Route, Controller} from "../../../../base/annotations";
import "../../../../base/directives/pageDirective";
var config = require("../../../../../resource/config.yaml");

@Route({ //绑定路由
    route: '/projectManage/templateList',
    templateUrl: 'scripts/views/projectManage/subPages/templateList/templateList.html',
    controllerAs: 'T'
})
@Controller
export class TemplateListCtrl {// 所有带有 Ctrl
  //模板详情
    public tem_pid:string = "";
    public templateName:string = "";
    public tem_tid:string="";
    public grou_tid:string="";
    public tem_url:string="";
    constructor(
        public $scope,
        public $mdDialog,
        public $routeParams,
        public $http,
        public TemplateManage,
        public TemplateColumnManage){
      //模板详情
       /* let _me=this;
        $scope.initData=function(){
            _me.initData();
        };*/
       $scope.temShow=false;
       this.initData();
    }

    public templateRes(pid,tid){
        this.currColumn={};
        this.$scope.temShow=true;
        this.tem_pid = pid;
        this.tem_tid = tid;
        this.grou_tid = tid;
        this.tem_url=config.api_address+"/api/v1/column/save/"+tid;
        this.templateName ="tem";
        this.temData();
    }

    groupList=[];
    public pid="";

    //模板详情
    public button="增加";
    public items=[];
    public columnName="";
    temData(){
        let _me=this;
        this.$http({
            method:"get",
            url:config.api_address+"/api/v1/column/list/"+this.tem_tid
        }).success(function(response){
            if(Number(response.code)===10000) {
                _me.items = response.data.data;
            }else{
                console.log("Error:",response);
            }
        });
    }
    public currColumn={};
    editColumn(item){
        this.columnName=item.columnDesc;
        this.currColumn=item;
    }

    //添加模板字段
    temSave(){
        for(let key in this.items){
            if(this.items[key]["columnDesc"]===this.columnName){
                alert("字段名称已存在，请重新修改！");
                return null;
            }
        }

        if(!(/^[\u4e00-\u9fa5|a-z|A-Z]/.test(this.columnName))){
            alert("请以字母、汉字开头。");
            return null;
        }

        this.TemplateColumnManage.save({opt:"save",columnId:this.currColumn.id,desc:this.columnName,templateId:this.tem_tid},{},(res)=>{
            if(Number(res.code)===10000){
                this.initData();
            }else if(Number(res.code)===10001){
                alert("请以字母、中文开头");
            }else{
                alert(res.msg);
                console.log("Error:",res);
            }
            this.temData();
            },(res)=>{
             alert("请求处理异常");
        });

    }

    edit(_identify){
        this.tem_url=config.api_address+`/api/v1/column/update/${this.tem_tid}/${_identify}`;
        this.button="保存";
        for(let key in this.items){
            if(this.items[key]["id"]===_identify){
                this.columnName=this.items[key]["columnDesc"];
                break;
            }
        }
    }

    temRemove(_identify){
        if(window.confirm("您正在执行删除该字段操作，请确认！")) {
            let _me=this;
            this.$http({
                method: "delete",
                url: config.api_address + `/api/v1/column/delete/${_identify}`
            }).success(function (response) {
                //console.log(response);
                if (Number(response.code) === 10000) {
                    _me.initData();
                    _me.temData();
                } else {
                    alert("删除字段失败！");
                }
            });
        }
    }
    // temBack(){
    //     this.$scope.temShow=false;
    // }
    // --------------


    back() {
        window.location.href = '#/projectManage';
    }

    initData(){
        let _me=this;
        this.pid=this.$routeParams.pid;
        this.$http({
            headers:{'Content-Type': 'application/x-www-form-urlencoded'},
            method: 'get',
            url: config.api_address+'/api/v1/template/list/'+this.$routeParams.pid
        }).success(function(response) {
            if(Number(response.code)===10000) {
                _me.groupList = response.data.data.data;
            }else{
                //alert(response.msg);
                console.log("Error:",response);
            }
        });
    }
    remove(_identify){
        if(window.confirm("您正在删除项目模板，请确认删除！")) {
            let _me = this;
            this.$http({
                method: "delete",
                url: config.api_address + "/api/v1/template/delete/" + _identify
            }).success(function (response) {
                if (Number(response.code) === 10000) {
                    _me.initData();
                    alert("模板已删除！");
                } else {
                    alert("删除模板失败！");
                    console.log("ERROR:",response);
                }
            });
        }
    }
    public templateName="";
    public templateOldName="";
    public snapshotFlag="";
    public oldSnapshotFlag="";
    public url=config.api_address+`/api/v1/template/save/${this.$routeParams.pid}`;
    public title="添加";
    public templateId="添加";
    addTemplate(){
        this.title="添加";
        this.templateId="";
        this.templateName = "";
        this.templateOldName = "";
	    this.snapshotFlag = "N";
	    this.oldSnapshotFlag = "N";
        this.url=config.api_address+`/api/v1/template/save/${this.$routeParams.pid}`;
    }
    editTemplate(identify,tName,snapshotFlag){
        this.title="修改";
        this.templateId=identify;
        this.url=config.api_address+`/api/v1/template/update/${this.$routeParams.pid}/${identify}`;
        this.templateName=tName;
        this.templateOldName=tName;
        this.snapshotFlag = snapshotFlag;
        this.oldSnapshotFlag = snapshotFlag;
    }



    // save(){
    //     let _me=this;
    //     this.$http({
    //         headers:{'Content-Type': 'application/x-www-form-urlencoded'},
    //         method: 'post',
    //         url: this.url,
    //         data: {
    //             name:this.templateName
    //         }
    //     }).success(function(response) {
    //         if(Number(response.code)===10000){
    //             alert("模板已保存！");
    //             _me.initData();
    //         }else{
    //             alert(response.msg);
    //             console.log("Error:",response);
    //         }
    //     });

    save(){
        if (this.templateOldName != "" && this.templateName == this.templateOldName && this.snapshotFlag == this.oldSnapshotFlag)
        {
	        alert("还未修改任何信息！");
	        return;
        }
        this.TemplateManage.save({opt:"save",name:this.templateName,projectId:this.$routeParams.pid,templateId:this.templateId,snapshotFlag:this.snapshotFlag},{},(res)=>{
            if(Number(res.code)===10000){
                alert("模板已保存！");
                this.initData();
            }else{
                alert("该模版名称已存在，请修改");
                console.log("Error:",res);
            }
            this.initData();
            },(res)=>{
            alert("请求处理异常");
        });
    }

}
