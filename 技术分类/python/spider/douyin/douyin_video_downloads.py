"""
===================================================
    -*- coding:utf-8 -*-
    FileName   :douyin_video_downloads.py
====================================================
"""
# Standard Library
import json
import os
import struct
import sys
import threading
import time
import warnings
from queue import Queue
from socket import *

# Third Library
import requests
from parase_data import Get_file_size, Get_real_play_addr_by_web, Get_url_from_protobuf

warnings.filterwarnings("ignore")
headers = {
    "User-Agent": "Mozilla/5.0 (Linux; Android 6.0; ZTE BA520 Build/MRA58K; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/55.0.2883.77 Mobile Safari/537.36"
}

que = Queue()
chunk_size = 1024
# 下载线程
def Download(path, index):
    print("start Download")
    while True:
        global que
        if que.empty():
            print("No.{} thread is waiting for data...".format(index))
        data = que.get()
        desc = data["desc"]
        # music_url=data["music_url"]
        dir_name = data["type"]
        file_name = data["aweme_id_create_time"]
        suffix = ".mp4"
        if dir_name == "feed":
            play_url, create_time = Get_real_play_addr_by_web(
                data["aweme_id_create_time"]
            )
            if (not play_url) or (not create_time):
                continue
            file_name = file_name + "_" + create_time
            dir_path = os.path.join(path, dir_name)
        elif dir_name == "music":
            suffix = ".mp3"
            dir_path = os.path.join(path, dir_name, data["author"])
            play_url = data["music_url"]
            desc = data["title"]
        else:
            dir_path = os.path.join(path, dir_name, data["nickname"])
            play_url = data["play_url"]
        if not os.path.exists(dir_path):
            os.makedirs(dir_path)

        file_path = os.path.join(dir_path, file_name + suffix)
        read_size = 0
        if os.path.exists(file_path):
            continue
        try:
            response = requests.get(url=play_url, headers=headers, verify=False)
            if response.status_code == 200:
                # print(response.headers)
                total_szie = int(response.headers["Content-Length"])
                print(
                    "NO.{} thread is downloading... {} filesize:{}".format(
                        index,
                        data["aweme_id_create_time"] + suffix,
                        Get_file_size(total_szie),
                    )
                )
                t_1 = time.time()
                print("file storge in {}".format(file_path))
                with open(file_path, "wb") as fp:
                    for data in response.iter_content(chunk_size=chunk_size):
                        if data:
                            fp.write(data)
                            read_size += chunk_size
                            # print('No.{} threading is downloading: {} ...: {}%'.format(index, file_path, str(round(read_size / total_szie * 100, 2))))
                print(
                    "No.{} thread finshed! total cost: {}s".format(
                        index, str(round(time.time() - t_1, 2))
                    )
                )
                time.sleep(0.2)
            else:
                print("cannot conneted with the servers...")
        except:
            print("downloading %s failed... network error please try againg" % play_url)
            # que.put(data)


# 服务端用于接收mitm脚本发送的数据
def run(exe_path, file_path):
    PORT = 9527
    HOST = ""
    address = (HOST, PORT)
    tcp_server_socket = socket(AF_INET, SOCK_STREAM)
    tcp_server_socket.bind(address)
    print("the server is lunching, listeing the port {}...".format(address[1]))
    tcp_server_socket.listen(5)
    while True:
        try:
            client_socket, client_address = tcp_server_socket.accept()
            print(
                "the client{} linked:{}".format(
                    client_address, time.asctime(time.localtime(time.time()))
                )
            )
            data = client_socket.recv(4)
            header_size = struct.unpack("i", data)[0]
            header_bytes = client_socket.recv(header_size)
            header_json = json.loads(header_bytes.decode("utf-8"))
            print("嗨咯，我收到了数据哦~~~~~~~~~~~~~~~~~~~~~", header_json["type"])
            if (
                header_json["type"] == "post"
                or header_json["type"] == "favo"
                or header_json["type"] == "dongtai"
            ):
                que.put(header_json)
            else:
                chunk_size = 1024
                read_size = 0
                total_size = header_json["size"]
                if not os.path.exists(file_path):
                    os.makedirs(file_path)
                with open(file_path, "wb") as fp:
                    while read_size < total_size:
                        data = client_socket.recv(chunk_size)
                        if data:
                            fp.write(data)
                        read_size += len(data)
                probuf = Get_url_from_protobuf()
                url_list = probuf.get_url(exe_path, file_path)
                for url in url_list:
                    try:
                        feed_dict = {
                            "type": "feed",
                            "feed_url": url,
                            "aweme_id_create_time": url[38:57],
                        }  # 只是视频的id，并没有发布时间
                        que.put(feed_dict)
                    except:
                        continue
            client_socket.close()
        except:
            tcp_server_socket.close()
    print("never run here...")


if __name__ == "__main__":
    dir_path = r"F:\spider\weixin_read\douyin\videos"
    if dir_path.endswith("/"):
        dir_path += "/"
    if not os.path.exists(dir_path):
        os.makedirs(dir_path)
    # dir_path = r'C:\Users\Administrator\Desktop\pytho_src\douyin\videos'
    thread_list = []
    # 启动多线程下载
    for i in range(9):
        if i == 0:
            thread_list.append(
                threading.Thread(
                    target=run,
                    args=(
                        r".\protobuf\protoc.exe",
                        r".\probuf.bin",
                    ),
                )
            )
        else:
            thread_list.append(
                threading.Thread(
                    target=Download,
                    args=(
                        dir_path,
                        i + 1,
                    ),
                )
            )
        thread_list[i].setDaemon = True
    [i.start() for i in thread_list]
    [i.join() for i in thread_list]
    # #run(r'.\protobuf\protoc.exe', r'.\probuf.bin')
    # print("finish!")
