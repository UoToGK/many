// Created by uoto on 16/4/5.
import app from "../app";
import "ztree";
import "../../../styles/zTree.css";

let config = require("../../../resource/config.yaml");
app.directive('ztree', function ($http,$routeParams) {
    return {
        restrict: 'E',
        link: function ($scope, el, attr:any) {
            $scope.zTreeObj;
            // zTree 的参数配置，深入使用请参考 API 文档（setting 配置详解）
            $scope.setting = {
                check:{
                    autoCheckTrigger:true,
                    enable:true,
                    chkboxType:{
                        "Y":"ps",
                        "N":"s"
                    }
                }
            };
            // zTree 的数据属性，深入使用请参考 API 文档（zTreeNode 节点数据详解）
            $scope.zNodes = [];
            $scope.el=el;
        },
        replace: true,
        template: '<ul id="checkboxTree" class="ztree"></ul>'
    }
});