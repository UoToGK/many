// Created by uoto on 16/4/5.

import app from "../app";

//选择天
app.directive('cuDateSelect', function () {
    return {
        restrict: 'E',
        replace: true,
        template: (`<md-select>
                        <md-option value="1">1 号</md-option>
                        <md-option value="2">2 号</md-option>
                        <md-option value="3">3 号</md-option>
                        <md-option value="4">4 号</md-option>
                        <md-option value="5">5 号</md-option>
                        <md-option value="6">6 号</md-option>
                        <md-option value="7">7 号</md-option>
                        <md-option value="8">8 号</md-option>
                        <md-option value="9">9 号</md-option>
                        <md-option value="10">10 号</md-option>
                        <md-option value="11">11 号</md-option>
                        <md-option value="12">12 号</md-option>
                        <md-option value="13">13 号</md-option>
                        <md-option value="14">14 号</md-option>
                        <md-option value="15">15 号</md-option>
                        <md-option value="16">16 号</md-option>
                        <md-option value="17">17 号</md-option>
                        <md-option value="18">18 号</md-option>
                        <md-option value="19">19 号</md-option>
                        <md-option value="20">20 号</md-option>
                        <md-option value="21">21 号</md-option>
                        <md-option value="22">22 号</md-option>
                        <md-option value="23">23 号</md-option>
                        <md-option value="24">24 号</md-option>
                        <md-option value="25">25 号</md-option>
                        <md-option value="26">26 号</md-option>
                        <md-option value="27">27 号</md-option>
                        <md-option value="28">28 号</md-option>
                        <md-option value="29">29 号</md-option>
                        <md-option value="30">30 号</md-option>
                        <md-option value="31">31 号</md-option>
                        <md-option value="L">最后一天</md-option>
                   </md-select>`)
    }
});