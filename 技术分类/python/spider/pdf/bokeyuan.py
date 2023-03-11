"""
Author: UoToGK
LastEditors: UoToGK
Date: 2021-09-25 07:38:51
LastEditTime: 2022-05-17 18:04:19
description:  python 生成pdf
Copyright(c): DyTheme
"""
# Standard Library
import os

# import sys

# python 导包找不到路径终极解决办法 ModuleNotFoundError: No module named ‘xxx
# https://blog.csdn.net/x1131230123/article/details/119543203
# import sys,re,os
import time
from urllib.request import urlopen  # 用于获取网页

# Third Library
# import collections
import pdfkit

# from PyPDF2 import utils, PdfFileReader, PdfFileWriter
import requests
from bs4 import BeautifulSoup  # 用于解析网页
from spider.tools.lib.utils import random_headers, validate_file_name

# import subprocess
# import shutil
headers = random_headers


def get_content(url):
    """
    解析URL，获取需要的html内容
    :param url: 目标网址
    :return: html
    """
    # print(url)
    try:
        res = requests.get(url, timeout=1, headers=headers)
        if res.status_code == 200:

            html = res.content
            soup = BeautifulSoup(html, "html.parser")
            container = soup.select("#content_views")
            content = container[0]
            return str(content)
    except ConnectionError:
        print("ConnectionError Error")
    except Exception as e:
        print("Exception Error")


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
    config = pdfkit.configuration(wkhtmltopdf=r"F:\project\myblog\spider\pdf\wkhtmltox\bin\wkhtmltopdf.exe")
    if not os.path.exists(filename):
        try:
            pdfkit.from_string(html, filename, configuration=config, options=options)
        except Exception as identifier:
            print(identifier)
    else:
        print("file already exists")


def main():
    url = "https://blog.csdn.net/dm_vincent/category_2496171.html"
    # Standard Library
    from urllib.parse import urlparse

    host = urlparse(url).hostname
    html = urlopen(url)
    bsObj = BeautifulSoup(html, "html.parser")
    selector = "#column > ul > li > a"
    title_sec = "div.column_article_title > h2"
    all_links = bsObj.select(selector)
    print("total:", len(all_links))
    dirs = os.getcwd() + "/pdfs/{}/angularjs_code解读/".format(host)
    if os.path.exists(dirs):
        print("dirs already exists")
    else:
        os.makedirs(dirs)
    for item in all_links:
        href = item["href"]
        index = all_links.index(item)
        print((index))
        title = item.select_one(title_sec).get_text()
        filename = "{}.pdf".format(title)
        filename = dirs + validate_file_name(filename)
        if os.path.exists(filename):
            continue
        else:
            pass
        print(href, filename)
        content = get_content(href)
        save_pdf(content, filename)
        time.sleep(1)


if __name__ == "__main__":
    main()
