# coding: utf-8
# Standard Library
import html
import os
import random
import re
import sys
import time
from pprint import pprint

# Third Library
import pandas as pd  # 如果需要保存至excel表格的话
from wechatarticles.GetUrls import MobileUrls, PCUrls
from wechatarticles.ReadOutfile import Reader

sys.path.append(os.getcwd())


def flatten(x):
    return [y for l in x for y in flatten(l)] if type(x) is list else [x]


def transfer_url(url):
    url = html.unescape(html.unescape(url))
    return eval(repr(url).replace("\\", ""))


def verify_url(article_url):
    verify_lst = ["mp.weixin.qq.com", "__biz", "mid", "sn", "idx"]
    for string in verify_lst:
        if string not in article_url:
            return False
    return True


def get_all_urls(urls):
    # 获取所有的url
    url_lst = []
    for item in urls:
        url_lst.append(transfer_url(item["app_msg_ext_info"]["content_url"]))
        if "multi_app_msg_item_list" in item["app_msg_ext_info"].keys():
            for ss in item["app_msg_ext_info"]["multi_app_msg_item_list"]:
                url_lst.append(transfer_url(ss["content_url"]))

    return url_lst


def get_all_urls_title_date(urls):
    # 获取所有的[url, title, date]
    url_lst = []

    for item in urls:
        timestamp = item["comm_msg_info"]["datetime"]
        time_local = time.localtime(timestamp)
        # 转换成日期
        time_temp = time.strftime("%Y-%m-%d", time_local)

        # 文章url
        url_temp = transfer_url(item["app_msg_ext_info"]["content_url"])

        # 文章标题
        title_temp = item["app_msg_ext_info"]["title"]
        url_lst.append([url_temp, title_temp, time_temp])

        if "multi_app_msg_item_list" in item["app_msg_ext_info"].keys():
            for info in item["app_msg_ext_info"]["multi_app_msg_item_list"]:

                url_temp = transfer_url(info["content_url"])

                title_temp = info["title"]
                url_lst.append([url_temp, title_temp, time_temp])

    return url_lst


def method_one(biz, uin, cookie):

    t = PCUrls(biz=biz, uin=uin, cookie=cookie)
    count = 0
    lst = []
    while True:
        res = t.get_urls(key, offset=count)
        count += 10
        lst.append(res)

    return method_one


def method_two(biz, cookie):

    t = MobileUrls(biz=biz, cookie=cookie)
    count = 0
    lst = []
    while True:
        res = t.get_urls(appmsg_token, offset=count)
        count += 10
        lst.append(res)

    return method_two


def get_info_from_url(url):
    html = requests.get(url).text
    try:
        res = re.findall(r"publish_time =.+\|\|?", html)
        date = res[0].split("=")[1].split("||")[0].strip()
    except:
        date = None

    try:
        res = re.findall(r"nickname .+;?", html)
        offical_name = res[0].split("=")[1][:-1].strip()
    except:
        offical_name = None

    try:
        res = re.findall(r"msg_title = .+;?", html)
        aritlce_name = res[0].split("=")[1][:-1].strip()
    except:
        aritlce_name = None

    return date, offical_name, aritlce_name


def save_xlsx(fj, lst):
    df = pd.DataFrame(
        lst, columns=["url", "title", "date", "read_num", "like_num", "comments"]
    )
    df.to_excel(fj + ".xlsx", encoding="utf-8")


if __name__ == "__main__":
    # 方法一：使用PCUrls。已在win10下测试
    # 需要抓取公众号的__biz参数
    biz = biz
    # 个人微信号登陆后获取的uin
    uin = uin
    # 个人微信号登陆后获取的cookie
    cookie = cookie
    # 个人微信号登陆后获取的key，隔段时间更新
    key = key

    lst = method_one(biz, uin, cookie)

    # 个人微信号登陆后获取的token
    appmsg_token = appmsg_token

    # 方法二：使用MobileUrls。已在Ubuntu下测试

    # 自动获取参数
    """
    from ReadOutfile import Reader
    biz = biz

    # 自动获取appmsg_token, cookie
    outfile = 'outfile'
    reader = Reader()
    reader.contral(outfile)
    appmsg_token, cookie = reader.request(outfile)
    # 通过抓包工具，手动获取appmsg_token, cookie，手动输入参数
    appmsg_token = appmsg_token
    cookie = cookie
    """

    lst = method_two(biz, cookie)

    # 碾平数组
    # lst = flatten(lst)
    # 提取url
    # url_lst = get_all_urls(lst)

    # 获取点赞数、阅读数、评论信息
    test = ArticlesInfo(appmsg_token, cookie)
    """
    data_lst = []
    for i, url in enumerate(url_lst):
        item = test.comments(url)
        temp_lst = [url, item]
        try:
            read_num, like_num = test.read_like_nums(url)
            temp_lst.append(read_num)
            temp_lst.append(like_num)
        except:
            print("第{}个爬取失败，请更新参数".format(i + 1))
            break

        data_lst.append(temp_lst)
    """

    fj = "公众号名称"
    item_lst = []
    for i, line in enumerate(data, 0):
        print("index:", i)
        # item = json.loads('{' + line + '}', strict=False)
        timestamp = item["comm_msg_info"]["datetime"]
        ymd = time.localtime(timestamp)
        date = "{}-{}-{}".format(ymd.tm_year, ymd.tm_mon, ymd.tm_mday)

        infos = item["app_msg_ext_info"]
        url_title_lst = [[infos["content_url"], infos["title"]]]
        if "multi_app_msg_item_list" in infos.keys():
            url_title_lst += [
                [info["content_url"], info["title"]]
                for info in infos["multi_app_msg_item_list"]
            ]

        for url, title in url_title_lst:
            try:
                if not verify_url(url):
                    continue
                read_num, like_num, comments = get_data(url)
                print(read_num, like_num, len(comments))
                item_lst.append([url, title, date, read_num, like_num, comments])
                time.sleep(random.randint(5, 10))
            except Exception as e:
                print(e)
                flag = 1
                break
            finally:
                save_xlsx(fj, item_lst)

        if flag == 1:
            break

    save_xlsx(fj, item_lst)
