# coding=utf-8
# Standard Library
import datetime
import time

# Third Library
import requests

intface = "http://30.4.70.39:8080/fast-crawler/getCrawData?server=iris-task&task=搜狗疾病关键词接口替换&keyword={}&projectId=PROJECT20200417000001&waitForState=2&priority=1"

count = 0
with open(
    r"E:\zhuxiaobin001\code\iris\iris-client\test-webview\test\keyword.txt",
    encoding="utf-8",
) as f:
    data = f.readlines()
    for item in data:
        count = count + 1
        print(item, intface.format(item))
        res = requests.get(intface.format(item.replace("\n", "")))
        if res.status_code == 200:
            print(datetime.datetime.now(), "send success")
        if count % 200 == 0:
            time.sleep(200000)
