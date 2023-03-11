//Created by uoto on 16/1/27.
import { Route, Controller } from "../../base/annotations";
import "../../base/directives/pageDirective";
var config = require("../../../resource/config.yaml");
import { mdDeleteConfirm } from "../../base/util";
import moment = require('moment');
var os = require('os');
var http = require('http');
var fs = require('fs');
@Route({//绑定路由
    route: '/projectManage',
    templateUrl: 'scripts/views/projectManage/projectManage.html',
    controllerAs: 'T'
})

@Controller
export class ProjectManageCtrl {
    public porjectList: any[] = [];//项目列表
    public userAuthList: any[] = [];//已选成员列表
    public roleUserListRAW: any[] = [];//所有成员列表
    public searchName = "";
    public projectName = "";

    constructor(
        public $scope,
        public $mdDialog,
        public TaskManage,
        public $routeParams,
        public $http,
        public ProjectManage
    ) {
        let _me = this;
        //this.initProjectList();
        this.initUserListRAW();
        $scope.timeShow = true;
        $scope.timeCss = true;
        $scope.initData = function () {
            _me.initData();
        };
    }


    /**
     * 初始化项目列表对象，model数据
     */
    initProjectList() {

        let _me = this;
        this.$scope.flag = false;
        jQuery.ajax({
            //headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            processData: false,
            dataType: "json",
            method: 'get',
            //data: "",
            url: config.api_address + `/api/v1/project/listAll?name=` + this.searchName,
            success: function (response, textStatus) {
                if (Number(response.code) === 10000) {
                    _me.groupList = response.data.data;
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
     * 初始化项目列表对象，model数据
     */
    init() {
        let _me = this;
        this.$scope.flag = false;
        jQuery.ajax({
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            processData: false,
            dataType: "json",
            method: 'get',
            data: '',
            url: config.api_address + `/api/v1/project/listByName/${this.projectName}`,
            success: function (response, textStatus) {
                if (Number(response.code) === 10000) {
                    _me.groupList = response.data.data;
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

    //关闭成员管理字体显示
    downPro(group) {
        group.showUser = false;
    }
    userMovePro(group) {
        group.showUser = true;
    }
    /**
     * 初始化所有的用户列表
     */
    initUserListRAW() {
        let _me = this;
        jQuery.ajax({
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
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
                    if (this.userAuthList[i].creater == false) {
                        this.roleUserListRAW[n].selected = false;

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
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
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
    public userClick(group, e, identify) {
        group.showUser = false;
        /**
         * TODO:点击时改变当前角色ID对应的角色的选中状态，并取消其他的角色的选中状态
         */
        this.$scope.flag = true;
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
    public userSave() {
        let _list = this.captureAuthList();
        jQuery.ajax({
            headers: { 'Content-Type': "application/x-www-form-urlencoded" },
            processData: false,
            method: "post",
            url: config.web_api_host + `/api/v1/project/updateUser/${this.roleIdentify}`,
            data: 'uIdList=' + _list,
            success: function (response) {
                if (Number(response.code) === 10000) {
                    $('#userPro').modal('hide');
                    alert("用户保存已完成！");
                } else {
                    alert(response.msg);
                    console.log("Error:", response);
                }
            }
        });
    }


    /**
     * [addRole description]
     * 取消成员管理   关闭页面
     */
    public closePerson() {
        this.$scope.flag = false;
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


    //项目管理
    initData() {
        this.projectName = this.$routeParams.pName;
        let _me = this;
        this.$http({
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            method: 'get',
            url: config.web_api_host + `/api/v1/project/list/${sessionStorage.getItem("user")}?reload=true&limit=${this.$scope.size}&current=${this.$scope.cp}&keyword=${this.searchName}`
        }).success(function (response) {
            if (Number(response.code) === 10000 && response.data) {
                _me.groupList = response.data.data.data;
                _me.groupList.forEach(item => {
                    item.oldName = item.name;
                });
                if (_me.$scope.totalSize.length < 1) { // 初始化分页按钮
                    //当如果$scope.totalSize.length>0表示页码值已经获取到，不再重新获取。
                    _me.$scope.initPageNumber(response.data.data);
                }
            } else {
                this.groupList = [];
                alert(response.msg);
            }
        });
    }


    //项目管理
    initDatas() {
        this.projectName = this.$routeParams.pName;
        let _me = this;
        this.$http({
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            method: 'get',
            url: config.web_api_host + `/api/v1/project/list/${sessionStorage.getItem("user")}?reload=true&limit=${this.$scope.size}&current=${this.$scope.cp}&keyword=${this.searchName}`
        }).success(function (response) {
            if (Number(response.code) === 10000 && response.data) {
                _me.groupList = response.data.data.data;
                _me.groupList.forEach(item => {
                    item.oldName = item.name;
                });
                if (_me.$scope.totalSize.length < 1) { // 初始化分页按钮
                    //当如果$scope.totalSize.length>0表示页码值已经获取到，不再重新获取。
                    _me.$scope.initPageNumber(response.data.data);
                }
            } else {
                this.groupList = [];
                alert(response.msg);
            }
        });
    }

    groupList = [];
    status = 0;
    // public projectName = "";
    public currentName = "";

    public url = config.web_api_host + "/api/v1/project/update/" + this.$routeParams.pid;
    public title = "添加";
    addProject() {
        this.title = "添加";
        this.url = config.web_api_host + `/api/v1/project/save/${sessionStorage.getItem("user")}`;
    }
    editProject(identify, pName) {
        this.title = "修改";
        this.url = config.web_api_host + "/api/v1/project/update/" + identify;
        this.projectName = pName;
    }

    editProjects(obj, identify) {
        this.$scope.timeShow = false;
        this.$scope.timeCss = false;
        $("#" + obj.id).removeAttr('readonly');
        $("#but1" + obj.id).show();
        $("#but2" + obj.id).show();
    }

    doEdit(project, flag) {
        this.$scope.timeShow = true;
        this.$scope.timeCss = true;
        if (flag) {
            this.save(project);
        } else {
            project.name = project.oldName;
            $("#" + project.id).val(project.oldName);
        }
        $("#" + project.id).attr('readonly', 'readonly');
        $("#but1" + project.id).hide();
        $("#but2" + project.id).hide();
    }

    save(project) {
        project = project || {};
        let userId = sessionStorage.getItem("user");
        this.ProjectManage.save({ opt: "save", userId: userId, name: this.projectName }, { userId: userId, name: this.projectName, id: project.id }, (res) => {
            if (res.code === 10000) {
                alert("项目已保存！");
                window.location.href = "#/projectManage";
            } else {
                console.log("Error:", res);
            }
            this.initData();
        });
    }
    // chaxun(){
    //     let _me = this;
    //     jQuery.ajax({
    //         headers: {'Content-Type': "application/x-www-form-urlencoded"},
    //         processData: false,
    //         method: "get",
    //         url: config.web_api_host + `/api/v1/project/listAll/${this.projectName}`,
    //         // data: 'uIdList=' + _list,
    //         success: function (response) {
    //             if (Number(response.code) === 10000) {
    //                 _me.porjectList = response.data.data;
    //                 _me.$scope.$apply();
    //                     alert(_me.porjectList)
    //
    //             } else {
    //                 alert(response.msg);
    //                 console.log("Error:", response);
    //             }
    //         }
    //     });
    // }


    deleteProject(identify) {
        if (window.confirm("请确认是否要删除")) {
            let _me = this;
            this.$http({
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                method: 'delete',
                url: config.web_api_host + '/api/v1/project/delete/' + identify
            }).success(function (response) {
                if (Number(response.code) === 10000) {
                    _me.initData();
                } else {
                    alert(response.msg);
                }
            });
        } else {
            alert("您已撤回删除操作");
        }
    }
    //点击跳转查看任务
    showTaskList(pId, pName) {
        let _me = this;
        this.$http({
            method: "get",
            url: config.web_api_host + `/api/v1/template/list/${pId}`
        }).success(function (response) {
            if (Number(response.code) === 10000) {
                if (response.data.data.data.length > 0) {
                    window.location.href = `#/assignment?pid=${pId}&name=${pName}`;
                } else {
                    alert("该项目下暂无模版，请创建模板！");
                    window.location.href = `#/projectManage/templateList?pid=${pId}`;
                }
            } else {
                if (Number(response.code) === 10001) {
                    alert("该项目下暂无模版，请创建模板！");
                    window.location.href = `#/projectManage/templateList?pid=${pId}`;
                } else {
                    alert(response.msg);
                    console.log("Error:", response);
                }
            }
        });
    }
    //双击跳转查看任务
    editContent(pId, pName) {
        let _me = this;
        this.$http({
            method: "get",
            url: config.web_api_host + `/api/v1/template/list/${pId}`
        }).success(function (response) {
            if (Number(response.code) === 10000) {
                if (response.data.data.data.length > 0) {
                    window.location.href = `#/assignment?pid=${pId}&name=${pName}`;
                } else {
                    alert("该项目下暂无模版，请创建模板！");
                    window.location.href = `#/projectManage/templateList?pid=${pId}`;
                }
            } else {
                if (Number(response.code) === 10001) {
                    alert("该项目下暂无模版，请创建模板！");
                    window.location.href = `#/projectManage/templateList?pid=${pId}`;
                } else {
                    alert(response.msg);
                    console.log("Error:", response);
                }
            }
        });
    }

    /**
     * 导出任务
     * @param proId
     */
    taskTreeObj: any = {};
    treeNodes: any[] = [];
    taskTreeSetting: any = {};
    proName = "";
    triggerExportTask(proId, proName) {
        this.proName = proName;
        let _me = this;
        this.taskTreeSetting = {
            check:
            {
                autoCheckTrigger: true,
                enable: true,
                chkboxType: {
                    "Y": "ps",
                    "N": "s"
                }
            }
        };
        this.$http({
            method: "get",
            url: config.web_api_host + `/api/v1/task/tree?projectId=${proId}&projectName=${proName}`
        }).success(function (response) {
            if (response) {
                _me.treeNodes = response;
                $('#taskTreeModal').modal('toggle');
                $('#taskTreeModal').modal('show');
                _me.taskTreeObj = $.fn.zTree.init(_me.$scope.element, _me.taskTreeSetting, _me.treeNodes);
            }

            else
                console.log("Error:", "查询任务集异常！！！");

        });

    }
    downFlag: boolean = false;
    exportTask() {
        var _me = this;
        if (_me.downFlag) {
            alert("任务正在导出中,请勿重复操作...");
            return;
        }
        if (this.taskTreeObj.getCheckedNodes().every(item => { return item.type != 2 })) {
            alert("必须有任务才可导出");
            return;
        }
        var data: any[] = this.format(this.taskTreeObj.getCheckedNodes());
        if (data.length == 0) {
            alert("请选择需要导出的任务");
            return;
        }
        _me.downFlag = true;
        var fileDir = os.homedir() + "/Downloads/";
        fs.exists(fileDir, function (exists) {
            if (!exists) {
                fs.mkdir(fileDir, function (err) {
                    if (err) {
                        alert(fileDir + " 文件夹创建失败！");
                        _me.downFlag = false;
                        return;
                    }
                });
            }
        });
        var requestUrl = config.api_address + `/api/v1/task/exportTask`;
        var filename = fileDir + (_me.proName + "_" + moment().format('YYYYMMDDHHmmss')) + '.txt';
        this.$http({
            method: "post",
            url: requestUrl,
            data: { nodeList: data, type: "project" }
        }).success(function (res) {
            if (res) {
                fs.writeFile(filename, res, {}, function (err) {
                    if (err) {
                        alert("文件写入异常,任务导出失败,请检查磁盘空间");
                    }
                    else {
                        alert("任务导出成功，文件保存地址：" + filename);
                        // exec('explorer ' + filename, function(err, stdout, stderr) {} );
                    }
                });
                _me.downFlag = false;
            }
            else {
                _me.downFlag = false;
            }
        }).error(function (err) {
            _me.downFlag = false;
            alert("请求异常！！！");
        });
        this.taskTreeObj = {};
    }
    format(arr) {
        var newarr: any[] = [];
        arr.forEach(item => {
            var obj = {
                id: item.id,
                name: item.name,
                type: item.type
            };
            newarr.push(obj);
        });
        return newarr;
    }

    cancelExport() {
        this.taskTreeObj = {};
    }

    //--------以下是导入逻辑
    proId = "";
    triggerImportTask(proId) {
        this.proId = proId;
    }
    filePath: string = "";
    uploadFlag: boolean = false;
    importTask(reImport) {
        let model = $('input:radio[name="fg"]:checked').val();

        var _me = this;
        var file = document.getElementById("taskFile")["files"][0];
        _me.filePath = file.path;
        if (_me.uploadFlag) {
            alert("任务正在导入中,请勿重复操作...");
            _me.filePath = "";
            $('#taskFile').val("");
            return;
        }
        if ($('#taskFile').val() == "") {
            alert("请选择要导入的任务文件");
            _me.filePath = "";
            $('#taskFile').val("");
            return;
        }
        _me.uploadFlag = true;
        fs.readFile(this.filePath, { encoding: "utf-8" }, function (err, fr) {
            if (err) {
                alert("读取本地文件异常");
                _me.uploadFlag = false;
                _me.filePath = "";
                $('#taskFile').val("");
                console.log("读取本地文件异常：", err);
                return;
            }
            else {
                _me.$http({
                    method: "POST",
                    url: config.web_api_host + `/api/v1/task/importTask?reImport=${reImport}&model=${model}&projectId=&type=project`,
                    data: { content: fr }
                }).success(function (response) {
                    // if (Number(response.code) === 20208)
                    // {
                    // 	$("#import").attr("data-toggle", "modal");
                    // 	$("#import").attr("data-target", "#confirmModal");
                    // 	$("#import").click();
                    // }
                    // else
                    // 	alert(response.msg);
                    alert(response.msg);
                    _me.uploadFlag = false;
                    _me.initData();
                }).error(function (err) {
                    _me.uploadFlag = false;
                    alert("请求异常！！！");
                    console.log("请求异常：" + err);
                });
                _me.filePath = "";
                $('#taskFile').val("");
            }
        });
    }


    cancelImport() {
        this.filePath = "";
        $('#taskFile').val("");
    }
}

