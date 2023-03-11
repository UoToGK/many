"""
Author: UoToGK
LastEditors: DyTheme
Date: 2022-03-27 19:52:34
LastEditTime: 2022-03-27 20:21:51
description:
Copyright(c): DyTheme
"""
# Standard Library
import re
from urllib.parse import unquote

# Third Library
import execjs
from requests import Session
from urllib3 import disable_warnings

disable_warnings()
session = Session()
with open(r"F:\project\myblog\spider\boss\head.js", encoding="utf-8") as f:
    raw_js = f.read() + "\n!"
tail_js = """
function get_token(seed, ts) {
    return encodeURIComponent((new window.ABC).z(seed, parseInt(ts) + 60 * (480 + (new Date).getTimezoneOffset()) * 1e3))
}
"""
url = "https://www.zhipin.com/c101280100-p100101/?page=3&ka=page-3"

payload = {}
headers = {
    "Connection": "keep-alive",
    "Pragma": "no-cache",
    "Cache-Control": "no-cache",
    "sec-ch-ua": '"Chromium";v="92", " Not A;Brand";v="99", "Google Chrome";v="92"',
    "sec-ch-ua-mobile": "?0",
    "Upgrade-Insecure-Requests": "1",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-User": "?1",
    "Sec-Fetch-Dest": "document",
    "Accept-Language": "zh-CN,zh;q=0.9",
}
count = 0
success = 0
while 1:
    session.headers = headers
    # response = session.request("GET", url, data=payload, verify=False, proxies=proxies)
    response = session.request("GET", url, data=payload, verify=False)
    local = response.history[0].headers.get("location")
    seed = unquote(re.findall("seed=(.*?)&", local)[0])
    ts = re.findall("ts=(.*?)&", local)[0]
    filename = re.findall("name=(.*?)&", local)[0]
    ak_url = "https://www.zhipin.com/web/common/security-js/{}.js".format(filename)
    # response_ak = session.request("GET", ak_url, data=payload, verify=False, proxies=proxies)
    response_ak = session.request("GET", ak_url, data=payload, verify=False)
    final_js = raw_js + response_ak.content.decode() + tail_js
    ff = execjs.compile(final_js)
    zp_token = ff.call("get_token", seed, ts)
    cookie = {"__zp_stoken__": zp_token}
    print("zp_token：", zp_token)
    # response = session.request("GET", url, data=payload, verify=False, cookies=cookie, proxies=proxies)
    response1 = session.request("GET", url, data=payload, verify=False, cookies=cookie)
    if "BOSS直聘" in response1.content.decode():
        success += 1
    count += 1
    print("请求总次数 {}".format(count), "成功总次数 {}".format(success))
