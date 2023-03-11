#!/usr/bin/env python
# coding=utf-8
"""
Author: UoToGK 
LastEditors: UoToGK
Date: 2022-05-17 16:40:21
LastEditTime: 2022-05-19 14:32:11
FilePath: url2pdf.py
Description:  有时候有些资源会被删除，想及时记录下来
将一个网页转化成pdf
pdf_file=url2pdf(url,css_selector)
支持css
Copyright (c) 2022 by DyTheme, All Rights Reserved. 
"""

# Standard Library
import os
import sys
import time
from urllib.request import urlopen  # 用于获取网页

# Third Library
import pdfkit
import requests
from bs4 import BeautifulSoup  # 用于解析网页
from spider.tools.lib.utils import (
    debug_p,
    get_random_headers,
    logger,
    parse_headers,
    validate_file_name,
)

head = """
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9
Accept-Encoding: gzip, deflate, br
Accept-Language: zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6,mt;q=0.5
Cache-Control: max-age=0
Connection: keep-alive
Cookie: htVC_2132_connect_is_bind=0; htVC_2132_smile=1D1; KF4=Ul3l7e; htVC_2132_ignore_rate=1; __gads=ID=ed4b91fb8abe297e-22a12f156cd200e9:T=1650717760:RT=1650717760:S=ALNI_MZSWvY-bAYdO2hBT8rlrzjxPIdoYw; htVC_2132_saltkey=S2VKQMqM; htVC_2132_lastvisit=1650974830; htVC_2132_atarget=1; htVC_2132_auth=a87f6b8alHR3GctUiqhttvBmVdyb1gTSsueQ3UQ3kEF6XD07Qst8LtM%2Bj06z6IRihKXKGRK9INM8MxFhel9u3wTJ%2FCtF; htVC_2132_collapse=_forum_rules_16_; htVC_2132_widthauto=1; htVC_2132_sid=0; htVC_2132_ttask=1670276%7C20220518; htVC_2132_noticonf=1670276D1D3_3_1; Hm_lvt_46d556462595ed05e05f009cdafff31a=1652603475,1652620375,1652692469,1652859379; htVC_2132_ulastactivity=1652877703%7C0; htVC_2132_visitedfid=66D16D41D10D13; htVC_2132_st_t=1670276%7C1652877708%7C4b65dbea81cd520f127d30f7c8bfaf0f; htVC_2132_forum_lastvisit=D_2_1650166040D_5_1650631575D_24_1651426312D_4_1652268937D_32_1652268949D_10_1652590170D_41_1652620639D_16_1652877703D_66_1652877708; htVC_2132_viewid=tid_1637226; htVC_2132_checkpm=1; htVC_2132_st_p=1670276%7C1652878349%7Ce5ed140e86a8127a7fe71b5e4b949adb; htVC_2132_lastact=1652878350%09home.php%09spacecp; htVC_2132_lastcheckfeed=1670276%7C1652878350; htVC_2132_checkfollow=1; Hm_lpvt_46d556462595ed05e05f009cdafff31a=1652878371; _dd_s=logs=1&id=739a1944-ee53-46ce-8a5d-20c69cfe4e02&created=1652877724724&expire=1652879271104
DNT: 1
Host: www.52pojie.cn
Referer: https://www.52pojie.cn/forum-66-1.html
sec-ch-ua: " Not A;Brand";v="99", "Chromium";v="101", "Google Chrome";v="101"
sec-ch-ua-mobile: ?0
sec-ch-ua-platform: "Windows"
Sec-Fetch-Dest: document
Sec-Fetch-Mode: navigate
Sec-Fetch-Site: same-origin
Sec-Fetch-User: ?1
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36
"""
"""
    path='C:/yyy/yyy_data/'
    >>> print(os.path.join(path,'/abc'))
    C:/abc
    >>> print(os.path.join(path,'abc'))
    C:/yyy/yyy_data/abc
"""
dirname, filename = os.path.split(os.path.abspath(__file__))
wkhtmltopdf = os.path.join(dirname, "wkhtmltox\\bin\\wkhtmltopdf.exe")
# print(dirname,wkhtmltopdf)
def get_content(url, css_selector="html"):
    """
    解析URL，获取需要的html内容
    :param url: 目标网址
    :return: html
    """
    try:
        res = requests.get(url, timeout=10, headers=parse_headers(head), verify=False)
        if res.status_code == 200:
            html = res.content
            soup = BeautifulSoup(html, "html.parser")
            title = soup.title.string  # 结果是 unicode 字符
            title = validate_file_name(title)
            content = soup.select_one(css_selector)
            return content, title
    except ConnectionError:
        debug_p("ConnectionError Error")
    except Exception as e:
        debug_p(e)


def save_pdf(html, filename):
    """
    把所有html文件保存到pdf文件
    :param html:  html内容
    :param file_name: pdf文件名
    :return:
    """
    options = {
        "page-size": "Letter",
        "margin-top": "0.75in",
        "margin-right": "0.75in",
        "margin-bottom": "0.75in",
        "margin-left": "0.75in",
        "encoding": "UTF-8",
        "custom-header": [("Accept-Encoding", "gzip")],
        "cookie": [
            ("cookie-name1", "cookie-value1"),
            ("cookie-name2", "cookie-value2"),
        ],
        "outline-depth": 10,
    }

    # 配置 wkhtmltopdf.exe 位置
    # 这里指定一下wkhtmltopdf的路径，这就是我为啥在前面让记住这个路径
    # download wkhtmltopdf.exe   https://wkhtmltopdf.org/downloads.html
    # 可能存在的错误是路径存在特殊字符导致无法写入pdf

    config = pdfkit.configuration(wkhtmltopdf=wkhtmltopdf)
    if not os.path.exists(filename):
        try:
            pdfkit.from_string(
                str(html), filename, configuration=config, options=options
            )
        except Exception as identifier:
            # Standard Library
            import traceback

            print(traceback.format_exc())
            debug_p(identifier)
    else:
        debug_p("file already exists")


if __name__ == "__main__":
    url = input("输入一个url")
    css_selector = "html"
    save_pdf(*get_content(url, css_selector))
