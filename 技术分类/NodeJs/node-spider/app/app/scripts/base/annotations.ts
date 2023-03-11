// Created by uoto on 16/4/13.
import app from "./app";
import _ = require('lodash');
import requireAll = require("requireall");
//运行
export function BeforeRun(target) {
    app.run(target);
}

//config
export function BeforeConfig(target) {
    app.config(target);
}

/**
 * 路由配置参数
 * @prop {string} route 路由名称
 * @prop {string} templateUrl 模板路径
 * @prop {string|function} controller 控制器名称,可选,如果不填,默认读取标注的class的名字
 * @prop {string} controllerAs 控制器别名,可选
 */
interface RouteOption {
    route:string,
    templateUrl:string,
    controller?:string,
    controllerAs?:string
}

//设置路由
export function Route(option:RouteOption) {
    return function (target) {
        if (!option.controller) {
            option.controller = target.name;
        }
      
        // console.log(target.name)
        app.config(function ($routeProvider) {
            $routeProvider.when(option.route, option);
        });
    }
}

//设置为controller
export function Controller(strOrFunc):any {
    if (_.isString(strOrFunc)) {
        return function (target) {
            app.controller(strOrFunc, target);
        }
    } else if (_.isFunction(strOrFunc)) {
        app.controller(strOrFunc.name, strOrFunc);
    } else {
        throw Error("@Controller 必须标注在 function or Class");
    }
}
