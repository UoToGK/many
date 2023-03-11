// Created by uoto on 16/4/15.
import app from "../../base/app";
import "./StepFlowDirective";
import "./SplitterDirective";
import { Designer } from "../Designer";
import { resolve } from "path";
import { Work } from "../Works";
import { registerWebRequestListener, removeWebRequestListener } from "../tools/events";

app.directive("designer", function ($mdDialog, flow, $rootScope: ng.IRootScopeService) {
    var preload = resolve(__dirname, '../tools/preload.js');//将 to 参数解析为绝对路径。
    return {
        template: `
            <splitter orientation="vertical" limit="150" position="200" style="height: 100%;">
                <splitter-panel>
                    <step-flow option="option"></step-flow>
                </splitter-panel>
                <splitter orientation="horizontal" limit="100" position="200">
                    <splitter-panel>
                        <step-option option="currentStep" setting="setting"></step-option>
                    </splitter-panel>
                    <splitter-panel>
                        <webview style="height: 100%;" plugins id="v" src="about:blank" preload="${preload}"></webview>
                    </splitter-panel>
                </splitter>
            </splitter>
        `,
        scope: {
            option: '=',
            setting: '='
        },
        require: '^designerMain',
        link: function (scope, el: JQuery, attr, designerMain: any) {
            // 激活一个步骤
            scope.option.active = function (step) {
                scope.currentStep = step;
                scope.option.activeStep = step;
                designerMain.activeStep = step;
                flow.currentStep = step;
                flow.setting = scope.setting;
                flow.currentTask = scope.option.currentTask;
            };

            // 删除一个步骤
            scope.option.remove = function (step) {
                $rootScope.$broadcast('removeStep', step);
                designerMain.activeStep = null;
                flow.currentStep = null;
                scope.currentStep = null;
                scope.option.activeStep = null;
            };

            let webview = <ElectronWebView>el.find('webview')[0];
            // 初始化流程设计器
            scope.option.designer = new Designer(webview, scope.option.steps, $mdDialog, designerMain);

            setTimeout(function () {
                Work.clearAllData(webview);
                registerWebRequestListener(webview, true);
            }, 100);

            scope.$on('$destroy', function () {
                removeWebRequestListener(webview);
                webview = null;
            });

            // 告诉流程设计器主程序，将刚初始化的流程设计器设置为当前流程设计器
            designerMain.initDesigner(scope.option.designer);
        }
    }
});