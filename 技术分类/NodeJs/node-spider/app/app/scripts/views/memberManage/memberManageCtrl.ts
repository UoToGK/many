//Created by uoto on 16/1/27.
import {Route, Controller} from "../../base/annotations";
import {mdDeleteConfirm} from "../../base/util";
var config = require("../../../resource/config.yaml");
import moment = require('moment');

@Route({//绑定路由
    route: '/memberManage', // 舆情管理
    templateUrl: 'scripts/views/memberManage/memberManage.html',
    controllerAs: 'T'
})
@Controller

export class MemberManageCtrl {

    public porjectList: any[] = [];//项目列表
    public userAuthList: any[] = [];//已选成员列表
    public roleUserListRAW: any[] = [];//所有成员列表

    constructor(public $scope,
                public $mdDialog,
                public TaskManage,
                public $routeParams,
                public $http) {
        this.initProjectList();
        this.initUserListRAW();
    }

    /**
     * 初始化项目列表对象，model数据
     */
    initProjectList() {
        let _me = this;
        jQuery.ajax({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            processData: false,
            dataType: "json",
            method: 'get',
            data: '',
            url: config.api_address + '/api/v1/project/listAll',
            success: function (response, textStatus) {
                if (Number(response.code) === 10000) {
                    _me.porjectList = response.data.data;
                    /**
                     * TODO:给每个角色添加一个是否选中状态。目的：区分哪个用户被选中。点击时改变选中状态，并取消其他的角色的选中状态
                     */
                    for (let i = 0; i < _me.porjectList.length; i++) {
                        _me.porjectList[i].selected = false;
                    }
                    _me.$scope.$apply();
                } else {
                    console.log("ERROR", response);
                }
            }
        });
    }

    /**
     * 初始化所有的用户列表
     */
    initUserListRAW() {
        let _me = this;
        jQuery.ajax({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            processData: false,
            dataType: "json",
            method: 'get',
            data: '',
            url: config.api_address + '/api/v1/user/list',
            success: function (response, textStatus) {
                if (Number(response.code) === 10000) {
                    _me.roleUserListRAW = response.data.data.data;
                    /**
                     * TODO:给每一项添加一个是否选中状态。目的：绑定到复选框上，方便操作。
                     */
                    for (let i = 0; i < _me.roleUserListRAW.length; i++) {
                        _me.roleUserListRAW[i].selected = false;
                    }
                    _me.$scope.$apply();
                } else {
                    console.log("ERROR", response);
                }
            }
        });
    }

    /**
     * 当选择某个角色时，查询完该角色所拥有的权限，并勾选该选项
     */


    selectItem() {
        //userAuthList :查询出来的多个人
        //roleUserListRAW：所有人
        for (let n = 0; n < this.roleUserListRAW.length; n++) {
            this.roleUserListRAW[n].selected = false;
            for (let i = 0; i < this.userAuthList.length; i++) {
                if (this.userAuthList[i].uid === this.roleUserListRAW[n].uid) {
                    this.roleUserListRAW[n].selected = true;
                    if (this.userAuthList[i].creater == true) {
                        //alert("该用户creater为true")

                        //不可以删除
                        //加一个变量   true false  控制按钮是否删除
                    }
                    break;
                }
            }
        }
        this.$scope.$apply();
    }

    /**
     * 当选择某个特定角色时查询当前角色所拥有的菜单权限列表
     * @param userId
     */
    public queryNotRes(userId) {
        let _me = this;
        jQuery.ajax({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            processData: false,
            method: 'get',
            dataType: "json",
            data: ``,
            url: config.api_address + `/api/v1/project/listUser/${userId} `,
            success: function (response, textStatus) {
                if (Number(response.code) === 10000) {
                    _me.userAuthList = response.data.data;
                    // TODO:查询到的列表与所有资源列表进行对比如果相同则将所有资源列表中的项目设置的selected属性设置为true；
                    _me.selectItem();
                } else {
                    alert(response.msg);
                    console.log("ERROR:", response);
                }
            }
        });
    }

    /**
     * 点击角色时响应该事件
     * @param e 事件对象
     * @param identify：角色ID
     */
    public userClick(e, identify) {
        /**
         * TODO:点击时改变当前角色ID对应的角色的选中状态，并取消其他的角色的选中状态
         */
        for (let i = 0; i < this.porjectList.length; i++) {
            if (this.porjectList[i]["id"] !== identify) {
                this.porjectList[i]["selected"] = false;
            } else {
                this.porjectList[i]["selected"] = true;
            }
        }
        this.queryNotRes(identify);
        //以下部分是记录用户点击的是具体哪一个角色ID与角色名称
        this.roleIdentify = identify;
        for (let i = 0; i < this.porjectList.length; i++) {
            if (this.porjectList[i].selected) {
                this.roleName = this.porjectList[i].name;
                break;
            }
        }
    }

    /**
     * 获取选中的角色ID，当映射角色与权限列表关系时，使用。
     * @returns {Array}
     */
    captureAuthList() {
        let uIdList = [];
        for (let i = 0; i < this.roleUserListRAW.length; i++) {
            if (this.roleUserListRAW[i].selected) {
                uIdList.push(this.roleUserListRAW[i].uid);
            }
        }
        return uIdList;
    }

    public roleName;

    /**
     * 保存角色分配权限的结果
     */
    public save() {
        let _list = this.captureAuthList();
        jQuery.ajax({
            headers: {'Content-Type': "application/x-www-form-urlencoded"},
            processData: false,
            method: "post",
            url: config.web_api_host + `/api/v1/project/updateUser/${this.roleIdentify}`,
            data: 'uIdList=' + _list,
            success: function (response) {
                if (Number(response.code) === 10000) {
                    alert("用户保存已完成！");
                } else {
                    alert(response.msg);
                    console.log("Error:", response);
                }
            }
        });
    }

    /**
     * 添加用户角色
     */
    /*  public addRole() {
     let _me = this;
     jQuery.ajax({
     headers: {'Content-Type': 'application/json'},
     processData: false,
     method: "post",
     url: config.web_api_host + `/api/v1/role/save`,
     data: JSON.stringify({
     name: this.roleName
     }),
     success: function (response) {
     if (Number(response.code) === 10000) {
     alert("角色添加完成");
     // TODO:更新界面数据
     _me.initProjectList();
     } else {
     alert(response.msg);
     console.log("Error:", response);
     }
     }
     });
     }*/

    public roleIdentify = null;

    public cancelSelected() {
        for (let i = 0; i < this.porjectList.length; i++) {
            if (this.porjectList[i].selected) {
                this.porjectList[i].selected = false;
            }
        }
    }
}

