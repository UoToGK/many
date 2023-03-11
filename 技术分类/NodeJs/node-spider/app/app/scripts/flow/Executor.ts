// Created by uoto on 16/4/15.
// import requireAll = require('requireall');
import { Work } from "./Works";
import { EventEmitter } from "events";
// import {COLUMNS} from "./properties";
import { writeLog2File } from "../base/logger";

/**
 * 流程执行器
 * 创建一个流程执行工作空间 Work，然后执行步骤，返回执行结果如：采集/抓取内容，分页跳转时等
 *
 * @event capture 每一次抓取完成时触发
 * @event paging 每一次分页时触发
 *
 * @examples
 * <example>
 *     <file name="index.ts">
 *         let steps = [];
 *         let executor = new Executor();
 *         executor.steps = steps;
 *
 *         let promise = executor.run();
 *
 *         executor.on('capture' , function(data) {  });
 *         executor.on('paging' , function(url) {  });
 *
 *         promise.then(function(result) {  });
 *     </file>
 * </example>
 */
export class Executor extends EventEmitter {
  constructor() {
    super();
    console.debug("Executor constructor");
  }

  public steps: IStepOption[] = null; //Executor.steps 外部直接赋值
  public demo = false;
  public data;
  public size = 0;
  //测试运行时需要
  public taskColumns = [];
  public setting: any = {};
  public work;
  public running = false;
  public taskId = "";
  public task: any = {};
  public CollectorProxyService;

  async run() {
    this.running = true;
    // 创建执行空间，交给它要执行的步骤列表
    //新加入 columns 参数
    this.setting.isSaveSnapshoot = this.task.snapshotFlag;
    console.debug("work create");
    this.work = Work.create(
      this.steps,
      {
        progress: this,
        columns: this.taskColumns,
        setting: this.setting,
        isSaveSnapshoot: this.task.snapshotFlag,
        isSupportProxy: this.task.isSupportProxy,
        proxy: this.task.proxy,
        CollectorProxyService: this.CollectorProxyService
      },
      this.demo
    );
    this.on("capture", data => (this.size += 1));
    //this.works.push(this.work);
    try {
      // 开始启动执行，并且等待执行结束
      this.data = await this.work.promise;
    } catch (e) {
      throw e;
    } finally {
      // 执行完成后，还原状态，并且销毁监听的事件
      this.running = false;
      this.removeAllListeners("capture");
      this.removeListener("debug", function(e) {
        writeLog2File(`执行器移除debug事件`);
      });
      this.work.promise = null;
    }
  }

  // 查询是否有重复数据
  queryRepeat;

  isRepeat;

  getColumns() {
    // 从步骤列表中获取所有可能会 采集/抓取 的步骤信息
    return Work.queryColumns(this.steps);
  }

  /*****  停止，删除，下一条处理 ******/
  gotoNext() {
    this.work.gotoNext();
  }

  stop() {
    if (this.work) {
      this.work.stop();
    }
    //add
    this.removeAllListeners("debug");
    this.removeAllListeners("capture");
    this.removeAllListeners("paging");
  }

  remove() {
    this.stop();
    this.work.remove();
    //this.work=null;

    this.removeAllListeners();
    // this.work.remove();
    // this.work.stop();
    // this.work=null;
    // this.data=null;
    // this.taskColumns=null;
    // this.task=null;
  }

  getWork() {
    return this.work;
  }

  getTaskId() {
    return this.taskId;
  }
}
