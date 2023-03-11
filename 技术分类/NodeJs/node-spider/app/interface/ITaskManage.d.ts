//Created by uoto on 16/6/6.

/**
 * 任务管理
 * @name ITaskManage
 *
 * @method queryAll 根据 `pid` 任务或者任务组,如果此参数为空,则表示查询根节点的
 * @method createTask 创建普通任务
 * @method createGroup 创建组
 * @method remove 删除组或者任务,当组内还有任意一个普通任务(不包括空的任务组) 不允许删除
 *
 * @examples
 * ```ts
 *  app.factory('TaskManage' , function(resource){
 *      return resource('taskManage.shtml')
 *  });
 *
 *  class TestCtrl{
 *      constructor(TaskManage){
 *          TaskManage.query()
 *      }
 *  }
 * ```
 */
interface ITaskManage {
  queryAll(pid?: string): ITaskItem[];
  createTask(task: ITaskItem);
  createGroup(group: ITaskItem);
  remove(id: string);
}

/**
 * 任务/任务组
 * @prop id
 * @prop pid 父亲(任务组) id
 * @prop isGroup
 * @prop owner
 * @prop name
 * @prop state 任务当前状态(一般状态:0, 运行中:1)
 * @prop createDate 创建时间
 * @prop type 任务类型, 1 普通任务， 2 微信任务，3 微博任务
 */
interface ITaskItem {
  id?: string;
  pid?: string;
  group?: boolean;
  owner?: string;
  name?: string;
  status?: number;
  createDate?: string;
  emergencyLevel?: number;
  type?: number;
  steps?: any;
  [key: string]: any;
}
