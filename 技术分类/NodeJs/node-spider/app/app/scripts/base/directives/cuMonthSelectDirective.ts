// Created by uoto on 16/4/5.
import app from "../app";
//选择时间
app.directive('cuMonthSelect', function() {
    return {
        restrict: 'E',
        replace: true,
        template: (`<md-select>
                        <md-option value="1">1 月</md-option>
                        <md-option value="2">2 月</md-option>
                        <md-option value="3">3 月</md-option>
                        <md-option value="4">4 月</md-option>
                        <md-option value="5">5 月</md-option>
                        <md-option value="6">6 月</md-option>
                        <md-option value="7">7 月</md-option>
                        <md-option value="8">8 月</md-option>
                        <md-option value="9">9 月</md-option>
                        <md-option value="10">10 月</md-option>
                        <md-option value="11">11 月</md-option>
                        <md-option value="12">12 月</md-option>
                   </md-select>`)
    }
});