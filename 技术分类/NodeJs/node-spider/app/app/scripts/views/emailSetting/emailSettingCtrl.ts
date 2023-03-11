/// <reference path="../../base/directives/paging/PagingOption.d.ts">
import {Route, Controller} from "../../base/annotations";
var config = require("../../../resource/config.yaml");
@Route({//绑定路由
    route: '/emailSetting', // 通知设置
    templateUrl: 'scripts/views/emailSetting/emailSetting.html',
    controllerAs: 'T'
})
@Controller
export class EmailSettingCtrl {

    constructor(public $scope,
                public $http,
                public emailSettingServer) {
        this.paging.params = {
            orderBy: "create_time",
            order: "desc"
        };
        this.getUserList();
        this.querySysSetting();
        this.paging.resource = emailSettingServer;


    }

    paging: PagingOption<any> = {};

    typeList = [
        {key:"1",value:'项目监控'},
        {key:"2",value:'计划批次监控'},
        {key:"3",value:'每日预警'}]
    projectList =[];
    userList = [];
    item = {category:'0'};


    getProjectList(){
        this.$http({
            method: "GET",
            url: config.api_address + `/api/v1/project/getProjectList`
        }).success(({data}) => {
            this.projectList = data.projectList
        })
    }
    getUserList(){
        this.$http({
            method: "GET",
            url: config.api_address + `/api/v1/user/getUserList`
        }).success(({data}) => {
            this.userList = data.data
        })
    }

    addEmailSetting(item){
        let userIds = this.captureAuthList();
        this.$http({
            method: "POST",
            url: config.api_address + '/emailSetting/saveEmailSetting',
            data:JSON.stringify({
                emailSetting: item,
                uesrIds : userIds
            })
        }).success((result) => {
            if(result.code === 10000){
                alert("保存成功");
                $('#addUser').modal('hide')
                this.paging.reload(true);
            }
        })
    }
    updateEmailSetting(id){
        let _me=this;
        this.$http({
            method:"get",
            url:config.web_api_host+`/emailSetting/getById/${id}`
        }).success(function(response){
            if(Number(response.code)===10000){
                _me.selectItem(response.data.userIds);
                _me.item = response.data.emailSetting;

            }else{
                alert(response.msg);
                console.log("Error:",response);
            }
        });
    }
    selectItem(usreIds) {
        if(usreIds!=undefined){
            this.userList.forEach(item=>{
                item.selected = false;
            })
            let ids = [];
            usreIds.forEach(item=>{
                ids.push(item.userId);
            })

            for (let n = 0; n < this.userList.length; n++) {
                if (ids.indexOf(this.userList[n].uid)!=-1) {
                    this.userList[n].selected = true;
                }
            }
        }

    }

    captureAuthList() {
        let uIdList = [];
        for (let i = 0; i < this.userList.length; i++) {
            if (this.userList[i].selected) {
                uIdList.push(this.userList[i].uid);
            }
        }
        return uIdList;
    }

    deleteEmailSetting(id){
        if(window.confirm("您正在执行删除邮件通知，请确认是否继续执行？")) {
            let _me=this;
            this.$http({
                method: "get",
                url: config.web_api_host + `/emailSetting/delete/${id}`
            }).success(function (response) {
                alert("删除成功");
                _me.paging.reload(true);
            });
        }
    }




    saveSysSetting(){
        let userIds = this.captureAuthList();
        this.$http({
            method: "POST",
            url: config.api_address + '/emailSetting/saveSysSetting',
            data:userIds
        }).success((result) => {
            if(result.code === 10000){
                alert("保存成功");
            }
        })
    }

    querySysSetting(){
        this.$http({
            method: "GET",
            url: config.api_address + '/emailSetting/querySysSetting'
        }).success((result) => {
            if(result.code === 10000){
                this.selectItem(result.data.userIds);
            }
        })
    }

    saveProjectSetting(data){
        this.$http({
            method: "POST",
            url: config.api_address + '/emailSetting/saveProjectSetting',
            data:data
        }).success((result) => {
            if(result.code === 10000){
                alert("保存成功");
            }
        })
    }

    tabs=[{title:'项目类',type:'4'},{title:'系统类',type:'5'}]
}

