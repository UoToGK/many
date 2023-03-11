"""
Author: UoToGK
LastEditors: DyTheme
Date: 2021-09-25 22:37:36
LastEditTime: 2021-12-08 21:45:41
description:
Copyright(c): DyTheme
"""
#  suport billboard_type= 1 5 6 9 11 12 13 14
"""
1：热点榜
2：娱乐明星榜
3：体育热力榜
4：热门视频榜
5：音乐热歌榜
6：音乐飙升榜
7：音乐原创榜
8：音乐榜（未知）
9：上升热点榜
10：直播热榜
https://creator.douyin.com/aweme/v1/creator/data/billboard/?billboard_type=1     热点上升榜
https://creator.douyin.com/aweme/v1/creator/data/billboard/?billboard_type=9     今日热门视频
https://creator.douyin.com/aweme/v1/creator/data/billboard/?billboard_type=4     娱乐明星
https://creator.douyin.com/aweme/v1/creator/data/billboard/?billboard_type=2     体育热力
https://creator.douyin.com/aweme/v1/creator/data/billboard/?billboard_type=3     直播榜单
https://creator.douyin.com/aweme/v1/creator/data/billboard/?billboard_type=10     热歌榜
https://creator.douyin.com/aweme/v1/creator/data/billboard/?billboard_type=5     音乐飙升榜
https://creator.douyin.com/aweme/v1/creator/data/billboard/?billboard_type=6     原创音乐榜
https://creator.douyin.com/aweme/v1/creator/data/billboard/?billboard_type=7     二次元榜单
https://creator.douyin.com/aweme/v1/creator/data/billboard/?billboard_type=61     搞笑榜单
https://creator.douyin.com/aweme/v1/creator/data/billboard/?billboard_type=86      旅行
https://creator.douyin.com/aweme/v1/creator/data/billboard/?billboard_type=91     剧情
https://creator.douyin.com/aweme/v1/creator/data/billboard/?billboard_type=81     美食榜
https://creator.douyin.com/aweme/v1/creator/data/billboard/?billboard_type=71     

以上接口是不能直接进行访问的，需要在请求的时候加上Referer，下面以《今日热门视频》数据为例
"""
douyin_hotrank1 = (
    "https://creator.douyin.com/aweme/v1/creator/data/billboard/?billboard_type=1"
)
# Third Library
import requests

hot_video_url = (
    "https://creator.douyin.com/aweme/v1/creator/data/billboard/?billboard_type=1"
)

headers = {
    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Safari/537.36",
    "referer": "https://creator.douyin.com/billboard/hot_aweme",
}


response = requests.get(url=hot_video_url, headers=headers).json()

print(response)
