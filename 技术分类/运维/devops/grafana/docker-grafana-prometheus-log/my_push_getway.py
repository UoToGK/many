#!/usr/bin/env python
# coding=utf-8
"""
Author: xiaobin.zhu
since: 2022-09-08 08:31:43
LastAuthor: xiaobin.zhu
LastEditTime: 2022-09-08 08:31:45
Description: write something
FilePath: my_push_getway
Copyright(c):
"""

import time
import requests
import json
from datetime import datetime
import socket
from prometheus_client import CollectorRegistry, Gauge, push_to_gateway

# 获取配置信息
pushAddress = "http://localhost:9091"
statusField = "status"
# flink任务正常运行的canal实例接口
flinkJobUrl = "http://localhost:8199/data/getCanalTaskInstance"
metrics_help = "flink_job_running_status and kafka and canal"
job = "flink_job"
name = "flink_job_running_status_test1"

print("本机ip为：", socket.gethostbyname(socket.gethostname()))

start0 = datetime.now()
# 根据接口获取label数据
try:
    response2 = requests.get(flinkJobUrl)
    flinkJobs = json.loads(response2.text)
    jobInfos = flinkJobs.get("data")
    print("共采集flinkJobs数：", len(jobInfos))
except Exception as e:
    print("flink任务canal任务实例获取失败")
print("获取数据耗时：", (datetime.now() - start0).seconds)


# label实体类
class CustomerLabel:
    def __init__(
        self,
        jobId,
        jobName,
        destination,
        topic,
        sinkType,
        datasourceName,
        dbName,
        creator,
        createTime,
        status,
    ):
        self.jobId = jobId
        self.jobName = jobName
        self.destination = destination
        self.topic = topic
        self.sinkType = sinkType
        self.datasourceName = datasourceName
        self.dbName = dbName
        self.creator = creator
        self.createTime = createTime
        self.status = status


# 构造metrics数据
def push_metrics_gateway(url, job, metricsName, helps):
    registry = CollectorRegistry()
    labels = [
        "jobId",
        "jobName",
        "destination",
        "topic",
        "sinkType",
        "datasourceName",
        "dbName",
        "creator",
        "createTime",
    ]
    labelObj = set()
    start1 = datetime.now()
    for data in jobInfos:
        label = CustomerLabel(
            data["job_id"],
            data["job_name"],
            data["destination"],
            data["topic"],
            data["sink_type"],
            data["datasource_name"],
            data["db_name"],
            data["creator"],
            data["create_time"],
            data[statusField],
        )
        labelObj.add(label)
    gau = Gauge(metricsName, helps, labels, registry=registry)
    print("构造数据耗时：", (datetime.now() - start1).seconds)
    start2 = datetime.now()
    for obj in labelObj:
        gau.labels(
            obj.jobId,
            obj.jobName,
            obj.destination,
            obj.topic,
            obj.sinkType,
            obj.datasourceName,
            obj.dbName,
            obj.creator,
            obj.createTime,
        ).set(int(obj.status))
        push_to_gateway(url, job=job, registry=registry, timeout=20)
    print("推送数据耗时：", (datetime.now() - start2).seconds)


# 推送数据到网关
try:
    print(time.strftime("%Y-%m-%d %H:%M:%S", time.localtime()) + "开始推送数据到Prometheus网关")
    push_metrics_gateway(pushAddress, job, name, metrics_help)
    print(
        time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
        + "metrics push gateway successfully"
    )
except Exception as e:
    print(
        time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
        + " : metrics push gateway exception"
    )
