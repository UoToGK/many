import pandas as pd
import os
import winreg
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium import webdriver

handle = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, r"SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths")
chrome_path = winreg.QueryValue(handle, "chrome.exe")
command = f'"{chrome_path}" --remote-debugging-port=9222'
os.popen(command)
option = webdriver.ChromeOptions()
option.add_experimental_option("debuggerAddress", "127.0.0.1:9222")
browser = webdriver.Chrome(options=option)
wait = WebDriverWait(browser, 10)


def remove_element(element):
    browser.execute_script(
        """
    var element = arguments[0];
    element.parentNode.removeChild(element);
    """,
        element,
    )


def parse_data(item):
    # 游览器滚动到当前节点的可视区域
    item.location_once_scrolled_into_view
    tag = item.find_element(By.XPATH, ".//article")
    time_tag = tag.find_element(By.XPATH, ".//header//a[contains(@class,'head-info_time')]")
    date = time_tag.get_attribute("title")
    text_tag = tag.find_element(By.XPATH, ".//header/following-sibling::div[1]/div/div")
    expands = text_tag.find_elements(By.XPATH, ".//span[@class='expand']")
    if expands:
        # 找到展开按钮后，点击按钮并删除收起按钮
        expands[0].click()
        collapse = wait.until(EC.presence_of_element_located((By.XPATH, ".//span[@class='collapse']")))
        remove_element(collapse)
    text = text_tag.text.strip()
    html = text_tag.get_attribute("innerHTML").strip("\u200b \t\r\n")
    return date, text, html


browser.get("https://weibo.com/mayun")
scroller = wait.until(EC.presence_of_element_located((By.XPATH, "//div[@id='scroller']")))
all_num_tag = browser.find_element(By.XPATH, "//div[@class='container']/div/div[starts-with(text(),'全部微博')]")
all_num = int(all_num_tag.text[5:-1])
last_pos, data = -1, []

for i in range(all_num):
    tmp, items = [], None
    while True:
        items = scroller.find_elements(By.CSS_SELECTOR, "div.vue-recycle-scroller__item-view")
        for item in items:
            matrix = item.value_of_css_property("transform")
            pos = int(matrix[matrix.rfind(" ") + 1 : -1])
            if pos <= last_pos:
                continue
            tmp.append((pos, item))
        if items:
            break
        time.sleep(0.2)
    last_pos, item = min(tmp, key=lambda x: x[0])
    date, text, html = parse_data(item)
    print(i, date)
    time.sleep(0.1)
    data.append((date, text, html))

df = pd.DataFrame(data, columns=["发布时间", "内容", "HTML"])
df.to_excel("马云微博.xlsx", index=False)
