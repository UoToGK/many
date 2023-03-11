// Created by uoto on 16/4/13.
//import * as _ from "lodash";
import {module, isFunction, isString, extend} from "angular";
import "angular-electron";
import "../../../node_modules/angular-material/angular-material.min.css";
import "../../../node_modules/material-design-icons-iconfont/dist/material-design-icons.css";
import ngResource = require("angular-resource");
import ngRoute = require("angular-route");
import ngMaterial = require("angular-material");

const base = module('base', [ngResource, ngRoute, ngMaterial, "angular-electron"]);

//虚拟dom元素,递归优化
base.factory('RecursionHelper', function ($compile) {
    return function () {
        return function (element, link) {
            // Normalize the link parameter
            if (_.isFunction(link)) {
                link = {post: link};
            }

            // Break the recursion loop by removing the contents
            var contents = element.contents().remove();
            var compiledContents;
            return {
                pre: (link && link.pre) ? link.pre : null,
                /**
                 * Compiles and re-adds the contents
                 */
                post: function (...args) {
                    var [scope, element] = args;
                    // Compile the contents
                    if (!compiledContents) {
                        compiledContents = $compile(contents);
                    }
                    // Re-add the compiled contents to the element
                    compiledContents(scope, (clone) => {
                        element.append(clone);
                    });

                    // Call the post-linking function, if any
                    if (link && link.post) {
                        link.post(...args);
                    }
                }
            };
        }
    };
});

base.config(function ($httpProvider, $resourceProvider) {
    // var defaults, headers, key, value;
    // defaults = $httpProvider.defaults;
    // headers = defaults.headers;
    // defaults.transformRequest = function (data) {
    //     if (data === void 0) {
    //         return data;
    //     } else {
    //         var param = $.param(angular.fromJson(angular.toJson(data)));
    //         return param.replace(/%5B%5D=/g, '='); //去掉数组的 []
    //     }
    // };
    // value = 'application/x-www-form-urlencoded; charset=UTF-8';
    // key = 'Content-Type';
    // headers.post[key] = value;
    // headers.put[key] = value;
    // headers.patch[key] = value;
    $httpProvider.interceptors.push("SessionTimeout", "GetDeleteMethodNoCache");

    // $resource配置,新增方法put,post,queryList
    const {actions} = $resourceProvider.defaults;
    actions['queryList'] = {method: 'GET', isArray: true};
    actions['put'] = {method: 'PUT'};
    actions['post'] = {method: 'POST'};
});
base.factory('SessionTimeout', function ($q) {
    let logOut = false;
    return {
        response(response){
            const {data} = response;
            if (data && data.success == false && data.errorCode == 401) {
                if (!logOut) {
                    // 用户 session 已经失效
                    data.message && alert(data.message);
                    sessionStorage.clear();
                    location.href = 'index.html';
                }
                logOut = true;
            }

            return response || $q.when(response);
        }
    };
});

base.factory('GetDeleteMethodNoCache', function ($q) {
    return {
        request(request:angular.IRequestConfig){
            const {url, method} = request;
            request.params = request.params || {};
            if (/get|delete/i.test(method) && url.includes('.shtml')) {
                request.params['_'] = Date.now();// 时间戳
            }
            return request;
        }
    };
});
/*module(ngResource).factory('resource', function ($resource) {
    var ref = ['get', 'query', 'queryList', 'delete', 'remove'];
    return function resourceFactory(url, defaultParams, actions, options) {
        var cls = $resource(url, defaultParams, actions, options);

        function merge(m, d) {
            if (angular.isString(m)) {
                m = {[m]: true};
            }
            return angular.extend({}, m, d);
        }

        ref.forEach(function (name) {
            if (cls[name]) {
                var oldFn = cls[name];
                cls[name] = function (a1, a2, a3, a4) {
                    var params, data, success, error;
                    if (!arguments.length) {
                        return oldFn.call(this);
                    }
                    switch (arguments.length) {
                        case 4:
                            error = a4;
                            success = a3;
                        case 3:
                        case 2:
                            if (angular.isFunction(a2)) {
                                if (angular.isFunction(a1)) {
                                    success = a1;
                                    error = a2;
                                    break;
                                }
                                success = a2;
                                error = a3;
                            } else {
                                params = a1;
                                data = a2;
                                success = a3;
                            }
                            break;
                        case 1:
                            if (angular.isFunction(a1)) {
                                success = a1
                            } else {
                                data = a1
                            }
                            break;
                    }

                    return oldFn.call(this, merge(params, data), success, error);
                };
            }
        });

        return cls;
    }
});*/

base.factory('resource', function ($resource) {
    const ref = ['get', 'query', 'queryList', 'delete', 'remove'];
    const ref_body = ['post', 'save', 'patch', 'put', 'postList'];
    return function resourceFactory(url, defaultParams, actions, options) {
        const instance = $resource(url, defaultParams, actions, options);

        ref.forEach(function (name) {
            if (instance[name]) {
                instance[name] = transformFactory(instance[name], false);
            }
        });

        ref_body.forEach(function (name) {
            if (instance[name]) {
                instance[name] = transformFactory(instance[name], true);
            }
        });

        function transformFactory(fn, isBody) {
            return function handle(a1, a2, a3, a4) {
                let _str = false;
                if (isString(a1)) { // 处理  Server.get('params'); 情况
                    a1 = {[a1]: true};
                    _str = true;
                }

                let params = {};
                let data = {};
                let success: any = () => {
                };
                let error: any = () => {
                };
                switch (arguments.length) {
                    case 4:
                        success = a3;
                        error = a4;
                    case 3:
                    case 2:
                        if (isFunction(a2)) {
                            if (isFunction(a1)) {
                                success = a1;
                                error = a2;
                                break;
                            }
                            success = a2;
                            error = a3;
                        } else {
                            params = a1;
                            data = a2;
                            success = a3;
                            break;
                        }
                    case 1:
                        if (isFunction(a1)) {
                            success = a1;
                        } else if (!_str && isBody) {
                            data = a1;
                        } else {
                            params = a1;
                        }
                        break;
                    case 0:
                        break;
                }

                if (isBody) {
                    return fn.call(this, params, data, success, error);
                }
                return fn.call(this, extend(params, data), success, error);
            }
        }

        return instance;
    }
});