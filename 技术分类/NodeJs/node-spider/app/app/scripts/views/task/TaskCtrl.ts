//Created by uoto on 16/1/27.

import { Controller, Route } from "../../base/annotations";
import "../../flow/directives/DesignerMainDirective";
import { Executor } from "../../flow/Executor";
import { BEHAVIOR } from "../../flow/properties";
import { getTaskName } from "./component/taskName/dialog";
// let config = require("../../../resource/config.yaml");

@Route({
  route: "/task", // 编辑任务
  templateUrl: `${__dirname}/task.html`,
  controllerAs: "T"
})
@Controller
export class TaskCtrl {
  public steps: IStepOption[] = [];
  public BEHAVIOR = BEHAVIOR;
  public task: ITaskItem;
  public pid = "";
  public taskId = "";
  public owner = "";
  public isNew;
  public templateId;
  public COLUMNS = []; //给下面的测试运行使用的
  public setting: any = {};

  constructor(
    public $scope,
    public $routeParams,
    public TaskManage,
    public TemplateColumnManage,
    public $mdDialog,
    public $http
  ) {
    this.pid = $routeParams.pid || "";
    this.owner = $routeParams.owner || "";
    this.taskId = $routeParams.taskId;
    this.templateId = $routeParams.tId;

    if ($routeParams.taskId) {
      // 如果是编辑模式，查询任务的详细信息
      this.taskId = $routeParams.taskId;
      TaskManage.get({ opt: "get", taskId: $routeParams.taskId }, res => {
        if (res.code == 10000) {
          this.task = res.data.data;
          this.templateId = this.task.templateId;
          this.initColumns(this.templateId);
          this.setOption(this.task.rule);
        } else {
          console.error(this.taskId + " 查询失败", res);
        }
        $scope.setTitle(`编辑任务 (${this.task.name || ""})`);
        this.initSetting();
      });
    } else {
      // 是新增任务模式，则创建简单任务信息即可
      let url: string;
      if ($routeParams.create && $routeParams.url) {
        url = decodeURIComponent($routeParams.url);
      }
      this.task = {
        // taskType: "electron.dynamic",// 改为可以自定义的
        templateId: this.templateId
      };
      this.isNew = true;
      this.setDefaultOption(url);
      $scope.setTitle("新建任务");
      this.initColumns(this.templateId);
      this.initSetting();
    }
  }

  public initSetting() {
    this.setting.templateId = this.templateId;
    this.setting.taskId = this.taskId;
    this.setting.currentTask = this.task;
  }

  public initColumns(tid) {
    this.TemplateColumnManage.get({ opt: "list", templateId: tid }, res => {
      if (res.code === 10000) {
        this.COLUMNS = res.data.data; //获取模板列的名称
      } else {
        console.log("Error:", res);
      }
    });
  }

  // 查询任务的 步骤信息
  setOption(rule) {
    try {
      this.steps = JSON.parse(rule);
      // this.steps[0].autoActive = true;
    } catch (e) {
      this.steps = [];
      console.error("setOption", e);
    }
  }

  // 设置任务的默认步骤
  setDefaultOption(url = "http://www.baidu.com") {
    this.steps = [
      {
        behavior: "openLink",
        name: "打开链接",
        autoActive: true,
        url
      }
    ];
  }
  //
  // findColumns(pjson, fkey) {
  //     var values = [];
  //     if (pjson.constructor === Array) {
  //         for (var i = 0, l = pjson.length; i < l; i++) {
  //             values = values.concat(this.findColumns(pjson[i], fkey));
  //         }
  //     } else {
  //         if (!(typeof pjson === 'string')) {
  //             for (var key in pjson) {
  //                 if (pjson[key].constructor === Array) {
  //                     values = values.concat(this.findColumns(pjson[key], fkey));
  //                 } else {
  //                     if (key == fkey) {
  //                         values.push(pjson)
  //                     }
  //                     //alert(key+':'+pjson[key]);
  //                 }
  //             }
  //         }
  //
  //     }
  //     return values;
  // }
  //
  // saveTask() {
  //     let _columns = [];
  //     try {
  //
  //         let _template = JSON.stringify(this.task);
  //         let rule = JSON.parse(this.task.rule);
  //         let columns = this.findColumns(rule, "columnName");
  //         // let _temp = _template.match(/(\\"columnname\\":\\"(column\d+)+\\")|(\\"unique\\":((false)|(true)))/gim);
  //         // if (_temp) {
  //         //     for (let i = 0, n = 0; i < _temp.length; i += 2) {
  //         //         if (/true/gi.test(_temp[i])) {
  //         //             this.task.uniqueColumnName = _temp[i + 1].match(/column\d+/gi)[0];//寻找到唯一键，后台需要，传到后台即可
  //         //         }
  //         //         if (_temp[i + 1].match(/column\d+/gi)[1]) {
  //         //             _columns[n++] = _temp[i + 1].match(/column\d+/gi)[1];//找出所有列的ID后台需要
  //         //         }
  //         //         this.task.rule = this.task.rule.replace(/(column\d+){2}/i, _temp[i + 1].match(/column\d+/gi)[0]);//将columnName对应的值改为：COLUMN\d+格式
  //         //     }
  //         // }
  //         for (let ii = 0; ii < columns.length; ii++) {
  //             let columnName = columns[ii].columnName
  //             let nval0 = columns[ii].columnName.match(/column\d+/gi)[0];//字段名
  //             let nval1 = columns[ii].columnName.match(/column\d+/gi)[1];//字段ID
  //             this.task.rule = this.task.rule.replace(columns[ii].columnName, nval0);//将columnName对应的值改为：COLUMN\d+格式
  //             _columns[ii] = nval1;
  //         }
  //         let _url = config.api_address + "/api/v1/task/save/" + this.$routeParams.pid;
  //         if (!this.$routeParams.taskId) {
  //             if (/^group\d+/gi.test(this.$routeParams.owner)) {
  //                 _url = config.api_address + `/api/v1/task/save/${this.$routeParams.pid}/${this.$routeParams.owner}`
  //             }
  //         } else {
  //             if (/^group\d+/gi.test(this.$routeParams.owner)) {
  //                 _url = config.web_api_host + `/api/v1/task/update/${this.$routeParams.pid}/${this.$routeParams.owner}/${this.$routeParams.taskId}`;
  //             } else {
  //                 _url = config.web_api_host + `/api/v1/task/update/${this.$routeParams.pid}/${this.$routeParams.taskId}`;
  //             }
  //         }
  //         jQuery.ajax({
  //             headers: {'Content-Type': 'application/json'},
  //             method: 'post',
  //             url: _url,
  //             processData: false,
  //             data: JSON.stringify({
  //                 task: this.task,
  //                 columnIds: _columns
  //             }),
  //             success: function (data, textStatus) {
  //                 if (data.code === 10000) {
  //                     alert("保存成功");
  //                 } else {
  //                     console.log("Error:", data);
  //                 }
  //             }
  //         })
  //     } catch (e) {
  //         console.log(e, e);
  //         alert('保存失败');
  //     }
  // }

  // 保存任务
  async save() {
    let [
      isCancel,
      name,
      emergencyLevel,
      isSupportProxy,
      customTaskType
    ] = await getTaskName({
      // 设置任务名称
      $mdDialog: this.$mdDialog,
      task: this.task
    });
    if (!(isCancel == "N")) {
      return "";
    }
    if (!name) {
      // 如果没有设置,则取消保存任务
      alert("请输入任务名称");
      return;
    }

    // 设置 pid、所属者、步骤
    if (this.pid) {
      this.task.projectId = this.pid;
    }

    if (this.owner && this.owner != "0" && this.task.id == undefined) {
      this.task.groupId = this.owner;
    }

    // this.task.templateId = this.$routeParams.tId;//给任务增加模板关联信息
    this.task.name = name;
    this.task.taskType = customTaskType;
    this.task.priority = emergencyLevel; // 优先级
    this.task.isSupportProxy = isSupportProxy;
    this.task.rule = angular.toJson(this.steps); // 步骤
    this.task.isChd = "N";
    console.warn(this.task);

    // this.task.groupId=this.owner;//TODO:此值暂时清空，后续分组功能可以改好后开启。解决groupId默认被设置为0影响计划内的任务查询
    //this.task.status = 1;// 0 = 编辑中,1 = 待分配
    //this.saveTask();
    try {
      const result = await this.TaskManage.save(
        {
          opt: "save",
          projectId: this.task.projectId,
          groupId: this.task.groupId
        },
        this.task
      ).$promise;
      if (result.code == 10000) {
        this.task.id = result.data.task.id;
        alert("保存成功");
      } else if (result.code == 20107) {
        alert("任务名称已重复，请修改");
      } else {
        alert("系统异常，保存失败");
      }
    } catch (e) {
      alert("保存失败");
    }
  }

  public executor: Executor | any;
  public isRunning: boolean;

  // 测试执行
  public async testRun() {
    console.debug(`测试执行开始执行`)
    this.tryRemove();
    this.isRunning = true;
    this.executor = new Executor(); // 任务步骤执行器
    this.executor.demo = true;
    this.executor.steps = this.steps;
    this.executor._COLUMNS = this.COLUMNS;
    this.executor.taskColumns = this.COLUMNS;
    this._size = 0;

    this.executor.on("capture", data => (this._size += 1));

    await this.executor.run();

    this.isRunning = false;
    console.debug(`测试执行结束`)
  }

  // 停止运行
  public stopRun() {
    this.isRunning = false;
    if (this.executor) {
      this.executor.stop();
    }
  }

  // 移除测试dom
  public remove() {
    this.tryRemove();
  }

  private _size;
  // 移除测试dom
  private tryRemove() {
    this.isRunning = false;
    if (this.executor) {
      this.executor.remove();
      this.executor = null;
    }
  }

  // 退出编辑器
  public exit() {
    this.tryRemove();
    let hash = decodeURIComponent(this.$routeParams.source);
    let w = hash.indexOf("?") > -1;
    if (!this.isNew) {
      if (hash.indexOf("&goto") > -1) {
        hash = hash.replace(/goto.*/, "goto=" + this.$routeParams.taskId);
      } else {
        hash += `${w ? "&" : "?"}goto=${this.$routeParams.taskId}`;
      }
    }
    location.hash = hash;
  }
}
