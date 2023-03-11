#!/usr/bin/env python
# coding=utf-8
"""
Author: UoToGK 
LastEditors: UoToGK
Date: 2022-04-16 21:32:37
LastEditTime: 2022-08-11 20:34:45
FilePath: mm.py
Description: 麻麻微视频 爬虫
 python 操作xlwt 生成excel
Copyright (c) 2022 by DyTheme, All Rights Reserved. 
"""

# Standard Library
import time

# Third Library
import requests
import xlwt
from bs4 import BeautifulSoup

# dir_path=os.getcwd()
# filename=os.path.join(dir_path, 'file')
# data = xlrd.open_workbook(filename)
# sheet_name=data.sheet_names()[0]
# table=data.sheet_by_name(sheet_name)
# arg1=table.row(0)[11].value

start = "http://m.mama.cn/index.php?g=Wap&a=Index&d=hotReviewAjax&page={}&rnd=0.24716686723770298"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36",
    "referer": "http://m.mama.cn/",
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
}
#  .decode("unicode-escape",'ignore')
#
book_name_xlsx = "mama_site.xlsx"
f = xlwt.Workbook()
ws = f.add_sheet("sheet1", cell_overwrite_ok=True)
key_sec = "#J_floorNav"
filter_key = ["索引", "麻麻微视频"]
p_sec = "div.detail-mod.J_floor"
title_sec = "div.detail-title.J_floor>h1"
summary_sec = "div.detail-summary"
row = 0
for num in range(2, 390, 1):
    time.sleep(0.5)
    url = start.format(num)
    print(num, url)
    res = requests.get(url, headers=headers).json()
    for item in res:
        wrap_url = item["url"]
        print("wrap_url", wrap_url)
        if "brandbase" in wrap_url:
            continue
        if "http://" not in wrap_url:
            continue
        if not wrap_url.startswith("http://"):
            continue
        res = requests.get(wrap_url, headers=headers).text
        time.sleep(0.5)
        bs = BeautifulSoup(res, "lxml")

        try:
            if bs.select(key_sec):
                title = bs.select(title_sec)[0].text
                print(title)
                summary = bs.select(summary_sec)[0].text
                content = ""
                p_list = bs.select(p_sec)
                print(row, title)
                ws.write(row, 0, title)
                ws.write(row, 1, summary)
                content_arr = []
                for p in p_list:
                    try:
                        p1 = p.select(".mod-title")[0].text
                        p_detail = p.select(" div:nth-child(2)")[0].text
                        content = p1 + ":" + "\n" + p_detail + "\n"
                        content_arr.append(content)
                    except:
                        print("inner1 error")
                        content = p1 + ":" + "\n" + p_detail + "\n"
                        content_arr.append(content)
                count = 2
                for cc in content_arr:
                    ws.write(row, count, cc)
                    count = count + 1
                    print(row, count)
                row = row + 1
        except PermissionError:
            f.save(book_name_xlsx)
            continue
        except ConnectionError as e:
            print("ConnectionError")
            continue
        except TimeoutError:
            print("TimeoutError")
            continue
        except Exception as e:
            print("outer error", e)
            continue
        except KeyboardInterrupt:
            print("KeyboardInterrupt")
            continue

f.save(book_name_xlsx)
