//Created by uoto on 16/2/29.

import app from "../../base/app";
import "./SortableDirective";
import {uuid} from "../../base/util";
import {pull} from "lodash";
import {BEHAVIOR} from "../properties";

app.directive('stepLine', function () {
    return {}
});

app.directive('stepWrapContent', function () {
    return {}
});

// 步骤流程树主布局
app.directive("stepFlow", function (RecursionHelper) {
    let compile = RecursionHelper();// 优化处理虚拟dom
    return {
        restrict: "E",
        scope: {
            option: '='
        },
        template: `
            <step-line sortable="option.steps" item="step">
                <step-item ng-repeat="step in option.steps" draggable="true" parent="option" parent-list="option.steps" option="step"></step-item>
            </step-line>
        `,
        controller: class{
            private oldStepItem;
            constructor(private $scope){
            }

            // 设置步骤为激活节点
            active(stepOption){
                this.oldStepItem && this.oldStepItem.removeClass('active');
                if (stepOption && stepOption.$$dom) {
                    this.oldStepItem = stepOption.$$dom.addClass('active');
                    this.$scope.option.active && this.$scope.option.active(stepOption);
                } else {
                    this.oldStepItem = null;
                }
            }

            // 删除步骤处理器
            remove(stepOption, list, parent){
                this.$scope.option.remove(stepOption);
                const idx = list.indexOf(stepOption);
                pull(list, stepOption);
                if (!list.length && parent.id) {
                    this.active(parent);
                } else {
                    this.active(list[idx - 1] || list[idx]);
                }
            }
        },
        compile: compile
    };
});

// 步骤节点渲染器
app.directive('stepItem', function (RecursionHelper, flow) {
    let compile = RecursionHelper();
    return {
        scope: {
            option: '=',
            parent: '=',
            parentList: '='
        },
        template: `
            <label ng-if="!option.type" class="drag-handle" ng-click="active()">
                <span>{{option.name}}</span>
                <i class="material-icons delete" ng-click="remove()">delete</i>
            </label>

            <div ng-if="option.type === 'cycle' || option.type === 'paging'" class="wrap">
                <div class="title drag-handle" ng-click="active()">
                    <i class="material-icons">autorenew</i>
                    <span>{{option.name}}</span>
                    <i class="material-icons delete" ng-click="remove()">delete</i>
                </div>
                <step-wrap-content sortable="option.steps" item="step">
                    <step-item ng-repeat="step in option.steps" draggable="true" parent="option" parent-list="option.steps" option="step"></step-item>
                </step-wrap-content>
            </div>

            <div ng-if="option.type === 'branch'" class="wrap">
                <div class="title drag-handle" ng-click="active()">
                    <i class="material-icons rotate-180">call_split</i>
                    <span>{{option.name}}</span>
                    <i class="material-icons delete" ng-click="remove()">delete</i>
                </div>
                <div class="ifs">
                    <div class="branchs layout-row" layout="row">
                        <div class="branch fault" flex>
                            <step-wrap-content sortable="option.fault" item="step">
                                <step-item ng-repeat="step in option.fault" draggable="true" parent="option" parent-list="option.fault" option="step"></step-item>
                            </step-wrap-content>
                        </div>
                        <div class="branch right" flex>
                            <step-wrap-content sortable="option.right" item="step">
                                <step-item ng-repeat="step in option.right" draggable="true" parent="option" parent-list="option.right" option="step"></step-item>
                            </step-wrap-content>
                        </div>
                    </div>
                </div>
            </div>
        `,
        require: '^stepFlow',
        compile: function (element) {
            return compile(element, function link(scope, stepItem, attr, stepFlow) {
                if (!scope.option.id) {
                    scope.option.id = uuid("step");
                }
                scope.option.$$dom = stepItem;
                scope.active = function () {
                    stepFlow.active(scope.option);
                };
                scope.remove = function () {
                    if (confirm('确定删除此节点?')) {
                        stepFlow.remove(scope.option, scope.parentList, scope.parent);
                    }
                };
                if (scope.option.behavior === BEHAVIOR.customCycle) {
                    if (scope.option.data && scope.option.data[0]) {
                        flow.locals['$0'] = scope.option.data[0];
                    }
                }
                if (scope.option.autoActive) {
                    // 动态生成的step带有 `autoActive` 属性
                    // 表示在这里需要主动激活它
                    scope.active();
                    delete scope.option.autoActive;
                }
            });
        }
    };
});