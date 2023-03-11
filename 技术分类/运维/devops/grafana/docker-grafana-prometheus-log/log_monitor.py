#!/usr/bin/env python
# coding=utf-8
"""
Author: xiaobin.zhu
since: 2022-09-09 08:30:14
LastAuthor: xiaobin.zhu
LastEditTime: 2022-09-09 08:30:15
Description: write something
FilePath: log_monitor
"""
from prometheus_client import Counter, Gauge, Summary
from prometheus_client.core import CollectorRegistry
from prometheus_client.exposition import choose_encoder


class Monitor:
    def __init__(self):
        # 注册收集器&最大耗时map
        self.collector_registry = CollectorRegistry(auto_describe=False)
        self.request_time_max_map = {}

        # 接口调用summary统计
        self.http_request_summary = Summary(
            name="http_server_requests_seconds",
            documentation="Num of request time summary",
            labelnames=("method", "code", "uri"),
            registry=self.collector_registry,
        )
        # 接口最大耗时统计
        self.http_request_max_cost = Gauge(
            name="http_server_requests_seconds_max",
            documentation="Number of request max cost",
            labelnames=("method", "code", "uri"),
            registry=self.collector_registry,
        )

        # 请求失败次数统计
        self.http_request_fail_count = Counter(
            name="http_server_requests_error",
            documentation="Times of request fail in total",
            labelnames=("method", "code", "uri"),
            registry=self.collector_registry,
        )

        # 模型预测耗时统计
        self.http_request_predict_cost = Counter(
            name="http_server_requests_seconds_predict",
            documentation="Seconds of prediction cost in total",
            labelnames=("method", "code", "uri"),
            registry=self.collector_registry,
        )
        # 图片下载耗时统计
        self.http_request_download_cost = Counter(
            name="http_server_requests_seconds_download",
            documentation="Seconds of download cost in total",
            labelnames=("method", "code", "uri"),
            registry=self.collector_registry,
        )

    # 获取/metrics结果
    def get_prometheus_metrics_info(self, handler):
        encoder, content_type = choose_encoder(handler.request.headers.get("accept"))
        handler.set_header("Content-Type", content_type)
        handler.write(encoder(self.collector_registry))
        self.reset_request_time_max_map()

    # summary统计
    def set_prometheus_request_summary(self, handler):
        self.http_request_summary.labels(
            handler.request.method, handler.get_status(), handler.request.path
        ).observe(handler.request.request_time())
        self.set_prometheus_request_max_cost(handler)

    # 自定义summary统计
    def set_prometheus_request_summary_customize(self, method, status, path, cost_time):
        self.http_request_summary.labels(method, status, path).observe(cost_time)
        self.set_prometheus_request_max_cost_customize(method, status, path, cost_time)

    # 失败统计
    def set_prometheus_request_fail_count(self, handler, amount=1.0):
        self.http_request_fail_count.labels(
            handler.request.method, handler.get_status(), handler.request.path
        ).inc(amount)

    # 自定义失败统计
    def set_prometheus_request_fail_count_customize(
        self, method, status, path, amount=1.0
    ):
        self.http_request_fail_count.labels(method, status, path).inc(amount)

    # 最大耗时统计
    def set_prometheus_request_max_cost(self, handler):
        requset_cost = handler.request.request_time()
        if self.check_request_time_max_map(handler.request.path, requset_cost):
            self.http_request_max_cost.labels(
                handler.request.method, handler.get_status(), handler.request.path
            ).set(requset_cost)
            self.request_time_max_map[handler.request.path] = requset_cost

    # 自定义最大耗时统计
    def set_prometheus_request_max_cost_customize(
        self, method, status, path, cost_time
    ):
        if self.check_request_time_max_map(path, cost_time):
            self.http_request_max_cost.labels(method, status, path).set(cost_time)
            self.request_time_max_map[path] = cost_time

    # 预测耗时统计
    def set_prometheus_request_predict_cost(self, handler, amount=1.0):
        self.http_request_predict_cost.labels(
            handler.request.method, handler.get_status(), handler.request.path
        ).inc(amount)

    # 自定义预测耗时统计
    def set_prometheus_request_predict_cost_customize(
        self, method, status, path, cost_time
    ):
        self.http_request_predict_cost.labels(method, status, path).inc(cost_time)

    # 下载耗时统计
    def set_prometheus_request_download_cost(self, handler, amount=1.0):
        self.http_request_download_cost.labels(
            handler.request.method, handler.get_status(), handler.request.path
        ).inc(amount)

    # 自定义下载耗时统计
    def set_prometheus_request_download_cost_customize(
        self, method, status, path, cost_time
    ):
        self.http_request_download_cost.labels(method, status, path).inc(cost_time)

    # 校验是否赋值最大耗时map
    def check_request_time_max_map(self, uri, cost):
        if uri not in self.request_time_max_map:
            return True
        if self.request_time_max_map[uri] < cost:
            return True
        return False

    # 重置最大耗时map
    def reset_request_time_max_map(self):
        for key in self.request_time_max_map:
            self.request_time_max_map[key] = 0.0
