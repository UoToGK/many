
import app from "./base/app";
import { Executor } from "./flow/Executor";
import { Socket } from "./socket";
import { delay } from "./base/util";
import { spawn } from "child_process";
import props from "./flow/properties";
import { WeixinPub } from "./wechat/wechat";
var collectorInfo = require("../resource/collector.yaml");
var config = require("../resource/config.yaml");
import _ = require("lodash");
import { writeLog2File } from "./base/logger";
const moment = require('moment')
const { CAPTURE_MARK } = props;


function ping(host) {
  return new Promise(function (resolve, reject) {
    let childProcess = spawn("ping", [host]);
    childProcess.stdout.on("data", function (data) {
      childProcess.kill();
      console.info(data.toString());
      resolve();
    });
    childProcess.stderr.on("data", function (data) {
      reject(data.toString());
      childProcess.kill();
    });
  });
}

//接收任务的recive socket
app.factory("socket", function (SysVar) {
  if (config["clientMode"] == 2 && SysVar.ip) {
    return new Socket(config["socketServer"] + "/collector");
  }
  return false;
});
//发送数据的send socket,由于发送和接收数据时会存在冲突，特将ws连接分为两个
app.factory("sendSocket", function (SysVar) {
  if (config["clientMode"] == 2 && SysVar.ip) {
    return new Socket(config["socketServer"] + "/collector");
  }
  return false;
});

let socket: Socket;
let sendSocket: Socket;

class TaskExecutor {
  public taskList = []; // 任务队列
  static runList = []; // 正在执行的任务队列
  static isAutoPaging: any = false;
  runList = TaskExecutor.runList;
  constructor(
    public SysVar,
    public $rootScope,
    public socket,
    public sendSocket,
    public CollectorProxyService
  ) {
    socket && this.initSocket();
    sendSocket && this.initSendSocket();
    this.monitorTaskIds();
  }

  // 链接socket
  initSendSocket() {
    sendSocket = this.sendSocket;
    let _SysVar = this.SysVar;

    sendSocket.on("open", async () => {
      try {
        await ping("baidu.com");
        writeLog2File(`[send socket] connected`);
      } catch (e) {
        console.debug("Error:", String(e.stack || e));
      }
    });
    sendSocket.on("error", function (event, msg) {
      writeLog2File(`[send socket] Error message`, "", msg);
    });
    sendSocket.on("close", function (e) {
      writeLog2File(`[send socket] disconnected`, "", e);
    });
    // 接收任务
    sendSocket.on("EVENT_TASK", (event, task) => {
      writeLog2File("EVENT_HEART_BEAT 触发", "", task.name);
    });
    //2.0是采集端向服务端发心跳，现在是服务端-》采集端
    setInterval(function () {
      sendSocket.emit("EVENT_HEART_BEAT");
      writeLog2File("EVENT_HEART_BEAT 触发");
    }, 2 * 60 * 1000);
  }

  // 链接socket
  initSocket() {
    socket = this.socket;
    let _SysVar = this.SysVar;
    socket.on("open", async () => {
      try {
        await ping("baidu.com");
        writeLog2File("[socket] connected");
        _SysVar.method = "online";
        socket.send(_SysVar);
      } catch (e) {
        writeLog2File(`[socket] Error:`, "", String(e.stack || e));
      }
    });
    socket.on("error", function (event, msg) {
      writeLog2File(`[socket] Error message:`, "", msg);
    });
    socket.on("close", function (e) {
      writeLog2File(`[socket] disconnected:`, "", e);
    });
    // 接收任务
    socket.on("EVENT_TASK", (event, task) => {
      console.debug("[socket] new task", task);
      //发送任务已接收的确认请求
      this.sendTaskReceiveConfirmInfo(task);
      if (task.rule.toString().includes('autoPaging')) {
        TaskExecutor.isAutoPaging = 10 * 60 * 1000;//重置超时时间
      }
      if (!this.getTask(task.taskId)) {
        task = _.cloneDeep(task);
        console.debug(task)
        writeLog2File(`抢到任务:${task.name}`);

        this.addTask(task);

        // TaskExecutor.updateTaskStatus(task, TaskStatus.WAIT_RUN);
      }
    });
    socket.on("EVENT_MSG", (event, message) => {
      writeLog2File(`EVENT_MSG:`, "", message);
    });

    socket.on("EVENT_HEART_BEAT", (event, message) => {
      writeLog2File(`EVENT_HEART_BEAT:`, "", message);
    });


  }

  sendTaskReceiveConfirmInfo(task) {
    socket &&
      socket.send({
        method: "confirm",
        token: this.SysVar.token,
        batchId: task.batchId,
        taskId: task.taskId
      });
  }

  /**
   * 每隔一分钟将采集端的所有任务ID发往服务端里德校验
   */
  monitorTaskIds() {
    setInterval(() => {
      if (TaskExecutor.runList.length != 0 || this.taskList.length != 0) {
        let tids = [];
        if (TaskExecutor.runList.length != 0) {
          TaskExecutor.runList.forEach(task => {
            tids.push(task.taskId);
          });
        }

        if (this.taskList.length != 0) {
          this.taskList.forEach(task => {
            tids.push(task.taskId);
          });
        }
        let data = {
          method: "monitorTaskIds",
          tids: tids,
          token: this.SysVar.token
        };
        socket && socket.send(data);
      }
    }, 61 * 1000);
  }

  // 添加任务
  addTask(...tasks) {
    tasks.forEach(task => (TaskExecutor.TOTALS[task.taskId] = 0));
    this.taskList.push(...tasks);
    writeLog2File(` this.taskList 任务队列添加任务:${tasks}`);
    if (!this._timer) {
      this.startTimer();
    }
    this.$rootScope.$applyAsync();
  }

  private _timer;

  // 启动任务派发定时器，每隔2s中尝试派发任务
  private startTimer() {
    // console.warn("启动任务派发定时器")
    writeLog2File(`每隔4s中尝试派发任务,启动任务派发定时器`);
    this._timer = setInterval(() => this.tryAsExecutor(), 4000);
  }

  // 停止任务派发
  private stopTimer() {
    clearInterval(this._timer);
    this._timer = null;
  }

  private _doneCount = 0;

  // 当前运行任务
  private _currentRun = 0;

  // 尝试执行任务
  private tryAsExecutor() {
    if (this.taskList.length && this._currentRun !== this.SysVar.maxRunSize) {
      // 最多同时n个任务启动
      this._currentRun += 1;
      this._runFirst();
    }

    if (this._doneCount == 100) {
      this.stopTimer();
      //return location.reload(true);
    }

    if (!this.taskList.length && !this._currentRun) {
      this.stopTimer();
    }

    this.$rootScope.$applyAsync();
  }

  // 根据任务id查询任务
  private getTask(taskId) {
    let _task = _.find(TaskExecutor.runList, { taskId: taskId });
    if (!_task) {
      _task = _.find(this.taskList, { taskId: taskId });
    }
    return _task;
  }

  public _now() {
    var endTime = new Date();
    //  return endTime.toLocaleDateString() + " " + endTime.toTimeString().split(' ')[0]
    return endTime.getTime();
  }

  // 运行队列中最前面的任务
  private async _runFirst() {
    var _token = this.SysVar.token;
    // 拿到数组第一个元素
    let task = this.taskList.shift(),
      rule = task.rule,
      taskId = task.taskId;
    writeLog2File(`开始运行任务队列d任务:${task.name}`);
    /**
     * 任务运行分为服务器端发送运行和本地测试运行
     * 服务器端发送来的任务本身不带步骤信息需要 通过 TaskManage 重新查询
     */
    TaskExecutor.runList.push(task);

    let _isLocal = !rule || !rule.steps;
    let batchTask: KvObj = {
      method: "monitor",
      token: this.SysVar.token,
      type: "iris.monitor.batchTask",
      batchId: task.batchId,
      taskId: taskId,
      routinePlanId: task.planId,
      startTime: new Date().getTime(),
      parentTaskId: task.pid,
      endTime: null,
      status: 1, //start("开始-进行中","1")
      //新增优先级
      priority: task.priority
    };
    let taskBatchStatus: KvObj = {
      //采集端的身份标识
      token: _token,
      method: "status",
      deliveryTag: task.deliveryTag,
      name: task.name,
      taskId: taskId,
      batchId: task.batchId,
      planId: task.planId,
      parentTaskId: task.pid,
      status: "2", //success("成功","2")
      //新增优先级
      priority: task.priority
    };

    try {
      // // 查询步骤信息
      if (!rule.rule) {
        writeLog2File(`[TaskExecutor._runFirst] 任务规则不存在`);
        throw "[TaskExecutor._runFirst] 任务规则不存在";
      }
      // 更新状态信息
      // TaskExecutor.updateTaskStatus(task, TaskStatus.RUNNING);
      TaskExecutor.TIMES[taskId] = Date.now();

      // 根据任务类型启动任务
      let resultMap;
      //开始执行发回信息
      socket && socket.send(batchTask);
      switch (task.type) {
        case "electron.wechat": //微信采集
          //获取最近任务50条数据
          const lastData: Array<ITaskItem> = task.maps
          let fifilData = lastData.filter((v, i) => {
            return moment(v.captureTime).format('YYYY-MM-DD') == moment(Date.now()).format('YYYY-MM-DD')
          })
          if (fifilData.length) {//最近50条数据存在今天日期，就不执行采集了
            resultMap = {}
            console.debug(`该微信任务${task.name}已采集过了,${fifilData.length}`)
          } else {
            resultMap = await runWeixinPubTask(
              task,
              JSON.parse(rule.rule),
              socket,
              _token,
              this.CollectorProxyService
            );
            break;
          }

        case "electron.weibo": //微博采集
          // resultMap = await runWeiboTask(task, JSON.parse(rule.rule), socket, _token);
          break;
        case "electron.dynamic": //普通采集任务
        case "java.static": //静态采集任务
        default:
          writeLog2File(`开始执行采集：${task.name}`);
          resultMap = await runTask(
            task,
            JSON.parse(rule.rule),
            socket,
            _token,
            this.CollectorProxyService
          );
          writeLog2File(`${task.name}采集完成`);
          break;
      }
      // _isLocal && this.saveLocal(task);
      // 任务运行完成后，如果存在警告，将任务状态更新为警告
      let msg;
      if (resultMap && resultMap["msg"]) {
        msg = resultMap["msg"];
      } else if (!TaskExecutor.TOTALS[taskId]) {
        msg = "采集数据为0";
      } else {
        msg = TaskExecutor.validCount(resultMap, task);
      }

      await delay(15 * 1000);
      // 任务采集完成
      batchTask.endTime = new Date().getTime();
      batchTask.status = "2";
      batchTask.successDataCounts = TaskExecutor.TOTALS[taskId];
      socket && socket.send(batchTask);

      taskBatchStatus.endTime = new Date().getTime();
      taskBatchStatus.status = "2";
      taskBatchStatus.successDataCounts = TaskExecutor.TOTALS[taskId];
      socket && socket.send(taskBatchStatus);
      //add
      taskBatchStatus = null;
      // add
      batchTask = null;
      writeLog2File(`${task.name} 已完成`, "完成任务");
    } catch (e) {
      console.error(e)
      batchTask.endTime = new Date().getTime();
      batchTask.status = "4";
      batchTask.successDataCounts = TaskExecutor.TOTALS[taskId];
      var batchTaskDetail = {
        method: "monitor",
        token: _token,
        type: "iris.monitor.batchTaskDetail",
        batchId: task.batchId,
        taskId: taskId,
        routinePlanId: task.planId,
        startTime: batchTask.startTime,
        endTime: new Date().getTime(),
        url: "无法获取",
        failureReason: String(e),
        status: 4,
        //新增优先级
        priority: task.priority
      };
      socket && socket.send(batchTask);
      socket && socket.send(batchTaskDetail);

      writeLog2File(`任务出现错误`, "出错任务", task.name);
      //响应采集任务执行完成
      taskBatchStatus.endTime = new Date().getTime();
      taskBatchStatus.status = "4";
      taskBatchStatus.successDataCounts = TaskExecutor.TOTALS[taskId];
      socket && socket.send(taskBatchStatus);
      //add
      batchTaskDetail = null;
      batchTask = null;
      taskBatchStatus = null;
    } finally {
      // 一些收尾工作，删除记录信息，运行列表清除等
      delete TaskExecutor.TOTALS[taskId];
      delete TaskExecutor.STATUS[taskId];
      delete TaskExecutor.TIMES[taskId];
      //add
      // delete
      _.pull(TaskExecutor.runList, task);
      this._currentRun -= 1;
      if (!_isLocal) {
        // 通过socket派发的任务
        this._doneCount += 1;
      }
    }
  }

  // 校验任务采集数据的完整性
  static validCount(countMap, taskId) {
    let arr = [];
    _.forEach(countMap, function (val, key) {
      arr.push([val, key]);
    });
    arr = _.sortBy(arr, "0"); // 从小到大,排序所有抓取到的字段
    let cols = _.map(_.filter(arr, { 0: 0 }), 1);

    if (cols.length) {
      return `未抓取到字段 : ${cols}`; // 如果有字段未抓取到
    }

    let total = TaskExecutor.TOTALS[taskId];
    let cols2 = _.map(
      _.filter(arr, function (item) {
        return item[0] / total < 0.4;
      }),
      1
    );
    if (cols2.length) {
      // 如果此字段采集成功率在40%以下,则警告
      return `字段采集成功率过低 : ${cols}`;
    }
    return false;
  }

  static TOTALS = {}; // 任务采集多少条
  static STATUS = {}; // 任务状态
  static TIMES = {}; // 任务执行持续时间

  TOTALS = TaskExecutor.TOTALS;
  STATUS = TaskExecutor.STATUS;
  TIMES = TaskExecutor.TIMES;
  static failureReason = "警告:3分钟未采集到任何数据";
}

app.service("TaskExecutor", TaskExecutor);

// 公共方法：根据Task初始化发送数据
function initByTask(data, task) {
  data.pid = task.pid;
  data.parentTaskId = task.pid;
  data.chdId = task.chdId; //是否是子类
  data.taskId = task.taskId;
  data.ptaskId = task.pid;
  data.templateId = task.templateId;
  data.batchId = task.batchId; // 批次id
  data.planId = task.planId;
  data.uniqueColumnName = task.uniqueColumnName;
  data.snapshotFlag = task.snapshotFlag;
  data.taskType = task.taskType || task.type;
  data.priority = task.priority;
  return data;
}

// 普通任务执行器
async function runTask(task, steps, socket, token, CollectorProxyService) {
  let executor = new Executor();
  executor.CollectorProxyService = CollectorProxyService;
  let taskId = task.taskId;
  //修改为获取maps，因为后台返回的是对象
  let urls = task.maps || [];
  // const oldUrls = _.cloneDeep(urls);
  executor.steps = steps;
  executor.task = task;
  let cols = executor.getColumns();
  // 唯一数据校验字段
  //let unique = _.find(cols, {unique: true});

  let uniques = [];
  cols.forEach(item => {
    if (item.unique) {
      uniques.push(item);
    }
  });

  if (uniques != undefined && uniques.length > 0) {
    // 判断是否重复的数据 存在返回true
    executor.isRepeat = async function (capture) {
      let isExist = false;

      //isExist = !oldUrls.every(url => val !== url);
      function testExist(nobj, oobj, uniques) {
        let res = true;
        if (uniques) {
          for (let j = 0; j < uniques.length; j++) {
            let unique = uniques[j];
            let nval = nobj[unique.columnName];
            let oval = oobj[unique.columnName];
            // console.debug(nval,"--",oval)
            if (nval != oval) {
              res = false;
              break;
            }
          }
        }

        return res;
      }

      if (urls) {
        for (let i = 0; i < urls.length; i++) {
          let oldUrl = urls[i];
          if (testExist(oldUrl, capture, uniques)) {
            isExist = true;
            break;
          }
        }
      }
      return isExist;
    };
  }

  executor.on("debug", function (msg) {
    // console.debug("debug:", msg);
    writeLog2File(`执行器当前步骤:`, "", msg);
  });

  let resultMap = {};

  cols.forEach(function (col: ICapture) {
    resultMap[col.columnName] = 0;
  });

  let idx = 0;

  var batchTaskDetail = {
    method: "monitor",
    token: token,
    type: "iris.monitor.batchTaskDetail",
    batchId: task.batchId,
    taskId: taskId,
    routinePlanId: task.planId,
    startTime: null,
    endTime: null,
    status: 2,
    pid: task.pid,
    chdId: task.chdId,
    url: "无",
    //新增优先级
    priority: task.priority
  };

  // 当成功抓取一条数据时,触发此事件
  executor.on("capture", async data => {
    // writeLog2File(`zhuxiaobin, 成功采集一条完整的数据`, "", data);
    nextTimer(); //采集超时角发器
    batchTaskDetail.startTime = new Date().getTime();
    _.forEach(data, function (val, key) {
      if (typeof resultMap[key] === "number") {
        resultMap[key] += 1;
      }
    });
    data.indexNo = ++idx;
    data.captureTime = new Date().getTime(); // 抓取时间
    data = initByTask(data, task);
    //const preview = data[CAPTURE_MARK.pagePreview];
    data.method = "storage";
    data.token = token;
    data.cliToken = token;
    data.collectType = _.join(collectorInfo.collectorType, ",");

    batchTaskDetail.endTime = new Date().getTime();
    sendSocket && sendSocket.send(data);
    data = null;
    console.log("data = null");
    if (TaskExecutor.TOTALS[taskId] % 20 === 0) {
      sendSocket && sendSocket.send(batchTaskDetail);
    }
    TaskExecutor.TOTALS[taskId] += 1;
    //fix
    // delete data[CAPTURE_MARK.pagePreview];
    data = null;
  });
  /**
   * 自动停止定时器
   * 1 如果目标10分钟未抓取到任何数据,则终止,报异常
   * 2 如果抓取一定数据后卡住10分钟,则终止,20条以上报警告,20条以下报异常
   * 3 每条处理时间超过1分钟,报警告
   */
  let startTime = Date.now(),
    times = [],
    totalTime = 0,
    _timer;

  //采集超时角发器
  function nextTimer() {
    let lastTime = Date.now();
    let captureTime = lastTime - startTime;
    totalTime += captureTime;
    times.push(captureTime);
    startTime = lastTime;
    clearTimeout(_timer);
    _timer = setTimeout(function () {
      // 10分钟后处理关闭流程逻辑
      //1.停止当前程序的执行
      // if (idx < 20) {//idx：顺序号
      //     throw '警告:10分钟未采集到任何数据';
      // }
      //结束当前采集端
      executor.remove();
      TaskExecutor.runList.splice(_.findIndex(TaskExecutor.runList, task), 1);
      //2.发送异常信息到服务端
      let batchTask = {
        method: "monitor",
        token: token,
        type: "iris.monitor.batchTask",
        batchId: task.batchId,
        taskId: task.taskId,
        parentTaskId: task.pid,
        routinePlanId: task.planId,
        startTime: null,
        endTime: new Date().getTime(),
        failureReason: TaskExecutor.failureReason,
        status: 4, //失败状态,
        //新增优先级
        priority: task.priority
      };

      socket && socket.send(batchTask);
      //3.发送任务更新请求，将任务更新为失败
      socket &&
        socket.send({
          //采集端的身份标识
          token: token,
          method: "status",
          deliveryTag: task.deliveryTag,
          name: task.name,
          taskId: task.taskId,
          parentTaskId: task.pid,
          batchId: task.batchId,
          planId: task.planId,
          failureReason: TaskExecutor.failureReason,
          pid: task.pid,
          successDataCounts: TaskExecutor.TOTALS[taskId],
          status: "4", //create("创建","0"),start("开始","1"),success("成功结束","2"),partFailure("部分失败","3"),failure("失败","4");
          //新增优先级
          priority: task.priority
        });
      writeLog2File(
        `任务超时，采集自动终止reason:${TaskExecutor.failureReason}`
      );
      //销毁监听
      executor.removeAllListeners();
      //抛出错误原因
      throw TaskExecutor.failureReason;
    }, 3 * 60 * 1000);
  }

  nextTimer();

  try {
    await executor.run();
    if (Math.ceil(totalTime / times.length) > 60 * 1000) {
      resultMap["msg"] = "警告:采集平均时间超过1分钟";
    }
    return resultMap;
  } catch (e) {
    throw e;
  } finally {
    clearTimeout(_timer);
    executor.remove();
    executor.removeAllListeners();
    executor = null;
    resultMap = null;
  }
}

// 微信任务执行器
async function runWeixinPubTask(
  task: ITaskItem,
  configs = [],
  socket,
  token,
  CollectorProxyService
) {
  const projectId = task.projectId;
  const taskId = task.taskId;
  const config = configs[0] || {};

  let weixin = new WeixinPub(
    console,
    config.steps || [],//weixin id
    config.filters || [],
    token,
    projectId,
    socket,
    CollectorProxyService
  );

  weixin.on("capture", data => {
    console.debug(`zhuxiaobin,weixin, 成功采集一条完整的数据`, "", data);
    nextTimer(); //采集超时角发器
    data[CAPTURE_MARK.captureTime] = new Date().getTime(); // 抓取时间
    //pid
    data.pid = task.pid;
    data.chdId = task.chdId;
    data.taskId = task.taskId;
    data.ptaskId = task.pid;
    data.templateId = task.templateId;
    data.batchId = task.batchId; // 批次id
    data.planId = task.planId;
    data = initByTask(data, task);
    data.collectType = _.join(collectorInfo.collectorType, ",");
    const _idx = data["_idx"];
    delete data["_idx"];
    data.indexNo = _idx;
    const preview = data[CAPTURE_MARK.pagePreview];
    // delete data[CAPTURE_MARK.pagePreview];

    data.method = "storage";
    data.token = token;
    //新增优先级
    data.priority = task.priority;

    socket && socket.send(data);
    console.debug('weixin 数据发送成功')
    // let url = data["column_pageUrl"];
    TaskExecutor.TOTALS[taskId] += 1;
    // fix pageThisPreview
    delete data[CAPTURE_MARK.pagePreview];
  });

  let resultMap = {};
  let startTime = Date.now(),
    totalTime = 0,
    _timer;

  function nextTimer() {
    let lastTime = Date.now();
    let captureTime = lastTime - startTime;
    totalTime += captureTime;
    startTime = lastTime;
    clearTimeout(_timer);
    _timer = setTimeout(function () {
      // 10分钟后处理关闭流程逻辑
      weixin.remove();
      TaskExecutor.runList.splice(_.findIndex(TaskExecutor.runList, task), 1);
      //2.发送异常信息到服务端
      let batchTask = {
        method: "monitor",
        token: token,
        type: "iris.monitor.batchTask",
        batchId: task.batchId,
        taskId: task.taskId,
        parentTaskId: task.pid,
        routinePlanId: task.planId,
        startTime: null,
        endTime: new Date().getTime(),
        failureReason: TaskExecutor.failureReason,
        status: 4, //失败状态,
        //新增优先级
        priority: task.priority
      };
      // console.log(batchTask);
      socket && socket.send(batchTask);
      //3.发送任务更新请求，将任务更新为失败
      socket &&
        socket.send({
          //采集端的身份标识
          token: token,
          method: "status",
          deliveryTag: task.deliveryTag,
          name: task.name,
          taskId: task.taskId,
          parentTaskId: task.pid,
          batchId: task.batchId,
          planId: task.planId,
          failureReason: TaskExecutor.failureReason,
          pid: task.pid,
          successDataCounts: TaskExecutor.TOTALS[taskId],
          status: "4", //create("创建","0"),start("开始","1"),success("成功结束","2"),partFailure("部分失败","3"),failure("失败","4");
          //新增优先级
          priority: task.priority
        });
      writeLog2File(
        `微信任务超时，采集自动终止reason: ${TaskExecutor.failureReason}`
      );
      throw TaskExecutor.failureReason;
    }, 3 * 60 * 1000);
  }

  nextTimer();

  try {
    await weixin.run();
    if (Math.ceil(totalTime / TaskExecutor.TOTALS[taskId]) > 60 * 1000) {
      resultMap["msg"] = "警告:采集平均时间超过1分钟";
    }
    return resultMap;
  } catch (e) {
    throw e;
  } finally {
    clearTimeout(_timer);
    weixin.remove();
    weixin.removeAllListeners();
    resultMap = null;
    weixin = null;
  }
}

// 微博任务执行器
/*
 async function runWeiboTask(task, steps,   socket) {
 const taskId = task.taskId;
 const weibo = new Weibo(console, steps);

 weibo.on('capture', (dataList) => {
 const curData = new Date();
 dataList.forEach(data => {
 data['batchId'] = batchId;
 data[CAPTURE_MARK.captureTime] = curData;// 抓取时间
 collection.save(data);
 });
 TaskExecutor.TOTALS[taskId] += 1;
 });

 await weibo.run();
 return {};
 }*/
