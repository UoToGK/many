//Created by uoto on 16/1/27.
import {Route, Controller} from "../../base/annotations";
var config = require("../../../resource/config.yaml");

@Route({//绑定路由
    route: '/roleManage',
    templateUrl: 'scripts/views/roleManage/roleManage.html',
    controllerAs: 'T'
})
@Controller
export class RoleManageCtrl {

    public roleList:any[] = [];//角色列表
    public roleAuthList:any[] = [];//已选资源列表
    public roleAuthListRAW:any[] = [];//所有资源

    constructor(public $scope,
                public $mdDialog,
                public TaskManage,
                public $routeParams,
                public $http
    ) {
        this.initRoleList();
        this.initRoleAuthListRAW();
    }

    /**
     * 初始化角色列表对象，model数据
     */
    initRoleList(){
        let _me=this;
        jQuery.ajax({
            headers:{'Content-Type': 'application/x-www-form-urlencoded'},
            processData:false,
            dataType:"json",
            method: 'post',
            data:'id=',
            url: config.api_address+'/api/v1/role/selectRoles',
            success:function(response,textStatus){
                if(Number(response.code)===10000) {
                    _me.roleList = response.data.data;
                    /**
                     * TODO:给每个角色添加一个是否选中状态。目的：区分哪个用户被选中。点击时改变选中状态，并取消其他的角色的选中状态
                     */
                    for(let i=0;i<_me.roleList.length;i++){
                        _me.roleList[i].selected=false;
                    }
                    _me.$scope.$apply();
                }else{
                    console.log("ERROR",response);
                }
            }
        });
    }

    /**
     * 初始化所有菜单项资源列表
     */
    initRoleAuthListRAW(){
        let _me=this;
        jQuery.ajax({
            headers:{'Content-Type': 'application/x-www-form-urlencoded'},
            processData:false,
            dataType:"json",
            method: 'post',
            data:'id=',
            url: config.api_address+'/api/v1/authority/selectAllAuthoritys',
            success:function(response,textStatus){
                if(Number(response.code)===10000) {
                    _me.roleAuthListRAW = response.data.data;
                    /**
                     * TODO:给每一项添加一个是否选中状态。目的：绑定到复选框上，方便操作。
                     */
                    for(let i=0;i<_me.roleAuthListRAW.length;i++){
                        _me.roleAuthListRAW[i].selected=false;
                    }
                    _me.$scope.$apply();
                }else{
                    console.log("ERROR",response);
                }
            }
        });
    }

    /**
     * 当选择某个角色时，查询完该角色所拥有的权限，并勾选该选项
     */
    selectItem(){
        for(let n=0;n<this.roleAuthListRAW.length;n++){
            this.roleAuthListRAW[n].selected=false;
            for (let i = 0; i < this.roleAuthList.length; i++) {
                if (this.roleAuthList[i].resource === this.roleAuthListRAW[n].resource) {
                    this.roleAuthListRAW[n].selected = true;
                    break;
                }
            }
        }
        this.$scope.$apply();
    }

    /**
     * 当选择某个特定角色时查询当前角色所拥有的菜单权限列表
     * @param roleId
     */
    public queryNotRes(roleId){
        let _me=this;
        jQuery.ajax({
            headers:{'Content-Type': 'application/x-www-form-urlencoded'},
            processData:false,
            method: 'post',
            data:`roleId=${roleId}&flag=false`,
            url: config.api_address+'/api/v1/authority/selectAuthority',
            success:function(response,textStatus){
                if(Number(response.code)===10000){
                    _me.roleAuthList = response.data.data;
                    // TODO:查询到的列表与所有资源列表进行对比如果相同则将所有资源列表中的项目设置的selected属性设置为true；
                    _me.selectItem();
                }else{
                    alert(response.msg);
                    console.log("ERROR:",response);
                }
            }
        });
    }

    /**
     * 点击角色时响应该事件
     * @param e 事件对象
     * @param identify：角色ID
     */
    public roleClick(e,identify){
        /**
         * TODO:点击时改变当前角色ID对应的角色的选中状态，并取消其他的角色的选中状态
         */
        for(let i=0;i<this.roleList.length;i++){
            if(this.roleList[i]["id"]!==identify){
                this.roleList[i]["selected"]=false;
            }else{
                this.roleList[i]["selected"]=true;
            }
        }
        this.queryNotRes(identify);
        //以下部分是记录用户点击的是具体哪一个角色ID与角色名称
        this.roleIdentify=identify;
        for(let i=0;i<this.roleList.length;i++){
            if(this.roleList[i].selected){
                this.roleName=this.roleList[i].name;
                break;
            }
        }
    }

    /**
     * 获取选中的角色ID，当映射角色与权限列表关系时，使用。
     * @returns {Array}
     */
    captureAuthList(){
        let _list=[];
        for(let i=0;i<this.roleAuthListRAW.length;i++){
            if(this.roleAuthListRAW[i].selected){
                _list.push(this.roleAuthListRAW[i].id);
            }
        }
        return _list;
    }

    public roleName;
    /**
     * 保存角色分配权限的结果
     */
    public save(){
        let _list=this.captureAuthList();
        console.log(_list)
        jQuery.ajax({
            headers:{'Content-Type':"application/json"},
            processData:false,
            method:"post",
            url:config.web_api_host+`/api/v1/role/update/${this.roleIdentify}`,
            data:JSON.stringify({
                authList:this.captureAuthList()
            }),
            success:function(response){
                if(Number(response.code)===10000){
                    alert("权限保存已完成！");
                }else{
                    alert(response.msg);
                    console.log("Error:",response);
                }
            }
        });
    }

    /**
     * 添加用户角色
     */
    public addRole(){
        let _me=this;
        jQuery.ajax({
            headers:{'Content-Type':'application/json'},
            processData:false,
            method:"post",
            url:config.web_api_host+`/api/v1/role/save`,
            data:JSON.stringify({
                name:this.roleName
            }),
            success:function(response){
                if(Number(response.code)===10000){
                    alert("角色添加完成");
                    // TODO:更新界面数据
                    _me.initRoleList();
                }else{
                    alert(response.msg);
                    console.log("Error:",response);
                }
            }
        });
    }

    public roleIdentify=null;

    public cancelSelected(){
        for(let i=0;i<this.roleList.length;i++){
            if(this.roleList[i].selected){
                this.roleList[i].selected=false;
            }
        }
    }

    /**
     * 修改用户角色名称
     */
    public updateRole(){
        let _me=this;
        if(this.roleIdentify) {
            jQuery.ajax({
                headers:{"Content-Type":"application/json"},
                processData:false,
                method: "post",
                url: config.web_api_host + `/api/v1/role/update/${this.roleIdentify}`,
                data: JSON.stringify({
                    name:this.roleName
                }),
                success:function (response) {
                    if (Number(response.code) === 10000) {
                        alert("角色修改完成");
                        // TODO:更新界面数据
                        _me.initRoleList();
                    } else {
                        alert(response.msg);
                        console.log("Error:", response);
                    }
                    _me.roleIdentify = null;
                    _me.cancelSelected();
                }
            });
        }
    }

    /**
     * 删除用户角色
     */
    public deleteRole(){
        if(window.confirm("您正在执行删除用户角色，请确认是否继续执行？")) {
            let _me=this;
            this.$http({
                method: "post",
                url: config.web_api_host + `/api/v1/role/delete/${this.roleIdentify}`,
                data: {}
            }).success(function (response) {
                if (Number(response.code) === 10000) {
                    alert("用户资源修改完成");
                    // TODO:更新界面数据
                    _me.initRoleList();
                } else {
                    alert(response.msg);
                    console.log("Error:", response);
                }
                _me.roleIdentify=null;
                _me.cancelSelected();
            });
        }
    }

    /**
     * 添加用户角色资源
     */
    public addJurisdiction(){
        this.$http({
            method:"post",
            url:config.web_api_host+`/api/v1/role/save`,
            data:{

            }
        }).success(function(response){
            if(Number(response.code)===10000){
                alert("用户资源添加完成");
                // TODO:更新界面数据
            }else{
                alert(response.msg);
                console.log("Error:",response);
            }
        });
    }

    /**
     * 修改用户角色资源
     */
    public editJurisdiction(){
        this.$http({
            method:"post",
            url:config.web_api_host+`/api/v1/role/save`,
            data:{

            }
        }).success(function(response){
            if(Number(response.code)===10000){
                alert("用户资源修改完成");
                // TODO:更新界面数据
            }else{
                alert(response.msg);
                console.log("Error:",response);
            }
        });
    }

    /**
     * 删除用户角色资源
     */
    public deleteJurisdiction(){
        if(window.confirm("您正在执行删除用户角色资源，请确认是否继续执行？")) {
            this.$http({
                method: "post",
                url: config.web_api_host + `/api/v1/role/save`,
                data: {}
            }).success(function (response) {
                if (Number(response.code) === 10000) {
                    alert("用户资源修改完成");
                    // TODO:更新界面数据
                } else {
                    alert(response.msg);
                    console.log("Error:", response);
                }
            });
        }
    }
}
