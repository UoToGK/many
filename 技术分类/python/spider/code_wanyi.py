# Standard Library
import json
import re
import time

# Third Library
import requests
from bs4 import BeautifulSoup

requests.packages.urllib3.disable_warnings()


def time_cmp(date1, date2):
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
    except Exception as e:
        print("比较日期出错")
        return False


urls_list = []


def get_url(page=1):
    search = r"https://www.wanyiwang.com/search/%E8%B4%B9%E7%8E%87/0/{}/0".format(page)
    print(page, search)
    header = {
        "User-Agent": "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36"
    }
    html = requests.get(search, header).content
    bs = BeautifulSoup(html, "html.parser")
    li_sec = "body > div.block > div.search_list_block > div.search_list_content > div.search_list > ul > li"
    a_sec = "div.list_news_c > h4 > a"
    date_sec = "div.list_news_c > div"
    li_list = bs.select(li_sec)
    for item in li_list:
        href = item.select(a_sec)[0]["href"]
        text = item.select(a_sec)[0].text
        date_text = item.select(date_sec)[0].text
        date = re.search("上传时间:(.*)", date_text).group(1)
        flag = time_cmp(date, "2020-04-23")
        if flag:
            urls_list.append(href)
        else:
            break
        print(page, href, text, date)
    return flag


page = 1
flag = get_url(page)
while True:
    if flag:
        page = page + 1
        flag = get_url(page)
    else:
        break
with open("./wanyi_urls.txt", "a") as f:
    for item in urls_list:
        f.write(item)
        f.write("\n")

login_url = "https://www.wanyiwang.com/ajax/userlogins"
header = {
    "User-Agent": "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
    # "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    # "cookie": "Hm_lvt_14091d98c048f7cd4a59a99a04c966ae=1594720446,1594800264; ci_session=rv222eadusrn527aa6ri4sl2f3sfebvg; Hm_lpvt_14091d98c048f7cd4a59a99a04c966ae=1594882758",
    # "origin": "https://www.wanyiwang.com",
    # "referer": "https://www.wanyiwang.com/member/login/"
}
product_url = "https://www.wanyiwang.com/view/95697.html"
sec = "#comment_block > div.comment_form > div:nth-child(1) > div.comment_form_box"
params = {
    "username": "margin",
    "password": "pingan",
    "fid": "0",
    "ustate": "0",
    "pstate": "0",
}
session = requests.session()
content = (
    session.post(login_url, headers=header, data=params, verify=False)
    .text.encode("utf-8")
    .decode("unicode_escape")
)
html = session.get(product_url).content
bs = BeautifulSoup(html, "html.parser")
text = bs.select(sec)[0]
download_url = "https://www.wanyiwang.com/ajax/downfile?fid=95697&fm2=0&fm3=0"
down_info = session.get(download_url, headers=header)
down_info = (
    session.get(download_url, headers=header)
    .text.encode("utf-8")
    .decode("unicode_escape")
)
url = json.loads(down_info)["content"]
print(url)
f = open("./aa合众附加心脑血管疾病保险条款费率表投保保全规则.rar", "wb")
res = requests.get(url, headers=header)
f.write(res.content)
