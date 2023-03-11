"""
Author: UoToGK
LastEditors: DyTheme
Date: 2021-09-25 17:03:07
LastEditTime: 2021-09-25 17:35:21
description: 已经失效
Copyright(c): DyTheme
"""
# Standard Library
import time
import urllib.request

# Third Library
from lxml import etree


def get_url(url, nums):  # 国内高匿代理的链接
    url_list = []
    for i in range(1, nums):
        url_new = url + str(i)
        url_list.append(url_new)
    return url_list


def get_content(url):  # 获取网页内容
    user_agent = "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.22 Safari/537.36 SE 2.X MetaSr 1.0"
    headers = {"User-Agent": user_agent}
    req = urllib.request.Request(url=url, headers=headers)
    res = urllib.request.urlopen(req)
    content = res.read()
    return content.decode("utf-8")


def get_info(content):  # 提取网页信息 / ip 端口
    datas_ip = etree.HTML(content).xpath(
        '//table[contains(@id,"ip_list")]/tr/td[2]/text()'
    )
    datas_port = etree.HTML(content).xpath(
        '//table[contains(@id,"ip_list")]/tr/td[3]/text()'
    )
    with open("daili.txt", "a") as fd:
        for i in range(0, len(datas_ip)):
            out = ""
            out += "" + datas_ip[i]
            out += ":" + datas_port[i]
            fd.write(out + "\n")  # 所有ip和端口号写入data文件


def verif_ip(ip, port):  # 验证ip有效性
    user_agent = "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.22 Safari/537.36 SE 2.X MetaSr 1.0"
    headers = {"User-Agent": user_agent}
    proxy = {"http": "http://%s:%s" % (ip, port)}
    print(proxy)

    proxy_handler = urllib.request.ProxyHandler(proxy)
    opener = urllib.request.build_opener(proxy_handler)
    urllib.request.install_opener(opener)

    test_url = "https://www.baidu.com/"
    req = urllib.request.Request(url=test_url, headers=headers)
    time.sleep(6)
    try:
        res = urllib.request.urlopen(req)
        time.sleep(3)
        content = res.read()
        if content:
            print("that is ok")
            with open("ip_pool.txt", "a") as fd:  # 有效ip保存到ip_pool文件
                fd.write(ip + ":" + port)
                fd.write("\n")
        else:
            print("its not ok")
    except urllib.request.URLError as e:
        print(e.reason)
