// Created by uoto on 16/4/26.
import {Dialog} from "../../../../base/util";
import {Behavior} from "./Behavior";

interface Opt {
    tag:TagInfo,
    $mdDialog:any
}

// 创建行为弹出框
export function createBehavior(opt:Opt) {
    return opt.$mdDialog.show({
        controller: CreateBehaviorCtrl,
        controllerAs: 'T',
        templateUrl: `${__dirname}/createBehavior.html`,
        locals: {
            tag: opt.tag
        }
    });
}

class CreateBehaviorCtrl extends Dialog {
    public behaviors;

    constructor(public $scope,
                public $mdDialog,
                public tag:TagInfo) {
        super($mdDialog);

        // 根据标签解析行为列表
        this.behaviors = Behavior.formatBehavior(tag);
    }
}

