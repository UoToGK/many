//Created by uoto on 16/6/6.

/**
 * 数据管理
 * @name data
 *
 * @method saveData 保存数据
 * @method download 下载数据
 * @method queryAllData 查询此任务所有数据
 * @method preview 预览数据
 * @method remove 删除数据
 *
 * @esamples
 * ```ts
 *  app.factory('DataManage' , function(resource) {
 *      return resource('dataManage.shtml');
 *  });
 *
 *  class TestCtrl{
 *      constructor(DataManage){
 *          DataManage.queryList()
 *      }
 *  }
 * ```
 */
declare interface IDataManage {
  saveData(taskId: string);
  download(branchId: string): File;
  queryAllData(taskId: string): Branch[];
  preview(branchId: string): any[];
  remove(branchId: string);
}

/**
 * 数据批次
 */
declare interface Branch {
  id: string;
  createDate: string;
  dataSize: number;
}
