//Created by uoto on 16/3/2.
///<reference path="../typings/IStepOption.d.ts" />
import app from "../../base/app";
import {resolve} from "path";

// 步骤配置面板处理器
app.directive('stepOption', function () {
    return {
        template: '<ng-include src="currentStep | ResolveStepConfigTmpUrl"></ng-include>',
        replace: true,
        scope: {
            currentStep: '=option',
            setting: '=setting'
        }
    }
});

// 将步骤的配置转换为模板文件路径
app.filter('ResolveStepConfigTmpUrl', function () {
    return function (step: IStepOption) {
        if (!step) {
            return '';
        }
        return resolve(__dirname,
            `../stepConfigs/${step.behavior}/${step.behavior}.html?id=${step.id}`);
    }
});