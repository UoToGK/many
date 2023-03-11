// Created by uoto on 16/5/11.
///<reference path="../../../../../interface/ITaskManage.d.ts"/>
import { Controller } from "../../../base/annotations";
import { MARK, COLUMNS } from "../../properties";
import { Work } from "../../Works";
import { setFilterDialog } from "./component/setFilterDialog";
import * as _ from 'lodash'
@Controller
export class StepCapturesCtrl {

    public step: ICaptureStep;
    public COLUMNS = COLUMNS;
    public setting: ITaskItem;
    public params: any = {};

    // public CategoryManage ;
    constructor(public $scope,
        public flow: IFlow,
        private $mdDialog,
        public TemplateColumnManage) {
        this.setting = flow.setting;
        this.step = flow.currentStep;
        this.bindAll();
        this.mark();

        this.queryCategory(this.setting.templateId);
    }

    cancelEdit(obj) {
        var selector = this.params["sel_" + obj.columnName];

        obj.selector = selector;
        this.toggleEdit(obj);
    }

    isEdit(obj) {

        return this.params[obj.columnName] ? true : false;
    }

    toggleEdit(obj) {
        this.params["sel_" + obj.columnName] = obj.selector;
        this.params[obj.columnName] = this.params[obj.columnName] ? false : true;

    }

    // 扩大选择范围
    async expand(capture) {
        var data = await this.flow.currentDesigner.executor({
            type: MARK.cycleExpand,
            step: capture
        });
        this.setVars(capture, data);
    }

    // 缩小选择范围
    async reset(capture) {
        var data = await this.flow.currentDesigner.executor({
            type: MARK.cycleReset,
            step: capture
        });
        // this.setVars(capture,data);
    }

    setVars(capture, data) {
        capture.selector = data.selector;
    }

    // end

    public queryCategory(tid) {
        this.TemplateColumnManage.get({ opt: "list", templateId: tid }, (res) => {
            if (res.code === 10000) {
                this.COLUMNS = res.data.data;//获取模板列的名称

            } else {
                console.log("Error:", res);
            }
        });
    }


    public addFixValue() {
        this.step.captures.push({
            "selector": "",
            "unique": false,
            "paths": [],
            "behavior": "fixValue",
            "preview": "",
            "columnName": "",
            "columnDesc": ""
        });
    }

    isTransitionGprs(capture) {
        console.log("isTransitionGprs-capture", capture);
    }

    remove(index) {
        this.step.captures.splice(index, 1);
    }

    async filter(capture: ICapture) {
        try {
            let res = await setFilterDialog({
                $mdDialog: this.$mdDialog,
                capture: _.cloneDeep(capture)
            });

            if (res === false) {
                return;
            }

            capture.match = res;

            if (capture.match && capture.match.date) {
                capture.match.date = (<Date>capture.match.date).getTime();
            }
        } catch (e) {
            console.error('[CaptureCtrl]', e);
        }
    }

    // 给要采集的标签做标记
    async mark() {
        await this.flow.currentDesigner.executor({
            type: MARK.captures,
            step: this.step
        });
    }

    colChange(capture) {
        // console.log(this.COLUMNS);
        if (capture.columnName && this.COLUMNS) {
            this.COLUMNS.forEach(column => {
                if (column.columnName == capture.columnName) {
                    capture.columnDesc = column.columnDesc;
                }
            })
        }
    }

    // 当修改的时候,也修改它的标记
    async changeMark() {
        await this.cancelMark();
        await this.mark();
    }

    private _captures;

    async cancelMark() {
        await this.flow.currentDesigner.executor({
            type: MARK.cancel,
            selects: this._captures
        });
    }

    changeId(capture) {
        // 同时只能设置一个唯一字段,
        // 即使是跨页面设置,
        // 此处理用来收集所有采集模板
        var cols = Work.queryColumns(this.flow.currentDesigner.steps);
        //修改为支持组合唯一判断
        this.flow.currentTask.uniqueColumnName = "";
        cols.forEach(col => {
            if (col.unique) {
                if (!this.flow.currentTask.uniqueColumnName) {
                    this.flow.currentTask.uniqueColumnName = col.columnName;
                } else {
                    this.flow.currentTask.uniqueColumnName = this.flow.currentTask.uniqueColumnName + "," + col.columnName;
                }
            }
        })
    }

    bindAll() {
        this.$scope.$watch(() => this.step.captures.length, () => this.changeMark());
    }
}