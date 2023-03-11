// Created by uoto on 16/4/5.
import app from "../app";
import "ztree";
import "../../../styles/zTree.css"
let config = require("../../../resource/config.yaml");
app.directive('tree', function ($http,$routeParams) {
    return {
        restrict: 'E',
        link: function ($scope, el, attr:any) {
            //var setting = $scope.$eval(attr.setting);
            //setting 配置让zTree可被编辑
            $scope.el=el;
            $scope.zNodes=[];
        },
        replace: true,
        template: '<ul class="ztree"></ul>'
    }
});