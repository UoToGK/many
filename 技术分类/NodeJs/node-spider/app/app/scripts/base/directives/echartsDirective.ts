// Created by uoto on 16/4/5.
import app from "../app";
import echarts = require('echarts');

app.directive('eCharts', function () {
    function link($scope, element, attrs) {
        var myChart = echarts.init(element[0]);
        $scope.$watch(attrs['eOption'], function() {
            var option = $scope.$eval(attrs['eOption']);
            if (angular.isObject(option)) {
                myChart.setOption(option);
            }
        }, true);
        $scope.getDom = function() {
            return {
                'height': element[0].offsetHeight,
                'width': element[0].offsetWidth
            };
        };
        $scope.$watch($scope.getDom(), function() {
            // resize echarts图表
            myChart.resize();
        }, true);
    }
    return {
        restrict: 'A',
        link: link
    };
})