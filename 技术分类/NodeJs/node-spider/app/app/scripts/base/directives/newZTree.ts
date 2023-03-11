// Created by uoto on 16/4/5.
import app from "../app";
import "ztree";
import "../../../styles/zTree.css"
app.directive('newztree', function ($http, $routeParams) {
    return {
        restrict: 'E',
        link: function ($scope, el, attr: any) {
            $scope.element = el;
        },
        replace: true,
        template: '<ul id="newZTree" class="ztree"></ul>'
    }
});