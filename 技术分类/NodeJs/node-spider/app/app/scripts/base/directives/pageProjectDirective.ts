// Created by uoto on 16/4/5.
import app from "../app";

var config = require("../../../resource/config.yaml");

app.directive('pageProject', function ($http) {
    return {
        restrict: 'E',
        replace: true,
        template:`
            <nav aria-label="Page navigation"> 
                <ul class="pagination">
                    <li>
                        <a href="javascript:void(0)" aria-label="Previous" ng-click="previous()">
                            <span aria-hidden="true">首页</span>
                        </a>
                    </li>
                    <li>
                        <a href="javascript:void(0)" aria-label="Previous" ng-click="prevBtn()">
                            <span aria-hidden="true">上一页</span>
                        </a>
                    </li>
                    <li ng-repeat="i in totalSize" ng-class="{active:i+1==cp}" ng-click="changePage(i+1)"><a href="javascript:void(0)">{{i+1}}</a></li>
                    <li>
                        <a href="javascript:void(0)" aria-label="Previous" ng-click="nextBtn()">
                            <span aria-hidden="true">下一页</span>
                        </a>
                    </li>
                    <li>
                        <a href="javascript:void(0)" aria-label="Next" ng-click="next()">
                            <span aria-hidden="true">尾页</span>
                        </a>
                    </li>
                </ul>
            </nav>`,
        link: function($scope){
            $scope.cp=1;//current page number 当前页码值
            $scope.size=9;//每页显示的数据条数。
            $scope.start=1; // 分页按钮的起始值
            $scope.total=1; // 总页码值
            $scope.btnCounter=5;//带数字的分页按钮的数量。
            $scope.totalSize=[]; // 空数组按顺序存放分页按钮数值

            $scope.initPageNumber=function(data){
                $scope.cp = data.current;
                $scope.start = data.current; // 分页按钮的起始值
                $scope.totalSize=[]; // 空数组按顺序存放分页按钮数值
                $scope.total=data.totalPage;
	            $scope.size = data.limit;
                //初始化totalSize信息
                var startFix, endFix;
                startFix = endFix = Math.floor($scope.btnCounter / 2);
                var test = startFix * 2 + 1;
                if (test > $scope.btnCounter) startFix -= 1;
                if (test < $scope.btnCounter) endFix += 1;

                var _sf = 0,
                    _ef = 0,
                    start = data.current - startFix,
                    end = endFix + data.current + 1;
                if (start < 0) {
                    _sf = 0 - start;
                    start = 0;
                }

                if (end >= data.totalPage) {
                    _ef = end - data.totalPage;
                    end = data.totalPage;
                }

                start = start - _ef;
                end = end + _sf;
                start = start < 0 ? 0 : start;
                end = end > data.totalPage ? data.totalPage : end;

                for (; start < end; start++) {
                    $scope.totalSize.push(start);
                }
            };

            $scope.changePage=function(index){
                if($scope.cp == index) return;
                $scope.cp = index;
                $scope.start = index;
                $scope.initData();
            };
            $scope.previous=function(){
	            if($scope.cp == 1) return;
	            $scope.cp = 1;
	            $scope.start = 1;
	            $scope.initData();
            };
            $scope.next=function(){
	            if($scope.cp == $scope.total) return;
	            $scope.cp = $scope.total;
	            $scope.start = $scope.total;
	            $scope.initData();
            };

            $scope.prevBtn=function () {
	            if ($scope.cp == 1) return;
	            $scope.cp = $scope.cp - 1;
	            $scope.start = $scope.cp - 1;
	            $scope.initData();
            };

            $scope.nextBtn=function () {
	            if ($scope.cp == $scope.total) return;
	            $scope.cp = $scope.cp + 1;
	            $scope.start = $scope.cp + 1;
	            $scope.initData();
            };


            $scope.initData();
        }
    }
});

