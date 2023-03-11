#!/usr/bin/env python
# coding=utf-8
"""
Author: xiaobin.zhu
since: 2023-02-14 10:56:08
LastAuthor: xiaobin.zhu
LastEditTime: 2023-02-14 10:56:09
Description: write something
FilePath: delete_github_repo 批量删除GitHub仓库
Copyright(c): 企知道-数据采集部
"""

from time import sleep
import requests


def get_proxies():
    proxy = "127.0.0.1:7890"
    return {"http": "http://" + proxy, "https": "http://" + proxy}


headers = {
    "Accept": "application/vnd.github+json",
    "Authorization": "Bearer  XXX",  # https://reposweeper.com/#login_main 网页上删除 https://github.com/settings/tokens/new 获取token
    "X-GitHub-Api-Version": "2022-11-28",  # https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#delete-a-repository GitHub API
}  # 此处的  代表上面的token

with open(r"D:\\repolist.txt", "r", encoding="utf-8") as f:
    data = f.readlines()

urls = []
for line in data:
    name, repo = line.strip().split("/")
    urls.append(f"https://api.github.com/repos/{name}/{repo}")

for l in urls:
    print(l)
    res = requests.delete(url=l, headers=headers, proxies=get_proxies())
    print(res.status_code)
