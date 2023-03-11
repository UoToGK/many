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
function editGroupItem(opt) {
    return opt.$mdDialog.show({
        controller: GroupItemDialogCtrl,
        controllerAs: 'T',
        templateUrl: __dirname + "/groupItem.html",
        closeTo: opt.closeTo,
        locals: {
            isCreate: opt.isCreate,
            task: opt.task
        }
    });
}
exports.editGroupItem = editGroupItem;
var GroupItemDialogCtrl = (function (_super) {
    __extends(GroupItemDialogCtrl, _super);
    function GroupItemDialogCtrl($scope, $mdDialog, task, isCreate) {
        var _this = _super.call(this, $mdDialog) || this;
        _this.$scope = $scope;
        _this.$mdDialog = $mdDialog;
        _this.task = task;
        _this.isCreate = isCreate;
        delete task.rule;
        return _this;
    }
    return GroupItemDialogCtrl;
}(util_1.Dialog));
