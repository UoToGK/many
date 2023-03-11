"""
===================================================
    -*- coding:utf-8 -*-
    FileName   :mitmproxy_douyin_get_url_scripts.py
====================================================
"""
# Standard Library
import json
import struct
import time
from socket import *

# Third Library
import mitmproxy.http

# 作品
post_api = "https://aweme-lq.snssdk.com/aweme/v1/aweme/post/"
# 推荐
feed_api = "https://aweme-lq.snssdk.com/aweme/v2/feed/"
# 喜爱
favo_api = "https://aweme-lq.snssdk.com/aweme/v1/aweme/favorite/"
# aweme_list_api='https://aweme-lq.snssdk.com/aweme/v1/aweme/post/?'
# 动态
dongtai_list_api = "https://aweme-lq.snssdk.com/aweme/v1/forward/list/?"
# 音乐
music_list_api = "https://aweme-lq.snssdk.com/aweme/v1/original/music/list/?"
# 个人信息
profile_api = "https://aweme-lq.snssdk.com/aweme/v1/user/profile/other/?"


def send_data_to_server(header_dict, type):
    """
    :param header_dict 获取到的数据包字典
    :param type 原视频类型，feed，post，favo
        与服务端通信发送数据，使用自定义协议
        每次调用就创建一个套接字，用完就关闭
    """
    tcp_client_socket = None
    host = "127.0.0.1"
    port = 9527
    address = (host, port)
    try:
        tcp_client_socket = socket(AF_INET, SOCK_STREAM)
        tcp_client_socket.connect(address)
        if type == "post" or type == "favo" or type == "dongtai":
            json_data = json.dumps(header_dict)
            json_bytes = json_data.encode("utf-8")
            tcp_client_socket.send(struct.pack("i", len(json_bytes)))
            tcp_client_socket.send(json_bytes)
            # print(header_dict)
        elif type == "feed":
            # 先发送协议头用struct打包，包含要发送的数据大小
            data_len = header_dict["size"]
            byte_arr = header_dict["content"]
            new_dict = {"type": "feed", "size": data_len}
            json_data = json.dumps(new_dict)
            json_bytes = json_data.encode("utf-8")
            tcp_client_socket.send(struct.pack("i", len(json_bytes)))
            tcp_client_socket.send(json_bytes)
            chunk_size = 1024
            start = 0
            end = 1 * chunk_size
            # print('new_dict...........................:', new_dict)
            # 发送protubuf数据，每次发送1024个字节
            while True:
                if data_len // chunk_size > 0:
                    read_bytes = byte_arr[start:end]
                    start = end
                    end += chunk_size
                    data_len -= chunk_size
                    tcp_client_socket.send(read_bytes)
                    # print(read_bytes)
                else:
                    read_bytes = byte_arr[start:]
                    tcp_client_socket.send(read_bytes)
                    break
    except:
        pass
    if tcp_client_socket:
        tcp_client_socket.close()


def get_local_time(create_time):
    """
    :param create_time 原视频的发布时间，linux时间戳
    :return: 返回年月日格式的日期
    """
    time_local = time.localtime(int(create_time))
    pub_date = time.strftime("%Y-%m-%d", time_local)
    return pub_date


class MyAddons:
    def response(self, flow):
        if flow.request.url.startswith(post_api) or flow.request.url.startswith(
            favo_api
        ):
            if flow.response.status_code == 200:
                url_json = json.loads(flow.response.text)
                if url_json and url_json["aweme_list"]:
                    for aweme_list in url_json["aweme_list"]:
                        type = (
                            "post" if flow.request.url.startswith(post_api) else "favo"
                        )
                        header_dict = getMainInfo(aweme_list, type)
                        # aweme_id = aweme_list['aweme_id']
                        # custom_signature=aweme_list['signature']
                        # custom_verify=aweme_list['custom_verify']
                        # desc=aweme_list['desc']
                        # nickname=aweme_list['author']['nickname']
                        # music=aweme_list['music']['play_url']['url_list'][0]
                        # play_url=aweme_list['video']['play_addr']['url_list'][0]
                        # create_time = aweme_list['create_time']
                        # create_time = get_local_time(create_time)
                        # header_dict = {
                        #     'type': 'dongtai',
                        #     'custom_signature':custom_signature,
                        #     'custom_verify':custom_verify,
                        #     'desc':desc,
                        #     'music':music,
                        #     'aweme_id_create_time': aweme_id + '_' + create_time,
                        #     'nickname': nickname,
                        #     'play_url': play_url
                        # }
                        send_data_to_server(header_dict, type)
        elif flow.request.url.startswith(feed_api):
            if flow.response.status_code == 200:
                procbuf = flow.response.content
                feed_dict = {"type": "feed", "content": procbuf, "size": len(procbuf)}
                send_data_to_server(feed_dict, "feed")
        elif flow.request.url.startswith(dongtai_list_api):
            if flow.response.status_code == 200:
                url_json = json.loads(flow.response.text)
                if url_json and url_json["dongtai_list"]:
                    for aweme_list in url_json["dongtai_list"]:
                        header_dict = getMainInfo(aweme_list, "dongtai")
                        send_data_to_server(header_dict, "dongtai")
                        # aweme_id = aweme_list['aweme_id']
                        # custom_signature=aweme_list['signature']
                        # custom_verify=aweme_list['custom_verify']
                        # desc=aweme_list['desc']
                        # nickname=aweme_list['author']['nickname']
                        # music=aweme_list['music']['play_url']['url_list'][0]
                        # play_url=aweme_list['video']['play_addr']['url_list'][0]
                        # create_time = aweme_list['create_time']
                        # create_time = get_local_time(create_time)
                        # header_dict = {
                        #     'type': 'dongtai',
                        #     'custom_signature':custom_signature,
                        #     'custom_verify':custom_verify,
                        #     'desc':desc,
                        #     'music':music,
                        #     'aweme_id_create_time': aweme_id + '_' + create_time,
                        #     'nickname': nickname,
                        #     'play_url': play_url
                        # }
        elif flow.request.url.startswith(music_list_api):
            if flow.response.status_code == 200:
                url_json = json.loads(flow.response.text)
                if url_json and url_json["music"]:
                    for music_list in url_json["music"]:
                        music_id = music_list["id_str"]
                        title = music_list["title"]
                        author = music_list["author"]
                        music_url = music_list["play_url"]["url_list"][0]
                        header_dict = {
                            "type": "music",
                            "title": title,
                            "music_url": music_url,
                            "music_id": music_id,
                            "author": author,
                        }
                        send_data_to_server(header_dict, "music")


def getMainInfo(aweme_list, type):
    if type == "dongtai":
        aweme_list = aweme_list["aweme"]
    aweme_id = aweme_list["aweme_id"]
    custom_signature = aweme_list["author"]["signature"]
    custom_verify = aweme_list["author"]["custom_verify"]
    desc = aweme_list["desc"]
    nickname = aweme_list["author"]["nickname"]
    # music_url=aweme_list['music']['play_url']['url_list'][0]
    play_url = aweme_list["video"]["play_addr"]["url_list"][0]
    share_url = aweme_list["share_url"]
    create_time = aweme_list["create_time"]
    create_time = get_local_time(create_time)
    if not desc:
        desc = aweme_id + "_" + create_time
    print(desc, play_url, nickname)
    header_dict = {
        "type": type,
        "custom_signature": custom_signature,
        "custom_verify": custom_verify,
        "desc": desc,
        # 'music_url':music_url,
        "aweme_id_create_time": aweme_id + "_" + create_time,
        "nickname": nickname,
        "play_url": play_url,
    }
    return header_dict


addons = {MyAddons()}
