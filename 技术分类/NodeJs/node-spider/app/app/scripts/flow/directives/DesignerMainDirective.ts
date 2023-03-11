// Created by uoto on 16/4/15.
import app from "../../base/app";
import "./DesignerDirective";
import "./StepOptionDirective";
import {Designer} from "../Designer";
import {pull, last} from "lodash";
import {Detection} from "../tools/Detection";
import requireAll = require('requireall');
requireAll('../stepConfigs/**/*Ctrl.ts', {cwd: __dirname});

/**
 * 设计器控件初始化
 *
 * @example
 * <example>
 *     <file name="file.html">
 *         <designer-main option="T.steps"></designer-main>
 *     </file>
 *     <file name="FileCtrl.ts">
 *         class FileCtrl{
 *             public steps:IStepOption[];
 *             constructor(){
 *                 this.steps = [];
 *             }
 *         }
 *     </file>
 * </example>
 */
app.directive("designerMain", function (flow) {
    interface IOption {
        steps:IStepOption[]
        label:string
        root?:boolean
        disabled?:boolean
        designer?:Designer
        activeStep?:IStepOption
        setting?:any
        active?:(step:IStepOption)=>any
        currentTask?

    }

    return {
        template: `
            <style scoped>
                div[md-tabs-template]{
                    width: 100%;
                    height: 100%;
                }
            </style>
            <md-tabs md-selected="T.selectedIndex" md-border-bottom class="mini-task">
                <md-tab ng-repeat="opt in T.options" ng-click="T.cancelTab(opt)"
                    ng-disabled="opt.disabled" label="{{opt.label}}">
                    <designer option="opt" setting="T.setting" class="mini-task"></designer>
                </md-tab>
            </md-tabs>
        `,
        scope: {
            setting: '=',
            currentTask: '=',
            steps: '=option',
            instance: '='
        },
        controllerAs: 'T',
        controller: class {
            setting:any = {};
            currentTask:any;
            constructor(public $scope, public flow) {
                flow.designerMain = this;
                $scope.$watch('steps', (steps) => {
                    //手动初始化根的流程设计器
                    this.initOptions($scope.steps,this.currentTask);
                });
                $scope.$watch('currentTask', (currentTask) => {
                    //手动初始化根的流程设计器
                    this.initOptions($scope.steps,currentTask);
                });

                $scope.$watch('setting', (setting) => {
                    //手动初始化根的流程设计器
                    flow.setting=$scope.setting;
                    this.setting=$scope.setting;
                    this.initOptions($scope.steps,$scope.currentTask);
                });
            }

            //
            initOptions(steps,currentTask) {
                if (steps&&currentTask) {
                    this.options=[];
                    this.options.push({
                        root: true,
                        label: '主页面',
                        steps: steps,
                        currentTask:currentTask
                    });
                    flow.currentTask=currentTask;
                    this.columnNo = Designer.getColsNum(steps) || 0;
                }
            }


            columnNo = 0;

            //所有的流程设计器将存放在这个对象中
            //包含有根流程设计器(也就是root:true),还有子流程设计器
            options:IOption[] = [];
            // setting:any = [];

            selectedIndex = 0;

            // 当前激活step
            activeStep:IStepOption = null;

            // 取消子标签
            cancelTab(opt) {
                if (!opt.root) {
                    pull(this.options, opt);
                }
                this.setDesigner();
            }

            // 创建节点
            create(type) {
                var opt:IOption = last(this.options);
                if (opt) {
                    opt.setting= this.setting;
                    Detection.create(opt.designer, type);
                }
            }

            // 添加一个流程设计器
            addDesigner(option:IOption) {
                //this.options.forEach(opt => opt.disabled = true);
                this.options.forEach(opt => {
                    opt.disabled = true;
                    opt.setting=this.setting;
                    return opt;
                });
                this.options.push(option);
            }

            // 设置当前的流程设计器
            initDesigner(designer:Designer) {
                this.flow.setting=this.setting;
                this.flow.currentDesigner = designer;
            }

            // 设置最后一个流程设计器为当前的设计器
            private setDesigner() {
                let opt:IOption = last(this.options);
                if (opt) {
                    this.flow.currentDesigner = opt.designer;
                    this.flow.currentStep = opt.activeStep;
                    this.activeStep = opt.activeStep;
                    delete opt.disabled;
                }

                this.$scope.$applyAsync();
            }
        },
        link: function (scope, el, attr, ctrl) {
            if (attr.instance) {
                scope.instance = ctrl;
            }
        }
    }
});
