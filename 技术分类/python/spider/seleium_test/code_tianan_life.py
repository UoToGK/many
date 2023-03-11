# coding utf-8
#  https://www.cnblogs.com/klb561/p/9392560.html
# Standard Library
import datetime
import json
import random
import time
import urllib.request

# Third Library
import requests
from bs4 import BeautifulSoup
from lxml import etree
from selenium import webdriver

post_url = "https://www.tianan-life.com/dataUpload/getDataUploadList"
attach_prefix = "https://www.tianan-life.com/attachment/downLoadFile/dataUploadFile/"
params = {"pageNo": 2, "pageSize": 10, "dataType": 5, "moreFile": "Y"}
headers = {
    "user-agent": "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36"
}
# res=requests.post(post_url,headers=headers,data=params)
# response = res.content.decode().replace("\\", "")
# print(response)
# with open('./tiananlife.json','a+',encoding="utf-8") as f:
#     f.write(response)
# 当把get函数的stream参数设置成False时，它会立即开始下载文件并放到内存中，如果文件过大，有可能导致内存不足。
# 当把get函数的stream参数设置成True时，它不会立即开始下载，当你使用iter_content或iter_lines遍历内容或访问内容属性时才开始下载。需要注意一点：文件没有下载之前，它也需要保持连接。
# iter_content：一块一块的遍历要下载的内容
# iter_lines：一行一行的遍历要下载的内容
# r = requests.get(url_file, stream=True)
# f = open("file_path", "wb")
# for chunk in r.iter_content(chunk_size=512):
#     if chunk:
#         f.write(chunk)
attach_id = "8a8a84856f6aed2c01724a49d2d50f7d"
# res=requests.get(attach_prefix+attach_id,headers)
u = urllib.request.urlopen(attach_prefix + attach_id)
f = open("./tiananlife.pdf", "wb")
block_sz = 8192
while True:
    buffer = u.read(block_sz)
    if not buffer:
        break
    f.write(buffer)
f.close()
print("Sucessful to download")
