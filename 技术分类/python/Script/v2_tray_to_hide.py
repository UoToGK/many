#!/usr/bin/env python
# coding=utf-8
"""
Author: UoToGK 
LastEditors: UoToGK
Date: 2022-06-04 11:04:25
LastEditTime: 2022-08-12 21:41:07
FilePath: v2_tray_to_hide.py
Description: 
Copyright (c) 2022 by DyTheme, All Rights Reserved. 
"""

# Standard Library
import winreg

# Third Library
import win32api
import win32con
import win32gui


def getFileDescription(windows_exe):

    language, codepage = win32api.GetFileVersionInfo(windows_exe, "\\VarFileInfo\\Translation")[0]
    stringFileInfo = "\\StringFileInfo\\%04X%04X\\%s" % (language, codepage, "FileDescription")
    description = win32api.GetFileVersionInfo(windows_exe, stringFileInfo)
    return description


def hide_from_taskbar(hw):
    try:
        win32gui.ShowWindow(hw, win32con.SW_HIDE)
        win32gui.SetWindowLong(hw, win32con.GWL_EXSTYLE, win32gui.GetWindowLong(hw, win32con.GWL_EXSTYLE) | win32con.WS_EX_TOOLWINDOW)

    except win32gui.error:
        print("Error while hiding the window")
        return None


access_registry = winreg.ConnectRegistry(None, winreg.HKEY_CLASSES_ROOT)
key = winreg.OpenKey(access_registry, r".py")


def get_values(key):
    key_dict = {}
    i = 0
    while True:
        try:
            subvalue = winreg.EnumValue(key, i)
        except WindowsError as e:
            break
        key_dict[subvalue[0]] = subvalue[1:]
        i += 1
    return key_dict


keypy = get_values(key)

keypyint = winreg.OpenKey(access_registry, keypy[""][0] + "\shell\open\command")
keypyint = get_values(keypyint)

# cmd = getFileDescription('C:\Windows\System32\cmd.exe')
powershelll = getFileDescription("C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe")
pyinterpreter = getFileDescription(keypyint[""][0].split('"')[1])

while True:

    if win32gui.FindWindow(None, powershelll) == 0:
        continue
    else:
        powershell = win32gui.FindWindow(None, powershelll)
        win32gui.ShowWindow(powershell, win32con.SW_HIDE)
        hide_from_taskbar(powershell)

    # cmd = win32gui.FindWindow(None,'Prompt dei comandi')
    # win32gui.ShowWindow(cmd , win32con.SW_HIDE)
    # hide_from_taskbar(cmd)

    # pyinterpreter = win32gui.FindWindow(None,pyinterpreter)
    # win32gui.ShowWindow(pyinterpreter , win32con.SW_HIDE)
    # hide_from_taskbar(pyinterpreter)
