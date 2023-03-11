// Created by uoto on 16/4/5.
import app from "../app";
//选择时间
app.directive('cuTimeSelect', function() {
    return {
        restrict: 'E',
        replace: true,
        template: (`<md-select style="z-index: 9999">
                        <md-option>0:00</md-option>
                        <md-option>1:00</md-option>
                        <md-option>2:00</md-option>
                        <md-option>3:00</md-option>
                        <md-option>4:00</md-option>
                        <md-option>5:00</md-option>
                        <md-option>6:00</md-option>
                        <md-option>7:00</md-option>
                        <md-option>8:00</md-option>
                        <md-option>9:00</md-option>
                        <md-option>10:00</md-option>
                        <md-option>11:00</md-option>
                        <md-option>12:00</md-option>
                        <md-option>13:00</md-option>
                        <md-option>14:00</md-option>
                        <md-option>15:00</md-option>
                        <md-option>16:00</md-option>
                        <md-option>17:00</md-option>
                        <md-option>18:00</md-option>
                        <md-option>19:00</md-option>
                        <md-option>20:00</md-option>
                        <md-option>21:00</md-option>
                        <md-option>22:00</md-option>
                        <md-option>23:00</md-option>
                   </md-select>`)
    }
});