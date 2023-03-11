# Standard Library
import json
import re
import time

# Third Library
import requests
from lxml import etree

# from bs4 import BeautifulSoup


class Weibospider:
    def __init__(self):
        # 获取首页的相关信息：
        self.start_url = "https://weibo.com/chinanewsweek?profile_ftype=1&is_all=1#_0"

        self.headers = {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
            "cache-control": "max-age=0",
            "cookie": "SINAGLOBAL=6798884367344.193.1557302862199; _s_tentry=www.baidu.com; UOR=auto.sina.com.cn,widget.weibo.com,www.baidu.com; Apache=3566558033539.009.1585617440484; ULV=1585617440555:13:3:1:3566558033539.009.1585617440484:1585187077881; YF-V5-G0=99df5c1ecdf13307fb538c7e59e9bc9d; Ugrow-G0=1ac418838b431e81ff2d99457147068c; WBtopGlobal_register_version=3d5b6de7399dfbdb; SCF=Av1aswoWgy5Cj9Vbywiczr5n4ywY3hej2TqFUbcwZU5GOJvrU4eTrEfsOQPRPWJ6ocKLXROQsbPXp4G5TBxYt_o.; SUB=_2A25zhuqKDeRhGeBI4lIW-CrLzj2IHXVQ8ltCrDV8PUNbmtAfLUnBkW9NRn5AIz5O4BpGQZ1Q-wsXQdmYXKqSFVxp; SUBP=0033WrSXqPxfM725Ws9jqgMF55529P9D9WW.SXm1.8LQ2ZBeT8uJcM.m5JpX5K2hUgL.Foqc1K5N1hBNSK22dJLoIpRLxKqL1-eLBo2LxKqL1K.L1KeLxK-LB.BLB-e7eKzt; SUHB=0A0JbWFox95Gx6; ALF=1586222424; SSOLoginState=1585617626; un=17603072726; wb_view_log_6690784751=1920*10181; wvr=6; YF-Page-G0=4358a4493c1ebf8ed493ef9c46f04cae|1585617873|1585617823; webim_unReadCount=%7B%22time%22%3A1585617880337%2C%22dm_pub_total%22%3A0%2C%22chat_group_client%22%3A0%2C%22allcountNum%22%3A43%2C%22msgbox%22%3A0%7D",
            "referer": "https://s.weibo.com/user?q=%E4%B8%AD%E5%9B%BD%E5%91%A8%E5%88%8A&Refer=SUer_box",
            "upgrade-insecure-requests": "1",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36",
        }
        self.proxy = {
            # 此处填入自己的proxy
        }

    def parse_home_url(self, url):  # 处理解析首页面的详细信息（不包括两个通过ajax获取到的页面）
        res = requests.get(url, headers=self.headers)
        response = res.content.decode("utf-8").replace("\\", "")
        # every_url = re.compile('target="_blank" href="(/\d+/\w+\?from=\w+&wvr=6&mod=weibotime)"', re.S).findall(response)
        every_id = re.compile(r"name=(\d+)", re.S).findall(response)  # 获取次级页面需要的id
        home_url = []
        for id in every_id:
            base_url = "https://weibo.com/aj/v6/comment/big?ajwvr=6&id={}&from=singleWeiBo"
            url = base_url.format(id)
            home_url.append(url)
        return home_url

    def parse_every_weibo(self, url):  # 处理解析首页面的详细信息（不包括两个通过ajax获取到的页面）
        res = requests.get(url, headers=self.headers)
        response = res.content.decode().replace("\\", "")
        every_link = re.compile(r'<a \s*name=\d+.*?href="(.*?)".*?>', re.S).findall(response)  # 获取次级页面需要的href
        every_weibo = []
        for link in every_link:
            base_url = "https://weibo.com"
            url = base_url + link
            every_weibo.append(url)
        return every_weibo

    def parse_comment_info(self, url):  # 爬取直接发表评论的人的相关信息(name,info,time,info_url)
        res = requests.get(url, headers=self.headers)
        response = res.json()
        count = response["data"]["count"]
        html = etree.HTML(response["data"]["html"])
        name = html.xpath("//div[@class='list_li S_line1 clearfix']/div[@class='WB_face W_fl']/a/img/@alt")  # 评论人的姓名
        info = html.xpath("//div[@node-type='replywrap']/div[@class='WB_text']/text()")  # 评论信息
        info = "".join(info).replace(" ", "").split("\n")
        info.pop(0)
        comment_time = html.xpath("//div[@class='WB_from S_txt2']/text()")  # 评论时间
        name_url = html.xpath("//div[@class='WB_face W_fl']/a/@href")  # 评论人的url
        name_url = ["https:" + i for i in name_url]
        comment_info_list = []
        for i in range(len(name)):
            item = {}
            item["name"] = name[i]  # 存储评论人的网名
            item["comment_info"] = info[i]  # 存储评论的信息
            item["comment_time"] = comment_time[i]  # 存储评论时间
            item["comment_url"] = name_url[i]  # 存储评论人的相关主页
            comment_info_list.append(item)
        return count, comment_info_list

    def parse_weibo_info(self, url):  # 爬取直接发表评论的人的相关信息(name,info,time,info_url)
        res = requests.get(url, headers=self.headers)
        response = res.json()
        count = response["data"]["count"]
        html = etree.HTML(response["data"]["html"])
        name = html.xpath("//div[@class='list_li S_line1 clearfix']/div[@class='WB_face W_fl']/a/img/@alt")  # 评论人的姓名
        info = html.xpath("//div[@node-type='replywrap']/div[@class='WB_text']/text()")  # 评论信息
        info = "".join(info).replace(" ", "").split("\n")
        info.pop(0)
        comment_time = html.xpath("//div[@class='WB_from S_txt2']/text()")  # 评论时间
        name_url = html.xpath("//div[@class='WB_face W_fl']/a/@href")  # 评论人的url
        name_url = ["https:" + i for i in name_url]
        comment_info_list = []
        for i in range(len(name)):
            item = {}
            item["name"] = name[i]  # 存储评论人的网名
            item["comment_info"] = info[i]  # 存储评论的信息
            item["comment_time"] = comment_time[i]  # 存储评论时间
            item["comment_url"] = name_url[i]  # 存储评论人的相关主页
            comment_info_list.append(item)
        return count, comment_info_list

    def write_file(self, path_name, content_list):
        for content in content_list:
            with open(path_name, "a", encoding="UTF-8") as f:
                f.write(json.dumps(content, ensure_ascii=False))
                f.write("\n")

    def run(self):
        start_url = "https://weibo.com/chinanewsweek?is_search=0&visible=0&is_all=1&is_tag=0&profile_ftype=1&page={}#feedtop"
        start_ajax_url1 = "https://weibo.com/p/aj/v6/mblog/mbloglist?ajwvr=6&domain=100206&is_all=1&page={0}&pagebar=0&pl_name=Pl_Official_MyProfileFeed__20&id=1002061642512402&script_uri=/u/1642512402&pre_page={0}"
        start_ajax_url2 = "https://weibo.com/p/aj/v6/mblog/mbloglist?ajwvr=6&domain=100206&is_all=1&page={0}&pagebar=1&pl_name=Pl_Official_MyProfileFeed__20&id=1002061642512402&script_uri=/u/1642512402&pre_page={0}"
        for i in range(12):  # 微博共有12页
            home_url = self.parse_home_url(start_url.format(i + 1))  # 获取每一页的微博
            every_weibo = self.parse_every_weibo(start_url.format(i + 1))
            ajax_url1 = self.parse_home_url(start_ajax_url1.format(i + 1))  # ajax加载页面的微博
            ajax_url2 = self.parse_home_url(start_ajax_url2.format(i + 1))  # ajax第二页加载页面的微博
            all_url = home_url + ajax_url1 + ajax_url2
            print(home_url)
            print(every_weibo)
            print(ajax_url1)
            print(ajax_url2)
            print(all_url)
            for j in range(len(all_url)):
                # print(all_url[j])
                path_name = "chinanewsweek第{}条微博相关评论.txt".format(i * 45 + j + 1)
                all_count, comment_info_list = self.parse_comment_info(all_url[j])
                self.write_file(path_name, comment_info_list)
                for num in range(1, 10000):
                    if num * 15 < int(all_count) + 15:
                        comment_url = all_url[j] + "&page={}".format(num + 1)
                        print(comment_url)
                        try:
                            count, comment_info_list = self.parse_comment_info(comment_url)
                            self.write_file(path_name, comment_info_list)
                        except Exception as e:
                            print("Error:", e)
                            time.sleep(60)
                            count, comment_info_list = self.parse_comment_info(comment_url)
                            self.write_file(path_name, comment_info_list)
                        del count
                        time.sleep(5)

                print("第{}微博信息获取完成！".format(i * 45 + j + 1))


if __name__ == "__main__":
    weibo = Weibospider()
    weibo.run()
