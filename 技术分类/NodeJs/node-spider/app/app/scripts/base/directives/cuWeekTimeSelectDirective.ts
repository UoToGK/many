// Created by uoto on 16/4/5.

import app from "../app";
//选择星期
app.directive('cuWeekTimeSelect', function () {
    return {
        restrict: 'E',
        replace: true,
        template: (`<md-select>
                        <md-option value="2">周一</md-option>
                        <md-option value="3">周二</md-option>
                        <md-option value="4">周三</md-option>
                        <md-option value="5">周四</md-option>
                        <md-option value="6">周五</md-option>
                        <md-option value="7">周六</md-option>
                        <md-option value="1">周日</md-option>
                   </md-select>`)
    }
});