# coding utf-8
#  https://www.cnblogs.com/klb561/p/9392560.html
# Standard Library
import datetime
import json
import random
import re
import time

# Third Library
from selenium import webdriver


def write_file(path_name, content_list):
    for content in content_list:
        with open(path_name, "a+", encoding="UTF-8") as f:
            f.write(content)
            f.write("\n")


login = r"https://www.wanyiwang.com/member/login"
search = r"https://www.wanyiwang.com/search/%E8%B4%B9%E7%8E%87/0/1/0"
old_url_list = []
option = webdriver.ChromeOptions()
option.add_experimental_option("excludeSwitches", ["enable-automation"])
option.add_experimental_option(
    "prefs", {"profile.managed_default_content_settings.images": 2}
)
option.add_argument("disable-infobars")
option.add_argument("disable-plugins")
prefs = {
    "profile.default_content_setting_values": {"notifications": 2},
    "download.default_directory": r"E:\zhuxiaobin001\code\qzr_wanyi\wanyi\pdf",
    "credentials_enable_service": False,
    "profile.password_manager_enabled": False,
}
option.add_experimental_option("prefs", prefs)
option.add_argument("lang=zh_CN.UTF-8")
browser = webdriver.Chrome(
    r"E:\zhuxiaobin001\code\qzr_wanyi\qzr\config\low\chromedriver.exe",
    chrome_options=option,
)
browser.get(login)
username = browser.find_element_by_css_selector("#username")
password = browser.find_element_by_css_selector("#password")
username.send_keys("margin")  # username: scyj1 scyj
password.send_keys("pingan")
submit = browser.find_element_by_css_selector(
    "body > div.body > form > div > div:nth-child(4) > div.login_row_content > span > button"
)
submit.click()
time.sleep(3)
ok = browser.find_element_by_css_selector(
    "#layui-layer1 > div.layui-layer-btn.layui-layer-btn-c>a "
)
ok.click()
time.sleep(2)
stop = 0
with open("./url.txt", encoding="utf-8") as f:
    data = f.readlines()
    for singleUrl in data:
        singleUrl = singleUrl.replace("\n", "")
        fid = re.search("(\d+)", singleUrl).group(1)
        print("fid:", fid)
        stop = stop + 1
        browser.get(singleUrl)
        downloadButton = browser.find_element_by_css_selector("#downloadbt")
        product_name = browser.find_element_by_css_selector(
            "body > div.block > div.view_block > div.view_block_content > div.view_mess > div.view_member > div:nth-child(1) > h1"
        ).text
        update_time = browser.find_element_by_css_selector(
            "body > div.block > div.view_block > div.view_block_content > div.view_mess > div.view_mess_list > ul > li:nth-child(1) > span"
        ).text
        topic = browser.find_element_by_css_selector(
            "body > div.block > div.view_block > div.view_block_title > div > a:nth-child(3)"
        ).text
        # downloadButton.click()
        print("正则下载%s" % (product_name))
        time.sleep(2)
        time.sleep(random.randrange(10, 15, 1))
        data = {}
        data["product_name"] = product_name
        data["website_name"] = "万一网官网"
        data["data_export_format"] = "PPT，压缩文件，Excel，Word"
        data["data_souce"] = "万一网官网"
        data["capture_title"] = "万一网官网销话术采集0609"
        data["topic"] = topic
        data["type_num"] = "4.5"
        data["captureTime"] = time.strftime(
            "%Y-%m-%d %H:%M:%S", time.localtime(time.time())
        )
        data["url"] = singleUrl
        data["pdf_name"] = product_name
        data["update_time"] = update_time
        #  https://www.wanyiwang.com/ajax/downfile?fid=20758&fm2=0&fm3=1

        data[
            "pdf_url"
        ] = "https://www.wanyiwang.com/ajax/downfile?fid={}&fm2=0&fm3=0".format(fid)
        if "销售话术" in topic:
            data["parent_url"] = "https://www.wanyiwang.com/list/61/"
        else:
            data["parent_url"] = "https://www.wanyiwang.com/list/91/"
        with open("./wanyi.json", "a+", encoding="utf-8") as f:
            f.write(json.dumps(data, ensure_ascii=False))
            f.write("\n")
            # json.dump(data, f, ensure_ascii=False)
        time.sleep(1)
        if stop % 54 == 0:
            print(
                "当前时间", datetime.datetime.now(), "stop:", stop, "singleUrl:", singleUrl
            )
            write_file("./old_url.txt", old_url_list)
            time.sleep(60 * 60 * 24)
            browser.get(login)
            username = browser.find_element_by_css_selector("#username")
            password = browser.find_element_by_css_selector("#password")
            username.send_keys("margin")  # username: scyj1
            password.send_keys("pingan")
            submit = browser.find_element_by_css_selector(
                "body > div.body > form > div > div:nth-child(4) > div.login_row_content > span > button"
            )
            submit.click()
            time.sleep(3)
            ok = browser.find_element_by_css_selector(
                "#layui-layer1 > div.layui-layer-btn.layui-layer-btn-c>a "
            )
            ok.click()
            time.sleep(2)
