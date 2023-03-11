"""
===================================================
    -*- coding:utf-8 -*-
    FileName   :parase_data.py
====================================================
"""
# Standard Library
import hashlib
import json
import math
import os
import random
import re
import time
import warnings
from decimal import Decimal

# Third Library
import requests
from lxml import etree

warnings.filterwarnings("ignore")
"""
class Get_real_play_addr(object):
    def __init__(self):
        self.request_url = 'http://3g.gljlw.com/diy/ttxs_dy2.php?'
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36'
        }
    def parase_play_addr(self, url):
        paly_url = ''
        r = str(random.random())[2:]
        s = hashlib.md5((url + '@&^' + r).encode()).hexdigest()
        params = { 'url': url, 'r': r, 's': s }
        try:
            response = requests.get(url = self.request_url, headers = self.headers, params = params)
            if response.status_code == 200:
                content = response.content.decode('utf-8')
                html = etree.HTML(content)
                paly_url = html.xpath('//source/@src')[0]
                if paly_url:
                    return paly_url
        except:
            print("network error cannot parase play_addr...")
            return None
"""
# 打开protobuf文件，用正则表达式匹配出所有的分享链接地址
class Get_url_from_protobuf(object):
    def __init__(self):
        self.pat = r"(?<=\")https://www.iesdouyin.com/share/video/.*(?=\")"
        self.command = r" --decode_raw <"

    def get_url(self, exe_path, file_path):
        try:
            fp = os.popen(exe_path + self.command + file_path)
            if fp:
                src = fp.read()
                fp.close()
                url_list = re.findall(self.pat, src)
                url_list = set(url_list)
                return url_list
        except:
            print("decode protobuf failed...")
            return None


def get_local_time(create_time):
    time_local = time.localtime(int(create_time))
    pub_date = time.strftime("%Y-%m-%d", time_local)
    return pub_date


# 获取分享视频的下载地址
def Get_real_play_addr_by_web(aweme_id):
    headers = {
        "User-Agent": "Mozilla/5.0 (Linux; Android 6.0; ZTE BA520 Build/MRA58K; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/55.0.2883.77 Mobile Safari/537.36"
    }
    api_url = (
        "https://www.iesdouyin.com/web/api/v2/aweme/iteminfo/?item_ids=" + aweme_id
    )
    response = requests.get(url=api_url, headers=headers, verify=False)
    if response.status_code == 200:
        response_json = response.json()
        play_addr = response_json["item_list"][0]["video"]["play_addr"]["url_list"][0]
        create_time = response_json["item_list"][0]["create_time"]
        create_time = get_local_time(create_time)
        play_addr = play_addr.replace("playwm", "play", 1)

        print("成功获取地址", play_addr, response_json)
        # 返回下载地址和视频的发布时间
        return (play_addr, create_time)
    return None, None


def Get_file_size(e):
    if e <= 0:
        return ""
    t = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    n = math.floor(math.log2(e) / math.log2(1024))
    return str(Decimal(e / math.pow(1024, n)).quantize(Decimal("0.00"))) + t[n]


# 'https://www.iesdouyin.com/share/video/6854870744690625805/?region=CN&mid=6854870758414781191'
# print(Get_real_play_addr_by_web("6854870744690625805"))
