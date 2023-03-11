// Created by uoto on 16/4/5.
import app from "../app";
//选择时间间隔
app.directive('cuTimeSptSelect', function () {
    return {
        restrict: 'E',
        replace: true,
        template: (`<md-select>
                        <md-option value="15">15分钟</md-option>
                        <md-option value="30">30分钟</md-option>
                        <md-option value="60">60分钟</md-option>
                        <md-option value="120">120分钟</md-option>
                   </md-select>`)
    }
});