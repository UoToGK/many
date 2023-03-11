#!/usr/bin/env python
# coding=utf-8
"""
Author: xiaobin.zhu
since: 2022-09-09 08:34:09
LastAuthor: xiaobin.zhu
LastEditTime: 2022-09-09 08:35:40
Description: write something
FilePath: log_metrics
"""

import tornado
import tornado.ioloop
import tornado.web
import tornado.gen
from datetime import datetime
from log_monitor import Monitor

global g_monitor


class ClassifierHandler(tornado.web.RequestHandler):
    def post(self):
        # TODO Something you need
        # work....
        # 统计Summary，包括请求次数和每次耗时
        g_monitor.set_prometheus_request_summary(self)
        self.write("OK")


class PingHandler(tornado.web.RequestHandler):
    def head(self):
        print("INFO", datetime.now(), "/ping Head.")
        g_monitor.set_prometheus_request_summary(self)
        self.write("OK")

    def get(self):
        print("INFO", datetime.now(), "/ping Get.")
        g_monitor.set_prometheus_request_summary(self)
        self.write("OK")


class MetricsHandler(tornado.web.RequestHandler):
    def get(self):
        print("INFO", datetime.now(), "/metrics Get.")
        g_monitor.set_prometheus_request_summary(self)
        # 通过Metrics接口返回统计结果
        g_monitor.get_prometheus_metrics_info(self)


settings = {
    "debug": True,
}


def make_app():
    return tornado.web.Application(
        [
            (r"/ping?", PingHandler),
            (r"/metrics?", MetricsHandler),
            (r"/work?", ClassifierHandler),
        ],
        **settings
    )


if __name__ == "__main__":
    g_monitor = Monitor()
    port = 4545
    app = make_app()
    app.listen(port)
    tornado.ioloop.IOLoop.current().start()
