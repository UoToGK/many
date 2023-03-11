#!/usr/bin/env python
# coding=utf-8
"""
Author: UoToGK 
LastEditors: UoToGK
Date: 2022-04-17 18:01:35
LastEditTime: 2022-04-17 18:01:41
FilePath: send_text_weixin.py
Description: 
Copyright (c) 2022 by DyTheme, All Rights Reserved. 
"""

# Standard Library
import time

# Third Library
import pyautogui
import win32api
import win32clipboard as w
import win32con
import win32gui


def FindWindow(chatroom):
    win = win32gui.FindWindow(None, chatroom)
    print("找到窗口句柄：%x" % win)
    if win != 0:
        win32gui.ShowWindow(win, win32con.SW_SHOWMINIMIZED)
        win32gui.ShowWindow(win, win32con.SW_SHOWNORMAL)
        win32gui.ShowWindow(win, win32con.SW_SHOW)
        win32gui.SetWindowPos(
            win, win32con.HWND_TOP, 0, 0, 500, 700, win32con.SWP_SHOWWINDOW
        )
        win32gui.SetForegroundWindow(win)  # 获取控制
        time.sleep(1)
        tit = win32gui.GetWindowText(win)
        print("已启动【" + str(tit) + "】窗口")
    else:
        print("找不到【%s】窗口" % chatroom)
        exit()


# 设置和粘贴剪贴板
def ClipboardText(ClipboardText):
    w.OpenClipboard()
    w.EmptyClipboard()
    w.SetClipboardData(win32con.CF_UNICODETEXT, ClipboardText)
    w.CloseClipboard()
    time.sleep(1)
    win32api.keybd_event(17, 0, 0, 0)
    win32api.keybd_event(86, 0, 0, 0)
    win32api.keybd_event(86, 0, win32con.KEYEVENTF_KEYUP, 0)
    win32api.keybd_event(17, 0, win32con.KEYEVENTF_KEYUP, 0)


# 模拟发送动作
def SendMsg():
    win32api.keybd_event(18, 0, 0, 0)
    win32api.keybd_event(83, 0, 0, 0)
    win32api.keybd_event(18, 0, win32con.KEYEVENTF_KEYUP, 0)
    win32api.keybd_event(83, 0, win32con.KEYEVENTF_KEYUP, 0)


# 模拟发送微信文本消息
def SendWxMsg(wxid, sendtext):
    # 先启动微信
    FindWindow("微信")
    time.sleep(1)
    # 定位到搜索框
    pyautogui.moveTo(143, 39)
    pyautogui.click()
    # 搜索微信
    ClipboardText(wxid)
    time.sleep(1)
    # 进入聊天窗口
    pyautogui.moveTo(155, 120)
    pyautogui.click()
    # 粘贴文本内容
    ClipboardText(sendtext)
    # 发送
    SendMsg()
    print("已发送")
    # 关闭微信窗口
    time.sleep(1)
    pyautogui.moveTo(683, 16)
    pyautogui.click()


# 模拟发送文件消息（图片、文档、压缩包等）
def SendWxFileMsg(wxid, imgpath):
    # 先启动微信
    FindWindow("微信")
    time.sleep(1)
    # 定位到搜索框
    pyautogui.moveTo(143, 39)
    pyautogui.click()
    # 搜索微信
    ClipboardText(wxid)
    time.sleep(1)
    # 进入聊天窗口
    pyautogui.moveTo(155, 120)
    pyautogui.click()
    # 选择文件
    pyautogui.moveTo(373, 570)
    pyautogui.click()
    ClipboardText(imgpath)
    time.sleep(1)
    pyautogui.moveTo(784, 509)
    pyautogui.click()
    # 发送
    SendMsg()
    print("已发送")
    # 关闭微信窗口
    time.sleep(1)
    pyautogui.moveTo(683, 16)
    pyautogui.click()


# 转发群里最新的一条消息
def ZhuanfaMsg(wxid, groupname):
    # 先启动微信
    FindWindow("微信")
    time.sleep(1)
    # 定位到搜索框
    pyautogui.moveTo(143, 39)
    pyautogui.click()
    # 搜索群
    ClipboardText(groupname)
    time.sleep(1)
    # 进入群窗口
    pyautogui.moveTo(155, 120)
    pyautogui.click()
    # 开始转发
    pyautogui.moveTo(484, 439)
    time.sleep(1)
    pyautogui.rightClick()
    pyautogui.moveTo(543, 454)
    time.sleep(1)
    pyautogui.click()
    # 搜索用户
    ClipboardText(wxid)
    time.sleep(1)
    pyautogui.moveTo(828, 406)
    pyautogui.click()
    time.sleep(1)
    # 确定转发
    pyautogui.moveTo(1108, 755)
    pyautogui.click()


# 发送文本消息（微信号或微信昵称或备注，需要发送的文本消息）
SendWxMsg("sansure2016", "Python发送微信消息")

# 发送文件消息（图片、文档、压缩包等）
SendWxFileMsg("sansure2016", r"C:\Users\TANKING\Desktop\cbzqx77.jpg")

# 转发群里最新的一条消息（微信号或微信昵称或备注，群名称）
ZhuanfaMsg("sansure2016", "里客云科技")
