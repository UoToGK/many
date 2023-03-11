"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// Created by uoto on 16/4/7.
var util_1 = require("../../../../base/util");
function weiboTaskItem(opt) {
    return opt.$mdDialog.show({
        controller: WeiboTaskItemDialogCtrl,
        controllerAs: 'T',
        templateUrl: __dirname + "/weiboTaskItem.html",
        closeTo: opt.closeTo,
        locals: {
            isCreate: opt.isCreate,
            task: opt.task
        }
    });
}
exports.weiboTaskItem = weiboTaskItem;
var WeiboTaskItemDialogCtrl = (function (_super) {
    __extends(WeiboTaskItemDialogCtrl, _super);
    function WeiboTaskItemDialogCtrl($scope, $mdDialog, task, TaskManage, $timeout) {
        var _this = _super.call(this, $mdDialog) || this;
        _this.$scope = $scope;
        _this.$mdDialog = $mdDialog;
        _this.task = task;
        _this.TaskManage = TaskManage;
        _this.$timeout = $timeout;
        if (task.id) {
            _this.queryRule();
        }
        else {
            task.steps = [];
        }
        return _this;
    }
    WeiboTaskItemDialogCtrl.prototype.queryRule = function () {
        var _this = this;
        this.TaskManage.get('findRuleByTaskId', { taskId: this.task.id }, function (res) {
            try {
                _this.task.steps = JSON.parse(res.steps);
            }
            catch (e) {
                _this.task.steps = [];
            }
        });
    };
    WeiboTaskItemDialogCtrl.prototype.paste = function (e) {
        var _this = this;
        this.$timeout(function () {
            if (e.target.value && e.target.value.trim()) {
                var words = e.target.value.trim().split(';');
                words.forEach(function (word) {
                    if (word && !_this.task.steps.includes(word)) {
                        _this.task.steps.push(word);
                    }
                });
                e.target.value = '';
            }
        }, 1);
    };
    WeiboTaskItemDialogCtrl.prototype.add = function (chip) {
        if (!chip) {
            this.task.steps.pop();
        }
    };
    return WeiboTaskItemDialogCtrl;
}(util_1.Dialog));
