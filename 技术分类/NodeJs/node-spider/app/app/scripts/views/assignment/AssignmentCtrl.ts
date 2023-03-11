//Created by uoto on 16/1/27.
import { Route, Controller } from "../../base/annotations";
import "../../base/directives/pageDirective";
import "../../base/directives/zTreeList";
import "../../base/directives/newZTree";
// import {Executor} from "../../flow/Executor";
import { weixinTaskItem } from "./component/weixinTaskItem/weixinTaskItem";
import { redirectTaskDialog } from "./component/redirectTask/redirectTask";

import moment = require("moment");

var os = require("os");
var http = require("http");
var fs = require("fs");
var exec = require("child_process").exec;
let config = require("../../../resource/config.yaml");

@Route({
  //绑定路由
  route: "/assignment", //任务管理
  templateUrl: "scripts/views/assignment/assignment.html",
  controllerAs: "T"
})
@Controller
export class AssignmentCtrl {
  groupList = [];
  totalNum: Number = 0;
  public projectName;
  uuid = 0
  constructor(
    public $scope,
    public $mdDialog,
    public TaskManage,
    public $routeParams,
    public $filter,
    public $interval,
    public $http
  ) {
    let _me = this;
    $scope.setTitle(name);
    $scope.searchKeyWord = "";
    this.projectName = $routeParams.name;
    $scope.pId = $routeParams.pid || "0";
    $scope.gId = $routeParams.gId || $routeParams.pid || "0";
    if ($scope.pId != "0") {
      // 不是根目录?查询它的详细
      $scope.loadingData = this.initData;
      $scope.groupList = this.groupList;
      //$scope.loadingData($scope, this.$http);
    }
    this.initTemplates();
    this.initTree();
    $scope.initData = function () {
      _me.initData();
    };
    this.initTreeData();
  }

  public templates = [];
  public isRunning;
  public currentTask;
  public newTaskName;
  // public executor = new Executor();

  // 创建任务
  initTemplates() {
    let _me = this;
    this.$http({
      method: "get",
      url: config.api_address + `/api/v1/template/list/${this.$scope.pId}`
    }).success(function (response) {
      if (Number(response.code) === 10000) {
        _me.templates = response.data.data.data;
      } else {
        alert(response.msg);
        console.log("Error:", response);
      }
    });
  }

  setCurrentTask(task) {
    this.currentTask = task;
    this.newTaskName = task.name + '-' + String(this.uuid++)
  }

  copyTask() {
    if (this.currentTask) {
      this.TaskManage.save(
        {
          opt: "copy",
          taskId: this.currentTask.id,
          newTaskName: this.newTaskName
        },
        {},
        res => {
          if (res.code === 10000) {
            this.showAlert("复制成功");
          } else {
            this.showAlert("复制失败");
          }
          $("#copyTaskDialog").modal("hide");
          this.queryList();
        }
      );
    }
  }

  showAlert(content) {
    this.$mdDialog.show(
      this.$mdDialog
        .alert()
        // .parent(angular.element(document.querySelector('#dialogContainer')))
        .clickOutsideToClose(true)
        .title("提示")
        .textContent(content)
        .ariaLabel("Welcome to TutorialsPoint.com")
        .ok("确定")
      // .targetEvent(ev)
    );
  }

  checkTemplates($mdOpenMenu) {
    if (this.templates.length <= 0) {
      alert("请创建模板，即将进入创建模板。");
      location.href = `#/projectManage/templateList?pid=${this.$scope.pId}`;
    } else {
      $mdOpenMenu();
    }
  }

  initData(keyword = "") {
    let _me = this;
    if (_me.$scope.cp) {
      let _url = config.api_address + `/api/v1/task/search/${_me.$scope.pId}`;
      if (_me.$scope.gId) {
        _url =
          config.api_address +
          `/api/v1/task/search/${_me.$scope.pId}/${_me.$scope.gId}`;
      }
      _url +=
        "?reload=true&current=" +
        _me.$scope.cp +
        "&limit=" +
        _me.$scope.size +
        "&keyword=" +
        keyword;
      _me
        .$http({
          method: "get",
          url: _url
        })
        .success(function (response) {
          if (Number(response.code) === 10000 && response.data) {
            _me.$scope.groupList = response.data.data.data;
            _me.$scope.initPageNumber(response.data.data);
            if (!response.data.data.data.length) {
              _me.$scope.changePage(1);
            }
            if (_me.$scope.totalSize.length < 1) {
              // 初始化分页按钮
              //当如果$scope.totalSize.length>0表示页码值已经获取到，不再重新获取。
              _me.$scope.initPageNumber(response.data.data);
            }

          } else {
            this.groupList = [];
            alert(response.msg);
            console.log("Error:", response);
          }


        });
    }
  }

  startTask(task) {
    //得到Task任务
    task.rule = task.taskRule;
    // this.TaskExecutor.addTask(task);
  }

  stopTask() {
    this.isRunning = false;
    // if (this.executor) {
    //     this.executor.stop();
    // }
  }

  exeTask(task) {
    if (window.confirm("请确认是否要加入队列")) {
      this.$http({
        method: "post",
        url: config.ctrl_server + `/exeTask?taskId=${task.id}`
      }).success(function (response) {
        alert("已加入执行队列");
      });
    } else {
    }
  }

  editTask($event, templateId, task) {
    if (!this.$scope.pid) {
      this.$scope.pid = task.pid;
    }
    if (!this.$scope.gId) {
      this.$scope.gId = task.groupId;
    }
    templateId = templateId || task.templateId;
    switch (task.taskType) {
      case "electron.wechat":
        task.steps = task.rule;
        task.steps = [
          {
            steps: [],
            filters: []
          }
        ];
        this.editWeixin($event, false, task);
        break;
      default:
        location.href = `#/task?pid=${this.$scope.pId}&owner=${
          this.$scope.gId
          }&tId=${templateId}&taskId=${task.id || ""}&source=${encodeURIComponent(
            location.hash
          )}`;
        break;
    }
  }
  async rediretTask($event) {
    const tsId = await redirectTaskDialog<string>({
      $mdDialog: this.$mdDialog,
      closeTo: $event
    });
    if (tsId) {
      let _me = this;
      this.$http({
        method: "get",
        url: config.api_address + `/api/v1/task/get/${tsId}`
      }).success(function ({ data }) {
        if (data.data) {
          _me.editTask($event, data.data.templateId, data.data);
        } else {
          alert("该任务不存在，请修改");
        }
      });
    }
  }
  async editWeixin(
    $event,
    create: boolean,
    task: ITaskItem = { taskType: "electron.wechat", isChd: "N" }
  ) {
    let _me = this;
    var _save = "save";
    const taskItem = await weixinTaskItem<ITaskItem>({
      $mdDialog: this.$mdDialog,
      closeTo: $event,
      isCreate: create,
      task: task
    });
    if (taskItem) {
      taskItem.pid = this.$scope.pId;
      taskItem.owner = this.$scope.gId;
      if (typeof taskItem.steps === "object") {
        taskItem.steps = angular.toJson(taskItem.steps);
      }
      var _task = {
        id: "",
        name: taskItem.name,
        taskType: taskItem.taskType,
        priority: taskItem.emergencyLevel,
        rule: taskItem.steps,
        templateId: "WX_" + taskItem.pid,
        projectId: taskItem.pid,
        groupId: taskItem.owner,
        isChd: ""
      };
      if (!create) {
        // _save = 'update';
        _task.id = task.id;
      }

      // var _url = config.api_address + `/api/v1/task/${_save}/${taskItem.pid}`;
      var _url =
        config.api_address + `/api/v1/task/${_save}?projectId=${taskItem.pid}`;
      var initTemplateUrl =
        config.api_address + `/api/v1/template/init/${taskItem.pid}`;
      if (this.$scope.gId != "0") {
        _url = _url + `&groupId=${taskItem.owner}`;
      }

      // if (!create) {
      //     _url = _url + `/${taskItem.id}`;
      // }
      _task.isChd = "N";
      jQuery.ajax({
        headers: { "Content-Type": "application/json" },
        method: "post",
        url: _url,
        processData: false,
        data: JSON.stringify(_task),
        success: function (data, textStatus) {
          _me.initData();
        }
      });

      jQuery.ajax({
        headers: { "Content-Type": "application/json" },
        method: "post",
        url: initTemplateUrl,
        processData: false,
        data: JSON.stringify(_task),
        success: function (data, textStatus) { }
      });
    }
  }

  /**
   * 关键字搜索
   * @param $scope
   * @param searchKeyWord
   */

  public queryList(keyword?, e?) {
    if (e) {
      var keycode = window.event ? e.keyCode : e.which;
      if (keycode == 13) {
        this.initData(keyword);
      }
    } else {
      this.initData(keyword);
    }
  }

  removeTask($event, taskId) {
    let _me = this;
    if (window.confirm("您正在执行删除任务操作，请确认是否执行！")) {
      this.$http({
        method: "delete",
        url: config.api_address + `/api/v1/task/delete/${taskId}`
      }).success(function (response) {
        if (Number(response.code) === 10000) {
          _me.initData();
        } else {
          alert(response.msg);
          console.log("Error:", response);
        }
      });
    }
  }

  back() {
    window.location.href = "#/projectManage";
  }

  initTree() {
    let _me = this;
    this.$scope.setting = {
      view: {
        addHoverDom: addHoverDom,
        removeHoverDom: removeHoverDom,
        selectedMulti: false
      },
      edit: {
        enable: true,
        editNameSelectAll: true,
        showRemoveBtn: showRemoveBtn,
        showRenameBtn: showRenameBtn
      },
      data: {
        simpleData: {
          enable: true
        }
      },
      callback: {
        beforeDrag: beforeDrag,
        beforeEditName: beforeEditName,
        beforeRemove: beforeRemove,
        beforeRename: beforeRename,
        onRemove: onRemove,
        onRename: onRename,
        onClick: onClick
      }
    };
    // var nodes = $scope.$eval(attr.nodes);
    this.$scope.zNodes = []; //要渲染的node节点集合，在initData中被初始化

    //var ztreeObj = $.fn.zTree.init(el, setting, nodes || []);

    let log,
      className = "dark";

    function beforeDrag(treeId, treeNodes) {
      //zTree api中拷贝下来的。
      return false;
    }

    function beforeEditName(treeId, treeNode) {
      //zTree api中拷贝下来的。
      className = className === "dark" ? "" : "dark";
      showLog(
        "[ " +
        getTime() +
        " beforeEditName ]&nbsp;&nbsp;&nbsp;&nbsp; " +
        treeNode.name
      );
      var zTree = $.fn.zTree.getZTreeObj("treeDemo");
      zTree.selectNode(treeNode);
      setTimeout(function () {
        zTree.editName(treeNode);
      }, 0);
      return false;
    }

    function beforeRemove(treeId, treeNode) {
      //zTree api中拷贝下来的。
      className = className === "dark" ? "" : "dark";
      showLog(
        "[ " +
        getTime() +
        " beforeRemove ]&nbsp;&nbsp;&nbsp;&nbsp; " +
        treeNode.name
      );
      let zTree = $.fn.zTree.getZTreeObj("treeDemo");
      zTree.selectNode(treeNode);
      return confirm(
        "删除操作不可恢复，确认删除任务组'" + treeNode.name + "'？"
      );
    }

    function onRemove(e, treeId, treeNode) {
      showLog(
        "[ " +
        getTime() +
        " onRemove ]&nbsp;&nbsp;&nbsp;&nbsp; " +
        treeNode.name
      );
      let _tip = "任务组";
      let _url = config.api_address + "/api/v1/group/delete/" + treeNode.id;
      if (/^project\d+/gi.test(treeNode.id)) {
        //判断删除的是否时项目，如果是，则要改变url。如果不是则执行默认的url
        _tip = "项目";
        _url = config.api_address + "/api/v1/project/delete/" + treeNode.id;
      }
      // if (window.confirm("您正在执行删除整个" + _tip + "操作，请确认！")) {
      _me
        .$http({
          method: "delete",
          url: _url
        })
        .success(function (response) {
          if (Number(response.code) <= 10001) {
            alert(_tip + "删除成功！");
          } else {
            alert(_tip + "删除失败！");
            console.log("ERROR:", response);
          }
          initData();
        });
      // }
      initData();
    }

    function beforeRename(treeId, treeNode, newName, isCancel) {
      className = className === "dark" ? "" : "dark";
      showLog(
        (isCancel ? "<span style='color:red'>" : "") +
        "[ " +
        getTime() +
        " beforeRename ]&nbsp;&nbsp;&nbsp;&nbsp; " +
        treeNode.name +
        (isCancel ? "</span>" : "")
      );
      if (newName.length == 0) {
        setTimeout(function () {
          var zTree = $.fn.zTree.getZTreeObj("treeDemo");
          zTree.cancelEditName();
          alert("任务组名称不能为空.");
        }, 0);
        return false;
      }
      return true;
    }

    /**
     * 重命名时才真正保存（项目|任务组）名称
     */
    function reName(treeNode) {
      let _url = config.api_address + "/api/v1/project/update/" + treeNode.id;
      let _tip = "项目";
      if (Number(treeNode.level) !== 0) {
        _url =
          config.api_address +
          `/api/v1/group/update/${_me.$routeParams.pid}/${treeNode.id}`;
        _tip = "任务组";
      }
      /**
       * 上面的url是应对两种情况，
       * 1、修改项目名称：_url=config.api_address+"/api/v1/project/update/"+treeNode.id;
       * 2、修改任务组名称：_url=config.api_address+`/api/v1/group/update/${$routeParams.pid}/${treeNode.id}`;
       */
      _url += "?name=" + treeNode.name;
      _me
        .$http({
          method: "post",
          url: _url,
          data: { name: treeNode.name }
        })
        .success(function (response) {
          if (Number(response.code) !== 10000) {
            alert(_tip + "名称修改失败！");
          } else {
            if (Number(treeNode.level) === 0) {
              _me.$routeParams.name = treeNode.name; //因为服务器端要求有传送项目ID和项目名称，所以更新后要将新的项目名称传回服务器，然后更新页面
            }
            window.location.href =
              "#/assignment?pid=" +
              _me.$routeParams.pid +
              "&name=" +
              _me.$routeParams.name;
          }
        });
    }

    /**
     * 当treeNode.id不符合数据库要求格式的时候添加到数据库中，
     * 跟数据库格式不一样是因为点击添加按钮时treeNode默认的初始化id。
     * 只是在本地浏览器内存中创建了该节点，数据中并不存在
     * 所以add进数据库中
     */
    function addGroup(treeNode) {
      let _url =
        config.api_address + `/api/v1/group/save/${_me.$routeParams.pid}`;
      if (_me.$routeParams.pid !== treeNode.pId) {
        _url =
          config.api_address +
          `/api/v1/group/save/${_me.$routeParams.pid}/${treeNode.pId}`;
      }
      /**
       * 上面的url是应对两种情况，
       * 1、直接在项目下新建组：_url=config.api_address+`/api/v1/group/save/${$routeParams.pid}`;
       * 2、在任务下面建立子组：_url=config.api_address+`/api/v1/group/save/${$routeParams.pid}/${treeNode.pId}`;
       */
      _url += "?name=" + treeNode.name;
      _me
        .$http({
          method: "post",
          url: _url,
          data: { name: treeNode.name }
        })
        .success(function (response) {
          if (Number(response.code) !== 10000) {
            showLog("添加任务组失败！");
          } else {
            window.location.href =
              "#/assignment?pid=" +
              _me.$routeParams.pid +
              "&name=" +
              _me.$routeParams.name;
          }
        });
    }

    function onRename(e, treeId, treeNode, isCancel) {
      showLog(
        (isCancel ? "<span style='color:red'>" : "") +
        "[ " +
        getTime() +
        " onRename ]&nbsp;&nbsp;&nbsp;&nbsp; " +
        treeNode.name +
        (isCancel ? "</span>" : "")
      );
      // console.log(e,treeId,treeNode);//包含父ID子ID关系重命名成功后在此保存
      if (/^(project)|(group)\d+/gi.test(treeNode.id)) {
        reName(treeNode); //更新（项目|任务组）名称
      } else {
        addGroup(treeNode); //添加任务组
      }
    }

    function showRemoveBtn(treeId, treeNode) {
      return true; //!treeNode.isFirstNode;
    }

    function showRenameBtn(treeId, treeNode) {
      return true; //!treeNode.isLastNode;
    }

    function showLog(str) {
      if (!log) log = $("#log");
      log.append("<li class='" + className + "'>" + str + "</li>");
      if (log.children("li").length > 8) {
        log.get(0).removeChild(log.children("li")[0]);
      }
    }

    function getTime() {
      var now = new Date(),
        h = now.getHours(),
        m = now.getMinutes(),
        s = now.getSeconds(),
        ms = now.getMilliseconds();
      return h + ":" + m + ":" + s + " " + ms;
    }

    var newCount = 1;

    function addHoverDom(treeId, treeNode) {
      var _me = this;
      var sObj = $("#" + treeNode.tId + "_span");
      if (treeNode.editNameFlag || $("#addBtn_" + treeNode.tId).length > 0)
        return;
      var addStr =
        "<span class='button add' id='addBtn_" +
        treeNode.tId +
        "' title='add node' onfocus='this.blur();'></span>";
      sObj.after(addStr);
      var btn = $("#addBtn_" + treeNode.tId);
      if (btn)
        btn.bind("click", function () {
          var zTree = $.fn.zTree.getZTreeObj("treeDemo");
          let id = 100 + newCount;
          //用时间戳命名，防止重名
          var now = new Date().getTime().toString();
          zTree.addNodes(treeNode, {
            id: id,
            pId: treeNode.id,
            name: "新任务组" + now.substr(now.toString().length - 6, 6)
          });
          var _node = zTree.getNodeByParam("id", id, null);
          //保存数据
          addGroup(_node); //添加任务组
          return false;
        });
    }

    function removeHoverDom(treeId, treeNode) {
      $("#addBtn_" + treeNode.tId)
        .unbind()
        .remove();
    }

    function selectAll() {
      var zTree = $.fn.zTree.getZTreeObj("treeDemo");
      zTree.setting.edit.editNameSelectAll = $("#selectAll").attr("checked");
    }

    function onClick(e, treeId, treeNode) {
      _me.$scope.pId = _me.$routeParams.pid;
      _me.$scope.pName = _me.$routeParams.name;
      _me.$scope.gId = treeNode.id;
      //_me.$scope.loadingData(_me.$scope, _me.$http);
      $("#searchBtn").trigger("click");
    }

    let ztreeObj = null;

    // console.log(config.api_address+"/api/v1/group/tree/"+$routeParams.pid);
    function initData() {
      _me
        .$http({
          method: "get",
          url:
            config.api_address +
            "/api/v1/group/tree/" +
            _me.$routeParams.pid +
            "?projectName=" +
            _me.$routeParams.name +
            "&keyword=" +
            _me.filterKey
        })
        .success(function (response) {
          _me.$scope.zNodes = response.data.data;
          var tree = $.fn.zTree.init(
            _me.$scope.el,
            _me.$scope.setting,
            _me.$scope.zNodes || []
          );

          //获取 zTree 的全部节点数据将节点数据转换为简单 Array 格式
          var nodes = tree.transformToArray(tree.getNodes());
          for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].level == 0) {
              //根节点展开
              tree.expandNode(nodes[i], true, true, false);
            } else {
              tree.expandNode(nodes[i], false, true, false);
            }
          }
        });
    }

    initData();
    _me.$scope.$on("$destroy", function () {
      ztreeObj && ztreeObj.destroy();
      ztreeObj = null;
    });
  }

  public filterKey = "";

  /**
   * 查看任务采集回来的数据
   * @param identify 任务ID
   */
  scanData(identify) {
    this.$http({
      method: "GET",
      url:
        config.web_api_host + `/api/v1/task/data/${identify}?current=1&limit=20`
    }).success(function (response) {
      if (Number(response.code) === 10000) {
        console.log(response, "======***=====");
      } else {
        console.log("Error:", response);
      }
    });
  }

  filterTree(event) {
    if (event.keyCode == "13") {
      this.initTree();
    }
  }

  //---------------------------------------------- export taskTree --------------------------------------------//
  taskTreeObj: any = {};
  treeNodes: any[] = [];
  taskTreeSetting: any = {};

  initTreeData() {
    let _me = this;
    this.taskTreeSetting = {
      check: {
        autoCheckTrigger: true,
        enable: true,
        chkboxType: {
          Y: "ps",
          N: "s"
        }
      }
    };
    this.$http({
      method: "get",
      url:
        config.web_api_host +
        `/api/v1/task/tree?projectId=${_me.$scope.pId}&projectName=${
        this.projectName
        }`
    }).success(function (response) {
      if (response) {
        _me.treeNodes = response;
      } else console.log("Error:", "查询任务集异常！！！");
    });
  }

  showTaskTree() {
    var _me = this;
    $(document).ready(function () {
      _me.taskTreeObj = $.fn.zTree.init(
        _me.$scope.element,
        _me.taskTreeSetting,
        _me.treeNodes
      );
    });
  }

  showModGroup(task) {
    //查询
    var _me = this;
    _me.$scope.modTaskGroupId = "";
    var setting = {
      data: {
        key: {
          title: "t"
        },
        simpleData: {
          enable: true
        }
      },
      callback: {
        onClick: function (event, treeId, treeNode, clickFlag) {
          console.log("treeNode=", treeNode);
          _me.$scope.modTaskGroupId = treeNode.id;
        }
      }
    };

    var tree1 = $.fn.zTree.init(
      $("#modGropTree"),
      setting,
      this.$scope.zNodes || []
    );
    this.$scope.modTask = task;
  }
  confirmModTask() {
    var _me = this;
    if (this.$scope.modTaskGroupId) {
      //更新任务的分组
      let _url =
        config.api_address +
        "/api/v1/task/updateGroup/" +
        this.$scope.modTask.id +
        "/" +
        this.$scope.modTaskGroupId;
      _me
        .$http({
          method: "get",
          url: _url
        })
        .success(function (response) {
          if (Number(response.code) !== 10000) {
            alert("分组修改失败！");
          } else {
            //重新查询列表
            _me.queryList();
            alert("分组修改成功！");
            $("#modGroupModal").hide();
          }
        });
    } else {
      alert("请选择分组！");
    }
  }
  cancelModTask() {
    this.$scope.modTask = null;
    this.$scope.modTaskGroupId = null;
  }

  downFlag: boolean = false;

  exportTask() {
    var _me = this;
    if (_me.downFlag) {
      alert("任务正在导出中,请勿重复操作...");
      return;
    }
    if (
      this.taskTreeObj.getCheckedNodes().every(item => {
        return item.type != 2;
      })
    ) {
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
    var filename =
      fileDir +
      (_me.projectName + "_" + moment().format("YYYYMMDDHHmmss")) +
      ".txt";
    this.$http({
      method: "post",
      url: requestUrl,
      data: { nodeList: data, type: "task" }
    })
      .success(function (res) {
        if (res) {
          fs.writeFile(filename, res, {}, function (err) {
            if (err) {
              alert("任务导出失败");
            } else {
              alert("任务导出成功，文件保存地址：" + filename);
              // exec('explorer ' + filename, function(err, stdout, stderr) {} );
            }
          });
          _me.downFlag = false;
        } else {
          _me.downFlag = false;
        }
      })
      .error(function (err) {
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

  //---------------------------------------------- import taskTree --------------------------------------------//
  filePath: string = "";
  uploadFlag: boolean = false;

  importTask(reImport) {
    let model = $('input:radio[name="fg"]:checked').val();

    var _me = this;
    var file = (<any>document.getElementById("taskFile")).files[0];
    _me.filePath = file.path;
    if (_me.uploadFlag) {
      alert("任务正在导入中,请勿重复操作...");
      _me.filePath = "";
      $("#taskFile").val("");
      return;
    }
    if ($("#taskFile").val() == "") {
      alert("请选择要导入的任务文件");
      _me.filePath = "";
      $("#taskFile").val("");
      return;
    }
    _me.uploadFlag = true;
    fs.readFile(this.filePath, { encoding: "utf-8" }, function (err, fr) {
      if (err) {
        alert("读取本地文件异常");
        _me.uploadFlag = false;
        _me.filePath = "";
        $("#taskFile").val("");
        console.log("读取本地文件异常：", err);
        return;
      } else {
        _me
          .$http({
            method: "POST",
            url:
              config.web_api_host +
              `/api/v1/task/importTask?reImport=${reImport}&model=${model}&projectId=${
              _me.$scope.pId
              }&type=task`,
            data: { content: fr }
          })
          .success(function (response) {
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
            _me.initTemplates();
            _me.initTree();
            _me.initTreeData();
          })
          .error(function (err) {
            _me.uploadFlag = false;
            alert("请求异常！！！");
          });
        _me.filePath = "";
        $("#taskFile").val("");
      }
    });
  }

  reImportTask(reImport) {
    var _me = this;
    _me.uploadFlag = true;
    _me
      .$http({
        method: "POST",
        url:
          config.web_api_host + `/api/v1/task/importTask?reImport=${reImport}`,
        data: { content: "" }
      })
      .success(function (response) {
        if (Number(response.code) === 20208) {
          $("#import").attr("data-toggle", "modal");
          $("#import").attr("data-target", "#confirmModal");
          $("#import").click();
        } else alert(response.msg);
        _me.uploadFlag = false;
      })
      .error(function (err) {
        _me.uploadFlag = false;
        alert("请求异常！！！");
      });
  }

  cancelImport() {
    this.filePath = "";
    $("#taskFile").val("");
  }
  async editTaskType(group, taskType) {
    console.log('come into ing', group, this.currentTask)
    this.currentTask = group;
    if (this.currentTask) {
      this.currentTask.taskType = taskType;
      let result = await this.TaskManage.save(
        {
          opt: "save",
          projectId: this.currentTask.projectId,
          groupId: this.currentTask.groupId
        },
        this.currentTask).$promise;
      if (result.code == 10000) {
        this.currentTask.id = result.data.task.id;
        alert("保存成功");
      } else if (result.code == 20107) {
        alert("任务名称已重复，请修改");
      } else {
        alert("系统异常，保存失败");
      }

    }
  }
}
