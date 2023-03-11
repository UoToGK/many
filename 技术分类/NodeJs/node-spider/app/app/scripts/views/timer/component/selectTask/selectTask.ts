// Created by uoto on 16/4/5.
import {Dialog} from "../../../../base/util";

interface Opt {
    closeTo:any,
    taskIds:any[],
    $mdDialog:any,
    owner:any
}

export function taskTreeSelect<T>(opt:Opt):Promise<T> {
    return opt.$mdDialog.show({
        controller: EditTaskDialogCtrl,
        controllerAs: 'T',
        templateUrl: `${__dirname}/selectTask.html`,
        closeTo: opt.closeTo,
        locals: {
            taskIds: opt.taskIds,
            owner: opt.owner
        }
    });
}

class EditTaskDialogCtrl extends Dialog {
    public nodes:any;
    public setting:any;

    constructor(public $scope,
                public $mdDialog,
                public taskIds,
                public TaskManage,
                public owner) {
        super($mdDialog);

        this.setSetting();
    }

    public answer(saveFlag) {
        if (saveFlag) {
            var ztr = $.fn.zTree.getZTreeObj('ztr');
            var nodes = ztr.getCheckedNodes(true);

            var res = [];

            nodes.forEach(function (node) {
                /**
                 * node.group
                 *   true  表示是组
                 *   false  表示非组
                 *
                 * node.check_Child_State
                 *   -1 不存在子节点
                 *   0  无 子节点被勾选
                 *   1  部分 子节点被勾选
                 *   2  全部 子节点被勾选
                 */
                var state = node.check_Child_State;
                var parentNode = node.getParentNode();
                var isGroup = node.group;

                if (!parentNode) {//根元素
                    if (isGroup) {
                        if (state != 1) {// 如果是组,除了半选中状态的都需要
                            res.push(node);
                        }
                    } else {//任务都要
                        res.push(node);
                    }
                } else if (node.group) {
                    if (node.check_Child_State != 1) {
                        res.push(node);
                    }
                } else if (!node.group && parentNode.check_Child_State == 1) {// 非根元素,只有父亲未全选中才需要
                    res.push(node);
                }
            });

            this.$mdDialog.hide(res);
        } else {
            this.$mdDialog.hide(saveFlag);
        }
    }

    private setSetting() {
        var ids = this.taskIds;
        this.setting = {
            async: {
                autoParam: ['id=pid'],
                dataFilter: function (treeId, parentNode, list:ITaskItem[]) {
                    if (list && list.length) {
                        list.forEach(function (item:ITaskItem & any) {
                            if (item.group) {
                                item.isParent = true;
                            }

                            if (parentNode) {
                                item.checked = parentNode.checked;
                            }

                            if (!item.checked) {
                                item.checked = ids.includes(item.id);
                            }
                        });
                    }
                    return list;
                },
                dataType: 'json',
                enable: true,
                type: 'get',
                otherParam: {
                    owner: this.owner,
                    findList: 'true'
                },
                url: this.TaskManage.getURL()
            },
            check: {
                enable: true,
                autoCheckTrigger: true
            },
            data: {
                simpleData: {
                    enable: true,
                    pIdKey: "pid"
                }
            }
        };
    }
}

