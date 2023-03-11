#!/usr/bin/env python
# coding=utf-8
"""
Author: xiaobin.zhu
since: 2022-09-07 15:23:14
LastAuthor: xiaobin.zhu
LastEditTime: 2022-09-07 15:23:15
Description: write something
FilePath: exportee
Copyright(c):
"""
from random import randint, random
from flask import Flask, Response
from prometheus_client import (
    Counter,
    Gauge,
    Histogram,
    Summary,
    generate_latest,
    CollectorRegistry,
)

app = Flask(__name__)
registry = CollectorRegistry()
counter = Counter(
    "my_counter",
    "an example showed how to use counter",
    ["machine_ip"],
    registry=registry,
)

gauge = Gauge(
    "my_gauge", "an example showed how to use gauge", ["CPU"], registry=registry
)
buckets = (100, 500, 1000)
histogram = Histogram(
    "my_histogram",
    "an example showed how to use histogram",
    ["machine_ip"],
    registry=registry,
    buckets=buckets,
)
summary = Summary(
    "my_summary",
    "an example showed how to use summary",
    ["machine_ip"],
    registry=registry,
)


@app.route("/metrics")
def hello():
    for i in range(1000):
        labels = f"{int(random() * 10)}.{int(random() * 10)}.{int(random() * 10)}.{int(random() * 10)}"
        counter.labels(labels).inc(1)
        gauge.labels(labels).set(int(random() * 100))
        histogram.labels(labels).observe(int(random() * 1000))
        summary.labels(labels).observe(randint(1, 10))
    return Response(generate_latest(registry), mimetype="text/plain")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)  # , debug=True
