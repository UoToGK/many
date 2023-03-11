// Created by uoto on 16/4/13.
import app from "./app";
var config = require("../../resource/config.yaml");
var collectorConfig=require("../../resource/collector.yaml");
// app.factory("DataStorage", function (resource) {
//     return resource(`${config.rest_server}/dataStorage.shtml`);
// });
// 流程设计
app.factory('flow', function () {
    return {
        currentStep: null,
        currentDesigner: null,
        locals: {},
        currentTask:{}
    };
});

app.value('SysVar', {
    // 最大允许运行
    maxRunSize:  collectorConfig.capacity || config.defaultRunSize,
    ip: localStorage.getItem('ip') || collectorConfig.ip,
    capacity: collectorConfig.capacity,
    name: localStorage.getItem('name') || collectorConfig.name,
    token: collectorConfig.token,
    cluster: localStorage.getItem('cluster') || collectorConfig.cluster,
    collectorType: collectorConfig.collectorType,
    collectorTaskTypes: collectorConfig.collectorTaskTypes
});

//数据采集的存储
app.factory("DataStorage", function (resource) {
    return resource(`${config.rest_server}/dataStorage.shtml`);
})

// 任务管理
app.factory("TaskManage", function ($resource) {
    var url = `${config.web_api_host}/api/v1/task/:opt/:taskId`;
    var task = $resource(url,{},{
        // save:{
        //     method:'POST',
        //     isArray:false,
        //     headers: {
        //         'Content-Type': 'application/json'
        //     }
        // }
    });
    task.getURL = function () {
        return url;
    };
    return task;
});

// 任务模板字段
app.factory("TemplateColumnManage", function ($resource) {
    return $resource(`${config.web_api_host}/api/v1/column/:opt/:templateId`);
});

// 任务模板字段
app.factory("TaskGroupInfoManage", function ($resource) {
    return $resource(`${config.web_api_host}/api/v1/monitor/:method`, {method: '@method'});
});

//保存模板
app.factory("TemplateManage", function ($resource) {
    return $resource(`${config.web_api_host}/api/v1/template/:opt/:projectId`);
});

// 任务模板字段
app.factory("ProjectManage", function ( $resource) {
    return $resource(`${config.web_api_host}/api/v1/project/:opt/:userId`);
});
// 计划管理
app.factory("PlanManage", function (resource) {
    return resource(`${config.web_api_host}/`);
});

// 数据管理
app.factory("DataManage", function (resource) {
    return resource(`${config.web_api_host}/data.shtml`);
});

// 任务批次
app.factory("TaskBatch", function (resource) {
    return resource(`${config.web_api_host}/taskBatch.shtml`);
});

// 采集申请
app.factory("CollectionApplyService", function (resource) {
    return resource(`${config.pingan_api_host}/collectionApplication.shtml`);
});

// 采集端监控
app.factory("CollectorService", function (resource) {
    return resource(`${config.ctrl_server}/_cmonitor.shtml`);
});

// 查看每个子任务的情况
app.factory("getTaskInfo", function ($resource) {
    return $resource(`${config.web_api_host}/api/v1/monitor/:method`, {method: '@method'});
});

// 查看每个子的执行情况
app.factory("getBatchInfo", function ($resource) {
    return $resource(`${config.web_api_host}/api/v1/monitor/getBatchInfo`);
});
//计划批次监控
app.factory("planBatchMonitorServer", function (resource) {
    return resource(`${config.web_api_host}/planBatchMonitor.shtml`);
});
//计划批次任务详情查看
app.factory("batchTaskServer", function (resource) {
    return resource(`${config.web_api_host}/batchTask.shtml`);
});
//代理管理模块
app.factory("proxyManage", function (resource) {
    return resource(`${config.web_api_host}/api/v1/proxy/:opt`);
});

//代理查询
app.factory("proxyServer", function (resource) {
    return resource(`${config.web_api_host}/proxySelect.shtml`);
});
//proxy_api
app.factory("planMonitorServer", function (resource) {
    return resource(`${config.web_api_host}/api/v1/plan`);
});

app.factory("CollectorProxyService", function (resource) {
    return resource(`${config.proxy_api}/getProxy`);
 //   return resource(`${config.ctrl_server}/proxy.shtml`);
});
app.factory("emailSettingServer", function (resource) {
    return resource(`${config.web_api_host}/emailSetting.shtml`);
});

