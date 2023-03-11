#!/usr/bin/env python
# coding=utf-8
"""
Author: UoToGK
LastEditors: UoToGK
Date: 2022-04-16 23:05:24
LastEditTime: 2022-08-11 20:27:20
FilePath: utils.py
description:  一些常用的工具类方法,整合在一块
Copyright (c) 2022 by DyTheme, All Rights Reserved.
"""
# Standard Library
import datetime
import functools
import hashlib
import json
import os
import pdb


import pprint
import random
import re
import signal
import sys
import time
import traceback
import uuid
from functools import reduce, wraps
from typing import List
from urllib.parse import parse_qsl, urlencode, urlparse
from datetime import date, datetime, timedelta

# Third Library
import requests
from fake_useragent import UserAgent
from loguru import logger
from requests.exceptions import ConnectionError as RequestsConnectionError

# 日志打印
"""
description: 日志打印
param {*}
return {*}
"""
# 取消输出到控制台 handler_id
# logger.remove(handler_id=None)

# t = time.strftime("%Y_%m_%d")
# logger.add('{}/logs/runtime_{}.log'.format(os.getcwd(), t),
#            encoding="utf-8", rotation="100 MB")
# 对齐打印且能通过depth控制打印深度
pp = pprint.PrettyPrinter(depth=6)
debug_p = pp.pprint


def convert_time(t: str, as_list: bool = False):
    """转换有时间差的汉字表示的时间到`datetime.datetime`形式的时间
    Args:
        t (str): 要转换的字符串
        as_list (bool): 是否以列表形式返回
    Returns:
        datetime: 转换后的`datetime.datetime`结果
    """
    if not t or not t.strip():
        return None

    t = t.strip()
    days_in_chinese = {"昨天": 1, "前天": 2, "今天": 0, "下午": 0, "上午": 0, "中午": 0}
    if t in days_in_chinese:
        return datetime.now() - timedelta(days=days_in_chinese[t])
    num = re.findall(r"\d+", t)
    if num:
        delta = int(num[0])
    else:
        return ""
    # print( t.replace(str(delta), "").strip(), delta)
    if "秒前" in t:
        s = datetime.now() - timedelta(seconds=delta)
    elif "分钟前" in t:
        s = datetime.now() - timedelta(minutes=delta)
    elif "小时前" in t:
        s = datetime.now() - timedelta(hours=delta)
    elif t.replace(str(delta), "").split(":")[0].strip() in days_in_chinese:
        _ = int(re.findall(r"\d+", t)[-1])
        __ = t.replace(str(delta), "").split(":")[0].strip()
        s = datetime.now() - timedelta(days=days_in_chinese[__])
        s = datetime(s.year, s.month, s.day, delta, _)
    elif "天前" in t:
        s = datetime.now() - timedelta(days=delta)
    # elif '年' in t:
    #     s = (datetime.now() - timedelta(days=365 * delta))
    elif "年" in t and "月" in t and "日" in t and len(t) < 20:
        s = datetime.strptime(t, r"%Y年%m月%d日")
    elif "月" in t and "日" in t and len(t) < 10:
        year = str(datetime.now().year)
        groups = re.findall(r"(.*)月(.*)日", t)
        if groups and len(groups[0]) == 2:
            s = date(int(year), int(groups[0][0]), int(groups[0][1]))
        else:
            t = year + "年" + t
            try:
                s = datetime.strptime(t, r"%Y年%m月%d日")
            except Exception:
                print(f"数据出错{t}")
                s = datetime.now()
    else:
        s = datetime.now()

    if not as_list:
        return s
    else:
        return (s.year, s.month, s.day, s.hour, s.minute, s.second)


def validate_file_name(file_name):
    """
    :param file_name:等待验证的文件名
    :return: 验证windows文件名的合法性 将不合法的字符替换为 下划线_
    """
    rstr = r"[\/\\\:\*\?\"\<\>\|\“\”\—\：\n]"  # '/ \ : * ? " < > |'
    new_file_name = re.sub(rstr, "_", file_name)  # 替换为下划线
    return new_file_name.replace(" ", "")


def get_platform():
    """
    description: 获取是什么操作系统
    param {*}
    return {*}
    """
    # Standard Library
    from sys import platform

    if platform == "linux" or platform == "linux2":
        return "linux"
    elif platform == "darwin":
        return "osx"
    elif platform == "win32":
        return "win"


def get_ip():
    """
    :return: 获取局域网IP地址
    """
    PLATFORM = get_platform()
    if PLATFORM == "win":
        # Standard Library
        import socket

        ip = socket.gethostbyname(socket.gethostname())
        return ip
    elif PLATFORM == "osx":
        return "终端运行 ipconfig 查看"


def time_cmp(date1: str, date2: str):
    """
    description: 时间比较大小
    param {*} 日期参数
    return {*} True代表第一个日期在后,False反之
    """

    try:
        time1 = time.mktime(time.strptime(date1, "%Y-%m-%d"))
        time2 = time.mktime(time.strptime(date2, "%Y-%m-%d"))
        # 日期转化为int比较
        diff = int(time1) - int(time2)
        if diff > 0:
            return True
        elif diff == 0:
            return False
        else:
            return False
    except Exception:
        logger.debug("比较日期出错")
        return False


def get_local_time(create_time):
    """
    :param create_time 原视频的发布时间,linux时间戳
    :return: 返回年月日格式的日期
    """
    time_local = time.localtime(int(create_time))
    pub_date = time.strftime("%Y-%m-%d", time_local)
    return pub_date


def parse_headers(header_raw):
    """
    description: 通过原生请求头获取请求头字典
    :param header_raw: {str} 直接从浏览器复制出来的请求头
    :return: {dict} header_raw
    """

    header_raw = header_raw.split("\n")
    data = []
    for line in header_raw:
        if line:
            d = line.split(": ")
            data.append(d)
    dict = {}
    for _, index in enumerate(data):
        dict[index[0]] = index[1]
    return dict


def get_cookies(cookie_raw):
    """
    description: 通过原生cookie获取cookie字段
    :param cookie_raw: {str} 浏览器原始cookie
    :return: {dict} cookies
    """
    return dict(line.split("=", 1) for line in cookie_raw.replace("\n", "").split("; "))


def get_random_headers():
    """
    description: 随机获取请求头
    param {*}
    return {*}
    """
    first_num = random.randint(55, 62)
    third_num = random.randint(0, 3200)
    fourth_num = random.randint(0, 140)

    class FakeChromeUA:
        """
        description: 随机获取User-Agent
        param {*}
        return {*}
        """

        os_type = [
            "(Windows NT 6.1; WOW64)",
            "(Windows NT 10.0; WOW64)",
            "(X11; Linux x86_64)",
            "(Macintosh; Intel Mac OS X 10_12_6)",
        ]
        chrome_version = "Chrome/{}.0.{}.{}".format(first_num, third_num, fourth_num)

        @classmethod
        def get_ua(cls):
            return " ".join(
                [
                    "Mozilla/5.0",
                    random.choice(cls.os_type),
                    "AppleWebKit/537.36",
                    "(KHTML, like Gecko)",
                    cls.chrome_version,
                    "Safari/537.36",
                ]
            )

    random_headers = {"User-Agent": [FakeChromeUA.get_ua(), UserAgent().random][random.randint(0, 1)]}
    return random_headers


def is_chinese(char):
    """
    description:  检验某个字符是否是中文字符
    param {*}
    return {*}
    """
    if "\u4e00" <= char <= "\u9fa5":
        return True
    return False


def is_english_char(char):
    """
    description: 检验某个字符是否是英文文字符或数字
    param {*}
    return {*}
    """
    if 97 <= ord(char) <= 122 or 65 <= ord(char) <= 90 or char.isdigit():
        return True
    return False


def del_space(strs_v):
    """
    description: 去掉字符串之间多余的空格
    param {*}
    return {*}
    """
    strs_v = strs_v.strip()
    # 计算出字符串中空格的所有位置,如果没有空格返回出空list
    index_list = [i.start() for i in re.finditer(" ", strs_v)]  # i.span()
    remove_index = []
    for index in index_list:
        # # 如果空格字符串前面和后面有一个中文,去掉空格
        # if is_chinese(strs_v[index-1]) or is_chinese(strs_v[index+1]):
        #     remove_index.append(index)
        # 去掉空格前面的一个空格,如果英文里边中间隔了两个空格,去掉空格后面的一个空格的话,英文会连在一起
        # elif strs_v[index - 1] == ' ':  # or strs_v[index + 1]==' '
        #     remove_index.append(index)
        # 空格前面不是字母或数字
        if not (is_english_char(strs_v[index - 1])):
            remove_index.append(index)
        # 空格前面是字母或数字,空格后面不是字母和数字且后面不是空格
        elif is_english_char(strs_v[index - 1]) and (not is_english_char(strs_v[index + 1]) and strs_v[index + 1] != " "):
            remove_index.append(index)
    if remove_index != []:
        strs_v = "".join([strs_v[i] for i in range(len(strs_v)) if i not in remove_index])

    return strs_v


def get_md5(url):
    """
    description: md5处理
    param {*}
    return {*}
    """
    if isinstance(url, str):
        url = url.encode("utf-8")
    m = hashlib.md5()
    m.update(url)
    return m.hexdigest()


def convert_chinese_to_number(chinese_date):
    """
    将符合条件的字符串转换成 yyyy年mm月dd日的形式
    """

    # 不处理非字符串类型
    if isinstance(chinese_date, str):
        result = ""
        CN = ["〇", "一", "二", "三", "四", "五", "六", "七", "八", "九", "零"]
        number = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]
        numberToCN = dict(zip(CN, number))
        #     print (type(chinese_date))
        for i, s in enumerate(chinese_date):
            # 处理数字十
            if s == "十" and (i > 0 & i < len(chinese_date)):
                next_str = chinese_date[i + 1]
                preview_str = chinese_date[i - 1]
                # 十前后都有数字不用处理,舍去
                if (next_str in CN) and (preview_str in CN):
                    pass
                elif next_str in CN:
                    result = result + "1"
                elif preview_str in CN:
                    result = result + "0"
                else:
                    result = result + "10"
            elif s in CN:
                result = result + numberToCN[s]
            else:
                result = result + s
        return result
    else:
        return chinese_date


def chinese_to_num(chn, errors="ignore"):
    """
    :param chn: 中文格式字符例如：二十万元 或者20万元 最后必须以万结尾
    :param errors: ignore
    :return:cur 以元为单位,带两位小数点的数字
    """
    # 设置数字集合处理纯数字型字符串
    lcn = set(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "万", "元"])

    CN = [
        "〇",
        "一",
        "二",
        "三",
        "四",
        "五",
        "六",
        "七",
        "八",
        "九",
        "零",
        "壹",
        "贰",
        "叁",
        "肆",
        "伍",
        "陆",
        "柒",
        "捌",
        "玖",
    ]
    number = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

    dct_chntonum = dict(zip(CN, number))
    cnunit = ["十", "佰", "千", "万", "亿", "元", "百", "仟", "拾"]
    unit = [10, 100, 1000, 10000, 100000000, 1, 100, 1000, 10]
    dct_unit = dict(zip(cnunit, unit))
    cur = 0.0
    if isinstance(chn, str):
        # 处理数字型123.09元 或者 123.09万元
        if not set(chn) - lcn:
            if chn.endswith("万元"):
                return float(chn[0:-2]) * 10000
            if chn.endswith("元"):
                return float(chn[0:-1])
        else:
            # 处理以“十”开头的字符串
            if chn[0] == "十":
                cur = cur + 10
                chn = chn[1:]
            for n in chn:
                if n in CN:
                    cur = cur + dct_chntonum[n]
                elif n in cnunit:
                    cur = cur * dct_unit[n]
                else:
                    raise Exception("含有非数字型文字!")
            return cur

    else:
        if errors == "ignore":
            return chn
        else:
            raise Exception("非字符串,格式不正确!")


"""
                s = set([3,5,9,10,20,40])      #创建一个数值集合
                t = set([3,5,9,1,7,29,81])      #创建一个数值集合
                a = t | s          # t 和 s的并集 ,等价于t.union(s)
                b = t & s          # t 和 s的交集 ,等价于t.intersection(s)
                c = t - s          # 求差集(项在t中,但不在s中)  ,等价于t.difference(s)
                d = t ^ s          # 对称差集(项在t或s中,但不会同时出现在二者中),等价于t.symmetric_difference(s)
"""


def get_intersection(list1: List, list2: List):
    """
    交集  [val for val in list1 if val in list2]
    """
    return list(set(list1).intersection(set(list2)))


def get_union(list1: List, list2: List):
    """
    并集  list(set(list1+list2))
    """
    return list(set(list1).union(set(list2)))


def get_difference(list1: List, list2: List):
    """'
    差集  [val for val in list2 if val not in list1]
    2有1没有
    """
    return list(set(list2).difference(set(list1)))


def get_column_list(response, xpath, str_add_head="", str_add_tail="", Auto_wash=False):
    """
    xpath 解析列表数据
    :param response: 返回的html
    :param xpath:
    :param str_add_head: 首部添加字符
    :param str_add_tail: 尾部添加字符
    :param Auto_wash: 是否自动清洗,去重会打乱列表
    :return:
    """
    if isinstance(response, str):
        response = response.text
    value_list = response.xpath(xpath).getall()
    if Auto_wash:
        value_new_list = []
        for value in value_list:
            value = value.replace(" ", "").replace("\r", "").replace("\n", "").replace("\xa0", "").replace("\t", "")
            value_new_list.append(str_add_head + value + str_add_tail)
        return list(set(value_new_list))
    else:
        return value_list


def process_img(html):
    # 处理外链及图片
    html = re.sub("<a.*?>", "", html).replace("</a>", "")
    html = html.replace("&amp;", "&")
    # fmt:off
    img_urls = [
        i
        for i in get_column_list(html, "//img/@src") + get_column_list(html, "//p/@src") + get_column_list(html, "//img/@data-src") + get_column_list(html, "//img/@data-original") + get_column_list(html, "//img/@_src")if i
    ]
    # fmt:on
    for img_url in img_urls:
        # 判断图片链接是否有src属性,没有则添加上
        img_list = re.findall(r'\<img.*?data-src=".*?".*?\>', html) or re.findall(r'\<img.*?_src=".*?".*?\>', html) or re.findall(r'\<img.*?data-original=".*?".*?\>', html)
        for img_l in img_list:
            if not re.findall(r'\ssrc\s?=\s?".*?"', img_l):
                data_src = re.findall('data-src=".*?"', img_l) or re.findall('_src=".*?"', img_l) or re.findall('data-original=".*?"', img_l)
                data_src = data_src[0]
                if img_url in data_src:
                    img_new = img_l.replace(data_src, f'src="{img_url}" {data_src}')
                    html = html.replace(img_l, img_new)
            else:
                data_src = re.findall(r'data-src\s?=\s?"(.*?)"', img_l) or re.findall(r'_src\s?=\s?"(.*?)"', img_l) or re.findall(r'data-original\s?=\s?"(.*?)"', img_l)
                if data_src:
                    data_src = data_src[0]
                    img_src = re.findall(r'\ssrc\s?=\s?"(.*?)"', img_l)[0]
                    if data_src != img_src:
                        img_new = img_l.replace(img_src, data_src)
                        html = html.replace(img_l, img_new)

        img_location = ""
        html = html.replace(img_url, img_location)

    # 处理视频
    html = re.sub("<video.*?>", "", html).replace("</video>", "")

    return html


def time_reg(time_list, compare_date=False, limit_year=2019, limit_month=1):
    """
    时间处理
    :param time_list: List
    :param compare_date:
    :param limit_year: 限制发布时间的年,默认最早为2019年
    :param limit_month: 限制发布时间的月,默认为1月
    :return:
    """
    if isinstance(time_list, str):
        time_list = [time_list]
    elif isinstance(time_list, int):
        if len(str(time_list)) > 10:
            time_list = int(str(time_list)[:10])
        time_array = time.localtime(time_list)
        time_list = [time.strftime("%Y-%m-%d", time_array)]
    time_processed = []
    timestamp_now = int(time.time())
    reg = r"([0-9]{4}).*?([0-1]{0,1}[0-9]).*?([0-3]{0,1}[0-9])"
    for time_str in time_list:
        if len(time_str.split("-")[0]) == 2 or len(time_str.split("/")[0]) == 2:
            time_str = "20" + time_str
        time_str = re.search(reg, time_str)
        if time_str:
            try:
                year = time_str.group(1)
                month = time_str.group(2)
                day = time_str.group(3)
                date = year + "-" + month + "-" + day
                # publish_time = datetime.strptime(date, '%Y-%m-%d')
                timestamp = int(time.mktime(time.strptime(date, "%Y-%m-%d")))
                cut_time = timestamp_now - timestamp
                if compare_date and int(year) >= limit_year and int(month) >= limit_month:  # 二期产学研 2019-01-01 之后的文章
                    time_processed.append(date)
                if cut_time <= (86400 * 4) and not compare_date:  # 文章发布时间限制
                    time_processed.append(date)
            except Exception as e:
                logger.warning(time_str)
                logger.error(e)
                # publish_time = None
        else:
            # publish_time = None
            pass

    if len(time_processed) == 1:
        return time_processed[0]
    return time_processed


def daily_process(time_str):
    """
    日更时间处理
    :param time_str:
    :return:
    """
    if not time_str:
        return
    reg = r"([0-9]{4}).*?([0-1]{0,1}[0-9]).*?([0-3]{0,1}[0-9])"
    time_str = re.search(reg, time_str)
    if time_str:
        year = time_str.group(1)
        month = time_str.group(2)
        day = time_str.group(3)
        time_str = year + "-" + month + "-" + day
        timestamp_now = int(time.time())
        timestamp = int(time.mktime(time.strptime(time_str, "%Y-%m-%d")))
        cut_time = timestamp_now - timestamp
        if cut_time <= 86400:
            return time_str
        else:
            return False
    else:
        return False


def time_reg_hot(time_str):
    """
    description:
    param {*} time_str
    return {*}
    """
    reg = r"([0-9]{4}).*?([0-1]{0,1}[0-9]).*?([0-3]{0,1}[0-9])"
    time_str = re.search(reg, str(time_str))
    if time_str:
        try:
            year = time_str.group(1)
            month = time_str.group(2)
            day = time_str.group(3)
            publish_time = year + "-" + month + "-" + day
        except Exception as e:
            logger.warning(time_str)
            logger.error(e)
            publish_time = None
    else:
        publish_time = None

    return publish_time


def format_timestamp(timestamp):
    """
    description: 格式化时间戳
    param {*}
    return {*}
    """
    timestamp = int(int(timestamp) / 1000)
    if timestamp >= 0:
        timeArray = time.localtime(timestamp)
        otherStyleTime = time.strftime("%Y-%m-%d %H:%M:%S", timeArray)
    else:
        otherStyleTime = datetime.datetime(1970, 1, 2) + datetime.timedelta(seconds=timestamp)
    return str(otherStyleTime)


def get_proxies():
    proxy = "127.0.0.1:7890"
    return {"http": "http://" + proxy, "https": "http://" + proxy}


def retry_requests_for_proxy(
    url,
    headers,
    method="get",
    data=None,
    params=None,
    json=None,
    retry: int = 3,
    session=None,
    proxies=None,
    verify=True,
    **kwargs,
):
    """
    requests get 或者 post 请求。重试3次,错误加代理
    """
    for _ in range(retry):
        try:
            proxies = proxies if proxies else get_proxies()
            response = (session or requests.Session()).request(
                method=method.lower(),
                url=url,
                headers=headers,
                data=data,
                params=params,
                json=json,
                verify=verify,
                proxies=proxies,
                timeout=30,
                **kwargs,
            )
            if 200 <= response.status_code < 300:
                return response
            else:
                proxies = get_proxies()
                continue
        except RequestsConnectionError:
            proxies = get_proxies()  # 加IP代理
            continue
        except Exception:
            proxies = get_proxies()
            continue
    else:
        return None


class Timer(object):
    """
    计时器,对于需要计时的代码进行with操作：
    with Timer() as timer:
        num=10*20
        time.sleep(2)
    print(timer.cost)
    ...
    """

    def __init__(self, start=None):
        self.start = start if start is not None else time.time()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.stop = time.time()
        self.cost = self.stop - self.start
        return exc_type is None


def catch_error(func, is_raise=True):
    """
    description: 封装try...except...
        @catch_error
        def add(x, y):
            return x + y
    param {*} is_raise 是否抛出错误
    param {*} func 调用的函数
    return {*}
    """

    def usererror(ex, funcname):
        return type(ex)(str(ex) + "(from function: {})".format(funcname))

    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            result = func(*args, **kwargs)
        except Exception as ex:
            logger.error(traceback.format_exc())
            if is_raise:
                raise usererror(ex, func.__name__)
        return result

    return wrapper


class ExceptContext(object):
    """
    异常捕获上下文
    eg:
    def test():
        with ExceptContext(Exception, errback=lambda name, *args:print(name)):
            raise Exception("test. ..")
    """

    def __init__(
        self,
        exception=Exception,
        func_name=None,
        errback=lambda func_name, *args: traceback.print_exception(*args) is None,
        finalback=lambda got_err: got_err,
    ):
        """
        :param exception: 指定要监控的异常
        :param func_name: 可以选择提供当前所在函数的名称,回调函数会提交到函数,用于跟踪
        :param errback: 提供一个回调函数,如果发生了指定异常,就调用该函数,该函数的返回值为True时不会继续抛出异常
        :param finalback: finally要做的操作
        """
        self.errback = errback
        self.finalback = finalback
        self.exception = exception
        self.got_err = False
        self.func_name = func_name

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        return_code = False
        if isinstance(exc_val, self.exception):
            self.got_err = True
            return_code = self.errback(self.func_name, exc_type, exc_val, exc_tb)
        self.finalback(self.got_err)
        return return_code


def debugger():
    """
    description: 类似debugger  for chrome一样
    Attention：环境变量 DEBUG
    os.environ["DEBUG"] = True
    def func():
        debugger()
    param {*}
    return {*}
    """
    try:
        debug = eval(os.environ.get("DEBUG"))
    except Exception:
        debug = False
    if debug:
        d = pdb.Pdb()
        d.set_trace(sys._getframe().f_back)


def duplicate(iterable, keep=lambda x: x, key=lambda x: x, reverse=False):
    """
    保序去重
    :param iterable:
    :param keep: 去重的同时要对element做的操作
    :param key: 使用哪一部分去重
    :param reverse: 是否反向去重
    :return:
    """
    result = list()
    duplicator = list()
    if reverse:
        iterable = reversed(iterable)
    for i in iterable:
        keep_field = keep(i)
        key_words = key(i)
        if key_words not in duplicator:
            result.append(keep_field)
            duplicator.append(key_words)
    return list(reversed(result)) if reverse else result


def chain_all(iter):
    """
    连接多个序列或字典,同时返回可迭代对象
    :param iter:
    :return:
    """
    iter = list(iter)
    if not iter:
        return []
    if isinstance(iter[0], dict):
        result = {}
        for i in iter:
            result.update(i)
    else:
        result = reduce(lambda x, y: list(x) + list(y), iter)
    return result


def safely_json_loads(json_str, defaulttype=dict, escape=True):
    """
    返回安全的json类型
    :param json_str: 要被loads的字符串
    :param defaulttype: 若load失败希望得到的对象类型
    :param escape: 是否将单引号变成双引号
    :return:
    """
    if not json_str:
        return defaulttype()
    elif escape:
        data = str(json_str).replace("'", '"')
        return json.loads(data)
    else:
        return json.loads(json_str)


def format_html_string(html):
    """
    格式化html, 去掉多余的字符,类,script等。
    :param html:
    :return:
    """
    trims = [
        (r"\n", ""),
        (r"\t", ""),
        (r"\r", ""),
        (r"  ", ""),
        (r"\u2018", "'"),
        (r"\u2019", "'"),
        (r"\ufeff", ""),
        (r"\u2022", ":"),
        (r"<([a-z][a-z0-9]*)\ [^>]*>", r"<\g<1>>"),
        (r"<\s*script[^>]*>[^<]*<\s*/\s*script\s*>", ""),
        (r"</?a.*?>", ""),
    ]
    return reduce(
        lambda string, replacement: re.sub(replacement[0], replacement[1], string),
        trims,
        html,
    )


def retry_wrapper(retry_times, exception=Exception, error_handler=None, interval=0.1):
    """
    函数重试装饰器
    :param retry_times: 重试次数
    :param exception: 需要重试的异常
    :param error_handler: 出错时的回调函数
    :param interval: 重试间隔时间
    :return:
    """

    def out_wrapper(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            count = 0
            while True:
                try:
                    return func(*args, **kwargs)
                except exception as e:
                    count += 1
                    if error_handler:
                        result = error_handler(func.__name__, count, e, *args, **kwargs)
                        if result:
                            count -= 1
                    if count >= retry_times:
                        raise
                    time.sleep(interval)

        return wrapper

    return out_wrapper


def timeout(timeout_time, default):
    """
    超时装饰器
    Decorate a method so it is required to execute in a given time period,
    or return a default value.
    :param timeout_time:
    :param default:
    :return:
    """

    class DecoratorTimeout(Exception):
        pass

    def timeout_function(f):
        def f2(*args):
            def timeout_handler(signum, frame):
                raise DecoratorTimeout()

            old_handler = signal.signal(signal.SIGALRM, timeout_handler)
            # triger alarm in timeout_time seconds
            signal.alarm(timeout_time)
            try:
                retval = f(*args)
            except DecoratorTimeout:
                return default
            finally:
                signal.signal(signal.SIGALRM, old_handler)
            signal.alarm(0)
            return retval

        return f2

    return timeout_function


def parse_cookie(string):
    """
    解析cookie
    :param string:
    :return:
    """
    results = re.findall(r"([^=]+)=([^\;]+);?\s?", string)
    my_dict = {}

    for item in results:
        my_dict[item[0]] = item[1]

    return my_dict


def thread_safe(lock):
    """
    对指定函数进行线程安全包装,需要提供锁
    :param lock: 锁
    :return:
    """

    def decorate(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            with lock:
                return func(*args, **kwargs)

        return wrapper

    return decorate


def thread_safe_for_method_in_class(func):
    """
    对类中的方法进行线程安全包装
    :param func:
    :return:
    """

    @wraps(func)
    def wrapper(*args, **kwargs):
        self = args[0]
        try:
            self.lock.acquire()
            return func(*args, **kwargs)
        finally:
            self.lock.release()

    return wrapper


def call_later(callback, call_args=tuple(), immediately=True, interval=1):
    """
    应用场景：
    被装饰的方法需要大量调用,随后需要调用保存方法,但是因为被装饰的方法访问量很高,而保存方法开销很大
    所以设计在装饰方法持续调用一定间隔后,再调用保存方法。规定间隔内,无论调用多少次被装饰方法,保存方法只会
    调用一次,除非immediately=True
    :param callback: 随后需要调用的方法名
    :param call_args: 随后需要调用的方法所需要的参数
    :param immediately: 是否立即调用
    :param interval: 调用间隔
    :return:
    """

    def decorate(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            self = args[0]
            try:
                return func(*args, **kwargs)
            finally:
                if immediately:
                    getattr(self, callback)(*call_args)
                else:
                    now = time.time()
                    if now - self.__dict__.get("last_call_time", 0) > interval:
                        getattr(self, callback)(*call_args)
                        self.__dict__["last_call_time"] = now

        return wrapper

    return decorate


udTime = 10001
udRandom = 10002


def get_uuid(kind):
    """
    获得不重复的 uuid,可以是包含时间戳的 uuid,也可以是完全随机的；基于 Python 的 uuid 类进行封装和扩展；

    支持 get_time_uuid() 这样的写法,不需要参数,也可以表示生成包含时间戳的 uuid,兼容 v1.0.12 以及之前版本；

    :param:
        * kind: (int) uuid 类型,整形常量 udTime 表示基于时间戳, udRandom 表示完全随机
    :return:
        * result: (string) 返回类似 66b438e3-200d-4fe3-8c9e-2bc431bb3000 的 uuid

    举例如下::

        print('--- uuid demo ---')
        # 获得带时间戳的uuid
        for i in range(2):
            print(get_uuid(udTime))

        print('---')

        # 时间戳 uuid 的简单写法,兼容之前版本
        for i in range(2):
            print(get_time_uuid())

        print('---')

        # 获得随机的uuid
        for i in range(2):
            print(get_uuid(udRandom))

        print('---')

    执行结果::

        --- uuid demo ---
        c8aa92cc-60ef-11e8-aa87-acbf52d15413
        c8ab7194-60ef-11e8-b7bd-acbf52d15413
        ---
        c8ab7368-60ef-11e8-996c-acbf52d15413
        c8ab741e-60ef-11e8-959d-acbf52d15413
        ---
        8e108777-26a1-42d6-9c4c-a0c029423eb0
        8175a81a-f346-46af-9659-077ad52e3e8f
        ---

    """

    if kind == udTime:
        return str(uuid.uuid1())
    elif kind == udRandom:
        return str(uuid.uuid4())
    else:
        return str(uuid.uuid4())


# 相当于js里的偏函数
get_time_uuid = functools.partial(get_uuid, udTime)


def has_space_element(source):
    """
    判断对象中的元素,如果存在 None 或空字符串,则返回 True, 否则返回 False, 支持字典、列表和元组

    :param:
        * source: (list, set, dict) 需要检查的对象

    :return:
        * result: (bool) 存在 None 或空字符串或空格字符串返回 True, 否则返回 False

    举例如下::

        print('--- has_space_element demo---')
        print(has_space_element([1, 2, 'test_str']))
        print(has_space_element([0, 2]))
        print(has_space_element([1, 2, None]))
        print(has_space_element((1, [1, 2], 3, '')))
        print(has_space_element({'a': 1, 'b': 0}))
        print(has_space_element({'a': 1, 'b': []}))
        print('---')

    执行结果::

        --- has_space_element demo---
        False
        False
        True
        True
        False
        True
        ---

    """
    if isinstance(source, dict):
        check_list = list(source.values())
    elif isinstance(source, list) or isinstance(source, tuple):
        check_list = list(source)
    else:
        raise TypeError("source except list, tuple or dict, but got {}".format(type(source)))
    for i in check_list:
        if i == 0:
            continue
        if not (i and str(i).strip()):
            return True
    return False


def dict_to_url_params(params: dict):
    """
    description:

    params = {'wd': 'python', 'ie': 'utf-8'}
    result = urlencode(params) # wd=python&ie=utf-8

    param {*}
    return {*}
    """
    return urlencode(params)


def url_params_to_dict(url):
    '''
    description:
    url = 'https://www.baidu.com/s?&wd=python&ie=utf-8'
    # 提取url参数
    query = urlparse(url).query  # wd=python&ie=utf-8
    # 将字符串转换为字典
    params = parse_qs(query)  # {'wd': ['python'], 'ie': ['utf-8']}
    """所得的字典的value都是以列表的形式存在,若列表中都只有一个值"""
    result = {key: params[key][0] for key in params}  # {'wd': 'python', 'ie': 'utf-8'}

    param {*}
    return {*}
    '''
    query = urlparse(url).query
    params = parse_qsl(query)
    result = {key: params[key][0] for key in params}
    return result


def split_str_by_length(text, length):
    """
    将字符串切分成特定长度的数组

    :param:
        * text: (string) 需要切分的字符串
        * length: (int) 切分子串长度

    :return:
        * str_list: (list) 按照长度切分的数组

    举例如下::

        print('--- split_str_by_length demo---')
        text = '1231'*4 + '12'
        str_list = split_str_by_length(text, 4)
        print(str_list)
        print('---')

    执行结果::

        --- split_str_by_length demo---
        ['1231', '1231', '1231', '1231', '12']
        ---

    """
    if not isinstance(length, int):
        raise ValueError("{} must be int".format(length))

    str_list = re.findall(".{" + str(length) + "}", text)
    str_list.append(text[(len(str_list) * length) :])
    str_list = [item for item in str_list if item]
    return str_list


class RMBConversion(object):
    """
    人民币表示格式转换,阿拉伯数字表示的人民币和中文大写相互转换；

    举例如下::

        print('--- RMBConversion demo ---')
        chinese_amount = RMBConversion.an2cn('12345.67')
        print('RMBConversion an2cn:', chinese_amount)
        print('RMBConversion cn2an:', RMBConversion.cn2an(chinese_amount))
        print('---')

    执行结果::

        --- RMBConversion demo ---
        RMBConversion an2cn: 壹万贰仟叁佰肆拾伍圆陆角柒分
        RMBConversion cn2an: 12345.67
        ---

    """

    arab_number_max_len = 19
    upper_chinese_number = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"]
    unit_dict = {"1": "拾", "2": "佰", "3": "仟"}
    # 需要倒序拼接,所以是 '亿万'
    unit_list = ["万", "亿", "亿万"]

    an_2_cn_dict = {str(k): v for k, v in zip(range(10), upper_chinese_number)}
    cn_2_an_dict = dict(zip(an_2_cn_dict.values(), an_2_cn_dict.keys()))

    @staticmethod
    def Arab2cn(arabic_amount):
        """
        将阿拉伯数字金额转换为中文大写金额表示

        :param:
           * arabic_amount: (string) 阿拉伯数字金额
        :return:
           * chinese_amount: (string) 中文大写数字金额
        """
        try:
            float(arabic_amount)
            arabic_amount = str(arabic_amount)
        except ValueError:
            raise ValueError("error arabic_amount : {}".format(arabic_amount))
        if len(arabic_amount) > RMBConversion.arab_number_max_len:
            raise ValueError("len of arabic_amount should less than {}".format(RMBConversion.arab_number_max_len))
        if "." not in arabic_amount:
            arabic_amount += "."
        integer, decimals = arabic_amount.split(".")

        if len(decimals) > 2:
            raise ValueError("decimals error")

        reverse_integer_str = ""
        # 按照长度为 4 进行划分
        divide_part = split_str_by_length(integer[::-1], 4)
        for index, unit_part in enumerate(divide_part):
            temp_part, temp_unit = "", ""
            if unit_part == "0000":
                continue
            # 添加 万、亿单位
            if index > 0:
                temp_unit = RMBConversion.unit_list[index - 1]
                temp_part += temp_unit
            for unit_index, an_char in enumerate(unit_part):
                if an_char != "0":
                    temp_part += RMBConversion.unit_dict.get(str(unit_index % 4), "")
                temp_part += RMBConversion.an_2_cn_dict.get(an_char)

            while temp_part.find("零零") > 0:
                temp_part = temp_part.replace("零零", "零")
            # 替换掉万、亿、亿万后面的零
            if temp_unit and temp_unit + "零" in temp_part:
                temp_part = temp_part.replace(temp_unit + "零", temp_unit)
            reverse_integer_str += temp_part

        while reverse_integer_str[0] == "零":
            reverse_integer_str = reverse_integer_str[1:]

        chinese_amount = reverse_integer_str[::-1]
        # 整数最后部分加 圆
        chinese_amount += "圆"

        if len(decimals) == 0 or decimals in ["0", "00"]:
            chinese_amount += "整"
        else:
            chinese_amount += RMBConversion.an_2_cn_dict.get(decimals[0])
            if decimals[0] != "0":
                chinese_amount += "角"
            if len(decimals) > 1 and decimals[1] != "0":
                chinese_amount += RMBConversion.an_2_cn_dict.get(decimals[1])
                chinese_amount += "分"
        return chinese_amount

    @staticmethod
    def cn2Arab(chinese_amount):
        """
        将中文大写金额转换为阿拉伯数字金额表示

        :param:
           * chinese_amount: (string) 中文大写数字金额
        :return:
           * arabic_amount: (string) 阿拉伯数字金额
        """
        cn_unit = {"拾": 10, "佰": 100, "仟": 1000, "万": 10000, "亿": 100000000}
        # 先处理小数部分
        # 有三种情况：x 分,零 x 分,x 角 y 分,x 角
        if chinese_amount.endswith("分"):
            if "角" in chinese_amount:
                dime_index = chinese_amount.index("角")
                integer_amount = chinese_amount[: dime_index - 1]
                float_str = chinese_amount[dime_index - 1 :]
                float_str = float_str.replace("角", "").replace("分", "")
            else:
                if chinese_amount[-3] == "零":
                    integer_amount = chinese_amount[:-3]
                    float_str = chinese_amount[-3:]
                    float_str = float_str.replace("分", "")
                else:
                    # 需要补全零  壹仟陆佰圆陆分 ==> 壹仟陆佰圆零陆分
                    integer_amount = chinese_amount[:-2]
                    float_str = chinese_amount[-2:]
                    float_str = "零" + float_str
                    float_str = float_str.replace("分", "")
        elif chinese_amount.endswith("角"):
            integer_amount = chinese_amount[:-2]
            float_str = chinese_amount[-2:]
            float_str = float_str.replace("角", "")
            float_str += "零"
        else:
            integer_amount = chinese_amount
            float_str = ""

        float_res = "."
        for float_char in float_str:
            try:
                float_res += RMBConversion.cn_2_an_dict[float_char]
            except KeyError:
                raise ValueError("error chinese_amount {}".format(chinese_amount))

        while len(float_res) != 3:
            float_res += "0"

        float_amount = float(float_res)
        integer_amount = integer_amount.replace("圆", "")
        integer_amount = integer_amount.replace("整", "")

        # 处理整数部分
        unit = 0  # current
        an_list = []  # digest
        for cn_char in reversed(integer_amount):
            if cn_char in cn_unit:
                unit = cn_unit.get(cn_char)
                # 万 和 亿需要单独处理
                if unit in [10000, 100000000]:
                    an_list.append(unit)
                    unit = 1
            else:
                try:
                    an_num = int(RMBConversion.cn_2_an_dict[cn_char])
                except KeyError:
                    raise ValueError("error chinese_amount {}".format(chinese_amount))
                if unit:
                    an_num *= unit
                    unit = 0
                an_list.append(an_num)

        # 将数组组装成数字
        arabic_amount, tmp = 0, 0
        for an_item in reversed(an_list):
            if an_item in [10000, 100000000]:
                arabic_amount += tmp * an_item
                tmp = 0
            else:
                tmp += an_item
        arabic_amount += tmp
        arabic_amount += float_amount
        return arabic_amount


def trans(num):
    """
    description: 输入数字换为字母或输入字母转换为数字
    param {*}
    return {*}
    """
    if type(num) == int:
        if num < 10:
            return str(num)
        else:
            return chr(ord("A") + num - 10)
    else:
        if num.isdigit():
            return int(num)
        else:
            return ord(num) - ord("A") + 10


def check(num, base, target):  # 待转换数字,当前进制,目标进制
    """
    description: 输入检查
    param {*} 待转换数字,当前进制,目标进制
    return {*}
    """
    if type(base) is not int or base < 2 or base > 36 or type(target) is not int or target < 2 or target > 36:
        print("非法进制数！")
        return False
    if type(num) is int or type(num) is float:
        num = str(num).upper()
    elif type(num) is str and len(num) != 0:
        num = num.upper()
    else:
        print("非数字输入！")
        return False

    if num.count(".") > 1:
        print("多个小数点！")
        return False

    if not num.replace(".", "").isalnum():
        print("含有其他字符！")
        return False

    for c in num.replace(".", ""):
        if trans(c) >= base:
            print("字符超过进制允许！")
            return False

    while len(num) > 1:
        if num[0] == "0" and num[1] != ".":
            num = num[1:]
        else:
            break
    return num


def basechange(num, base, target, precision=11):
    """
    description:
    param {*} 待转换数字,当前进制,目标进制,精度
    return {*}
    """
    num = check(num, base, target)
    if num is False:
        return None
    point = num.find(".")
    if point == -1:
        point = len(num)
    radix = num.replace(".", "")
    if target == 10:
        int_part = radix[:point][::-1]
        frac_part = radix[point:]
        s = 0
        ss = 0
        for i in range(len(int_part)):
            s += trans(int_part[i]) * base**i
        for i in range(len(frac_part)):
            ss += trans(frac_part[i]) / base ** (i + 1)
        return str(s) + str(ss)[1:]
    elif base == 10:
        int_part = int(radix[:point])
        frac_part = float("0." + radix[point:])
        s = ""
        while True:
            s += trans(int_part % target)
            int_part //= target
            if int_part == 0:
                break
        s = s[::-1]
        if frac_part != 0:
            s += "."
            ct = 0
            while frac_part != 0 and ct < precision:
                frac_part *= target
                s += trans(int(frac_part))
                frac_part -= int(frac_part)
                ct += 1
        return s
    else:
        return basechange(
            basechange(num, base, 10, precision=precision),
            10,
            target,
            precision=precision,
        )


def list_all_files(rootdir):
    """
    description:列出文件夹下所有的目录与文件
    param {*}rootdir 路径
    return {*} 返回目录下所有文件包括子目录
    """
    _files = []
    # 列出文件夹下所有的目录与文件
    list = os.listdir(rootdir)
    for i in range(0, len(list)):
        # 构造路径
        path = os.path.join(rootdir, list[i])
        # 判断路径是否为文件目录或者文件
        # 如果是目录则继续递归
        if os.path.isdir(path):
            _files.extend(list_all_files(path))
        if os.path.isfile(path):
            _files.append(path)
    return _files


def get_array_nine():
    """
    description: 得到一个二维数组10*10坐标
    one_arr:-->[(1, 0), (2, 0), (3, 0), (4, 0), (5, 0), (6, 0), (7, 0), (8, 0), (9, 0), (1, 1), (2, 1), (3, 1), (4, 1), (5, 1), (6, 1), (7, 1), (8, 1), (9, 1), (1, 2), (2, 2), (3, 2), (4, 2), (5, 2), (6, 2), (7, 2), (8, 2), (9, 2), (1, 3), (2, 3), (3, 3), (4, 3), (5, 3), (6, 3), (7, 3), (8, 3), (9, 3), (1, 4), (2, 4), (3, 4), (4, 4), (5, 4), (6, 4),(7, 4), (8, 4), (9, 4), (1, 5), (2, 5), (3, 5), (4, 5), (5, 5), (6, 5), (7, 5), (8, 5), (9, 5), (1, 6), (2, 6), (3, 6), (4, 6), (5, 6), (6, 6), (7, 6), (8, 6), (9, 6), (1, 7), (2, 7), (3, 7), (4, 7), (5, 7), (6, 7), (7, 7), (8, 7), (9, 7), (1, 8), (2, 8), (3, 8), (4, 8), (5, 8), (6, 8), (7, 8), (8, 8), (9, 8), (1, 9), (2, 9), (3, 9), (4, 9), (5, 9), (6, 9), (7, 9), (8, 9), (9, 9)]
    two_arr:--->[[(1, 0), (2, 0), (3, 0), (4, 0), (5, 0), (6, 0), (7, 0), (8, 0), (9, 0)], [(1, 1), (2, 1), (3, 1), (4, 1), (5, 1), (6, 1), (7, 1), (8, 1), (9, 1)], [(1, 2), (2, 2), (3, 2), (4, 2), (5, 2), (6, 2), (7, 2), (8, 2), (9, 2)], [(1, 3), (2, 3), (3, 3), (4, 3), (5, 3), (6, 3), (7, 3), (8, 3), (9, 3)], [(1, 4), (2, 4), (3, 4), (4, 4), (5, 4), (6, 4), (7, 4), (8, 4), (9, 4)], [(1, 5), (2, 5), (3, 5), (4, 5), (5, 5), (6, 5), (7, 5), (8, 5), (9, 5)], [(1, 6), (2, 6), (3, 6), (4, 6), (5, 6), (6, 6), (7, 6), (8, 6), (9, 6)], [(1, 7), (2, 7), (3, 7), (4, 7), (5, 7), (6, 7), (7, 7), (8, 7), (9, 7)], [(1, 8), (2, 8), (3, 8), (4, 8), (5, 8), (6, 8), (7, 8), (8, 8), (9, 8)], [(1, 9), (2, 9), (3, 9), (4, 9), (5, 9), (6, 9), (7, 9), (8, 9), (9, 9)]]
    param {*}
    return {*} one_arr:一维数组存储  two_arr:二维数组
    """
    two_arr = []
    one_arr = []
    for i in range(0, 10):
        s_arr = []
        for j in range(1, 10):
            t = (j, i)
            s_arr.append(t)
            one_arr.append(t)
        two_arr.append(s_arr)
    return one_arr, two_arr


def get_today(format="%Y-%m-%d"):
    # 获取今日日期
    return datetime.datetime.today().strftime(format)


import shutil
import os

# 移除指定目录下的文件夹 remove_directories(r"D:\company_project\project_information", "__pycache__")
def remove_directories(directory, dir_name):
    for root, dirs, files in os.walk(directory):
        for dir in dirs:
            if dir == dir_name:
                shutil.rmtree(os.path.join(root, dir))


# 统计指定目录下文件数量,可以指定排除某个目录 print(count_files(r"D:\company_project\project_information", ".git"))
def count_files(directory, exclude_dir):
    count = 0
    for root, dirs, files in os.walk(directory):
        if exclude_dir in dirs:
            dirs.remove(exclude_dir)
        count += len(files)
    return count
