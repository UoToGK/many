#!/usr/bin/env python
# coding=utf-8
"""
Author: UoToGK 
LastEditors: UoToGK
Date: 2022-05-15 16:55:05
LastEditTime: 2022-05-15 16:55:16
FilePath: MKSpider.py
Description: 爬取漫画
Copyright (c) 2022 by DyTheme, All Rights Reserved. 
"""

# Standard Library
import json
import os
import re
import shutil
import threading
import time
from queue import Queue

# Third Library
import requests
from lxml import etree


class MKSpider:
    def __init__(self):
        self.search_url = "https://www.mkzhan.com/search/?keyword={}"
        self.per_chapter_url = "https://comic.mkzcdn.com/chapter/?comic_id={}"
        self.chapter_url = "https://www.mkzhan.com/{}/{}.html"
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36"
        }
        self.cid = None
        self.cid_list = []
        self.cartoons_dict = None
        self.cartoon_name = None
        self.chapter_queue = Queue()
        self.title_image_queue = Queue()
        self.image_queue = Queue()

    # 获取搜索的漫画id
    def search_cartoon(self):
        cartoon_name = input("请输入漫画名称(exit:退出程序):")
        if cartoon_name.lower() == "exit":
            exit()
        response = requests.get(
            self.search_url.format(cartoon_name), headers=self.headers
        ).content.decode()
        # 判断是否存在
        search_count = re.search(
            '<div class="search-page-wr" data-count="(\d+)">', response
        ).group(1)
        if search_count == "0":
            print("很遗憾，您搜索的内容暂时没有找到，我们为您推荐了以下漫画~")
        else:
            print("“{}”---搜索结果{}个".format(cartoon_name, search_count))
        data_cid_list = re.findall(
            '<div class="common-comic-item" data-cid="(\d+)">', response
        )
        title_list = re.findall(
            '<p class="comic__title"><a href=".*?">(.+)</a></p>', response
        )  # 哆啦A梦   海贼王   绝色医妃
        self.cartoons_dict = {}
        print("id为漫画id,title为漫画名称")
        for cid in data_cid_list:
            self.cartoons_dict[cid] = title_list[data_cid_list.index(cid)]
            print("id:{}, title:{}".format(cid, title_list[data_cid_list.index(cid)]))
        while True:
            cid = input("请输入需要下载的漫画id(exit:退出程序, 110:重新选择下载的漫画):")
            if cid in self.cartoons_dict.keys():
                self.cid = cid
                self.cartoon_name = self.cartoons_dict[cid]
                if os.path.exists(self.cartoon_name):
                    shutil.rmtree(self.cartoon_name)
                os.mkdir(self.cartoon_name)
                break
            elif cid == "110":
                self.search_cartoon()
                break
            elif cid.lower() == "exit":
                exit()
            else:
                print("输入有误,请重新输入!!!")

    # 获取漫画章节
    def get_cartoon_chapter(self):
        response = requests.get(
            self.per_chapter_url.format(self.cid), headers=self.headers
        ).content.decode()
        chapter_list = json.loads(response)["data"]
        chapter_id_list = []
        for chapter in chapter_list:
            chapter_id_list.append(chapter["chapter_id"])
        # print(chapter_id_list)
        print("-" * 24 + "总共有%s章节" % len(chapter_id_list) + "-" * 24)
        self.chapter_queue.put(chapter_id_list)

    # 获取图片数据
    def get_image_data(self):
        while True:
            title, img_list = self.title_image_queue.get()
            print("*" * 10 + "正在获取  {}  页面的图片数据".format(title) + "*" * 10)
            i = 1
            for img_url in img_list:
                img_data = requests.get(img_url, headers=self.headers).content
                self.image_queue.put([title, i, img_data])
                i += 1
            self.title_image_queue.task_done()

    # 获取每章的图片地址
    def title_image_url(self):
        while True:
            chapter_id_list = self.chapter_queue.get()
            for chapter_id in chapter_id_list:
                response = requests.get(
                    self.chapter_url.format(self.cid, chapter_id), headers=self.headers
                ).content.decode()
                html = etree.HTML(response)
                img_list = html.xpath('//img[@class="lazy-read"]/@data-src')
                title = html.xpath('//a[@class="last-crumb"]/text()')[0]
                self.mkdir(title)
                self.title_image_queue.put([title, img_list])
            self.chapter_queue.task_done()

    def mkdir(self, title):
        if os.path.exists(self.cartoon_name + "/" + title):
            shutil.rmtree(self.cartoon_name + "/" + title)
        os.mkdir(self.cartoon_name + "/" + title)

    # 保存图片
    def save(self):
        while True:
            title, i, img_data = self.image_queue.get()
            with open(
                self.cartoon_name + "/" + title + "/" + str(i) + ".jpg", "wb"
            ) as image:
                image.write(img_data)
            self.image_queue.task_done()

    # 程序运行中心
    def run(self):
        # 搜索动漫线程
        self.search_cartoon()

        # 获取章节线程
        th_get_chapter = threading.Thread(target=self.get_cartoon_chapter)
        th_get_chapter.start()

        # 线程列表
        th_list = []

        # 获取标题和图片线程
        th_title_image = threading.Thread(target=self.title_image_url)
        th_list.append(th_title_image)

        # 获取图片数据线程
        for i in range(4):
            th_get_image_data = threading.Thread(target=self.get_image_data)
            th_list.append(th_get_image_data)

        # 保存图片线程
        th_save = threading.Thread(target=self.save)
        th_list.append(th_save)

        # 设置线程守护 和 开启线程
        for th in th_list:
            th.setDaemon(True)
            th.start()

        # 堵塞主线程,使章节线程获取数据
        time.sleep(1)

        # 用队列阻塞主线程等待
        for q in [self.chapter_queue, self.title_image_queue, self.image_queue]:
            q.join()

        print("-" * 25 + "全部章节获取完毕" + "-" * 25)

        # 等待五秒退出
        time.sleep(5)


if __name__ == "__main__":
    MKSpider().run()
