#!/usr/bin/env python
# coding=utf-8
"""
Author: xiaobin.zhu
since: 2023-02-10 11:05:27
LastAuthor: xiaobin.zhu
LastEditTime: 2023-02-10 11:05:28
Description: write something
FilePath: 11
Copyright(c): 企知道-数据采集部
"""
import base64
import zlib

ZSTRING = (
    "eNolkd1ygjAQRu/z1KgVFS2IBVFRq+JY/EFRR42o5WGa3SRXfYUuZYaLkP3O2U3CsOli7azDWBsm"
    "XirQdQW3GLixyrYqt/Exx2CGfop8jaM+BgHw8e+zI+4DOTF0ZONlg4MqtnZMcLuMwi3WJ04mWK7l"
    "OlN5Bb6HBfN84uAgXg6MY1W/C55A6ogsE9zQozrxHnR3VCO4LOtKoPL7j1GBeUcPb2Cb4JxoX47e"
    "VN3TPGKYLDG4khv2NUwigqUXgxUWHWq8UDw/oJFh6kG4YGC36Uf7OX3kEJkLvU45s5zMcbEiQC22"
    "qscpRgEIp5CbMG4ycFxdv1AfZZLYKBqO4/J4xGC6xPREmF45TFcjkYWkge5U8DZpCmzk6+iT1thv"
    "4MCmsaH5oAxaIfZ6xdil6LJHzhkGX4L3pd8hQC5s2WqIl60OiVzn6moVYx+rxIjXTBln6XtUgvec"
    "qcPx/zbfsZ/gw6UHwNsRuQXLDenZH+1eWdk="
)
ZSTRING = base64.b64decode(ZSTRING)
ZSTRING = zlib.decompress(ZSTRING, 15)
string = ZSTRING.decode("utf-8")
print(string)

S = """
我想雨逆流向上
周身迎满无数温暖旗帜，乘着风浪昂扬
与无数巨鲸向天空迁徙，似是住在腹中小人一隅
且听在鲸腹中遗迹、塌陷历史中的腔鸣
此时，它正在用力在胸中鼓出气团
压出长长的云和无数睡梦中被蒸出的回忆圈
发酵，膨胀，在天空中氤氲蒸馏
那些被吞下的，蚕食的文明此刻被抛撒在空中浮游
旧世界的碎片低语穿越云层在你耳畔语卿
诱人不断滑向深渊太空
"""
S = zlib.compress(S.encode(), 9)
S = base64.encodebytes(S).decode()
print(S)
