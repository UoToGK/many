#!/usr/bin/env python
# coding=utf-8
"""
Author: UoToGK 
LastEditors: UoToGK
Date: 2022-06-01 10:17:06
LastEditTime: 2022-08-13 10:11:43
FilePath: keyword.py
Description: 根据关键词爬取的模板基类
Copyright (c) 2022 by DyTheme, All Rights Reserved. 
"""


# Standard Library
import os
import re
import threading
import time
import traceback
from datetime import datetime
from multiprocessing import Lock, Pool, Queue
from urllib.parse import quote

# Third Library
import redis
import requests
import urllib3
from bs4 import BeautifulSoup
from fake_headers import Headers
from loguru import logger
from pymysql.converters import escape_string
from requests.exceptions import ConnectionError as RequestsConnectionError
from urllib3.exceptions import ConnectTimeoutError, MaxRetryError

from ....DataBase.db.mysql.dbutils import MySQLHelper
from ....DataBase.db.redis.pyredistools import IndexTool

urllib3.disable_warnings()
lock = Lock()
# get_name _db


mysql_host = "127.0.01"
mysql_port = 3306
mysql_user = ""
mysql_pwd = ""
mysql_db = "db_dev"
mysql_table = ""

redis_host = "127.0.01"
redis_port = 6379
redis_user = ""
redis_pwd = ""
redis_db = "db_dev"
redis_table = ""
"""
      # maxconnections=20, # 最大连接数
       # maxusage=None,  # 一个链接最多被重复使用的次数，None表示无限制
       # blocking=True, # 本线程独享值得对象，用于保存链接对象，如果链接对象被重置
"""
get_helper = MySQLHelper(host=mysql_host, port=mysql_port, user=mysql_user, password=mysql_pwd, database=mysql_db, max_connections=100, max_usage=0, blocking=True)
redis_tool = IndexTool(redis_host, redis_port, redis_pwd, redis_db)


t = time.strftime("%Y-%m-%d")
debug_file = f"{os.getcwd()}/logs/debug-runtime100w_{t}.log"
info_file = f"{os.getcwd()}/logs/info-runtime100w_{t}.log"
error_file = f"{os.getcwd()}/logs/error-runtime100w_{t}.log"
logger.add(
    f"{debug_file}",
    format="{time:YYYY-MM-DD HH:mm:ss}|{level}| {name}:{function}:{line}| {message}",
    level="DEBUG",
    retention="10 days",
    encoding="utf-8",
    mode="a",
    enqueue=True,
)
logger.add(
    f"{info_file}",
    format="{time:YYYY-MM-DD HH:mm:ss}|{level}| {name}:{function}:{line}| {message}",
    level="INFO",
    retention="10 days",
    encoding="utf-8",
    mode="a",
    enqueue=True,
)
logger.add(
    f"{error_file}",
    format="{time:YYYY-MM-DD HH:mm:ss}|{level}| {name}:{function}:{line}| {message}",
    level="ERROR",
    retention="10 days",
    encoding="utf-8",
    mode="a",
    enqueue=True,
)


# 获取关键词
f2 = open("./name.txt", mode="r", encoding="utf-8")
data2 = f2.readlines()


PROXY_API = ""


def get_proxies():
    try:
        # comment:
        proxy = requests.get(PROXY_API).text.strip()
        return {"http": "http://" + proxy, "https": "http://" + proxy}
    except Exception as e:
        logger.debug(f"获取代理IP出错{traceback.format_exc(1)}，将使用本地代理")
        proxy = "127.0.0.1:80"
        return {"http": "http://" + proxy, "http": "http://" + proxy}


def base_requests(url, headers, method="get", data=None, params=None, json=None, retry: int = 3, session=None, proxies=None, verify=True, **kwargs):
    """
    requests get 或者 post 请求。重试3次，错误加代理
    """
    for _ in range(retry):
        try:
            response = (session or requests.Session()).request(
                method=method.lower(), url=url, headers=headers, data=data, params=params, json=json, verify=verify, proxies=proxies, timeout=10, **kwargs
            )
            if 200 <= response.status_code < 300:
                return response
            else:
                continue
        except RequestsConnectionError as e:
            proxies = get_proxies()  # 加IP代理
            logger.error(f"base_requests RequestsConnectionError 请求链接异常 --->{proxies}  {url}")
            continue
        except Exception as e:
            proxies = get_proxies()
            logger.error(f"base_requests Exception 请求链接异常 --->{proxies}  {url}")
            continue
    else:
        return None


# qy_name
def get_name(between: list):
    """
    description: 根据id从数据库取关键词
    param {*}
    return {*} 返回一个tuple对象（id,name）
    """
    search_sql = f"select id,company_name from {mysql_table} where id <={between[1]} and id>{between[0]}"
    try:
        result = get_helper.select_all(search_sql)
        # comment:
        if result:
            return result
        else:
            logger.debug(f"数据获取数据无结果")
        return None
    except Exception as e:
        logger.error(f"get_name 数据获取数据异常：{traceback.format_exception_only(type(e), e)}")
        return None
    # end try


# 查重 使用redis


def recive_name(data):
    thread_q = []
    for name in data:
        data_id = name[0]
        name = name[1]
        # if is_exist_name(name):
        #     continue
        if name in "".join(data2):
            logger.info(f"没有信息或者已经爬过的公司 {name}")
        else:
            t = threading.Thread(target=parse_home, args=[name, data_id])
            t.setDaemon = True
            thread_q.append(t)
    if len(thread_q) > 0:
        [i.start() for i in thread_q]
        [i.join() for i in thread_q]


def parse_home(name, id):
    """
    description:
    param {*}name id
    return {*}
    """
    pass


if __name__ == "__main__":
    logger.info(f"__main__进程id：{os.getpid()}")
    step = 100
    total = 106 * 10000
    end = 0
    pool = Pool(3)
    t1 = time.time()
    while end < total:
        start = end
        end = end + step
        between = [start, end]
        logger.debug(f"现在区间：{between}")
        name = get_name(between)
        pool.apply_async(recive_name, args=(name,))
    pool.close()
    logger.info(f"主进程等待子进程执行完毕")
    pool.join()
    t2 = time.time()
    logger.info(f"数据获取完成，总共耗时：{t2-t1}")
