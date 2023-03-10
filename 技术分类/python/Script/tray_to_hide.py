#!/usr/bin/env python
# coding=utf-8
"""
Author: UoToGK 
LastEditors: UoToGK
Date: 2022-06-04 10:55:55
LastEditTime: 2022-06-04 10:56:00
FilePath: tray_to_hide.py
Description: 
Copyright (c) 2022 by DyTheme, All Rights Reserved. 
"""

# Standard Library
import subprocess
import sys
from base64 import b64encode
from os import kill
from pathlib import WindowsPath
from signal import SIGTERM

# Third Library
import PySimpleGUIWx as sg
from win32com.client import Dispatch
from win32gui import EnumWindows, SetForegroundWindow, ShowWindow
from win32process import GetWindowThreadProcessId


# if icon file exists, encode it to base64. if not, use standard icon
def find_icon(passedWindowsPath):
    icon = passedWindowsPath.parent / (str(passedWindowsPath.name).rsplit(".", 1)[0] + ".ico")
    if icon.exists():
        with open(icon, "rb") as image_file:
            icon = b64encode(image_file.read())
    else:
        icon = sg.DEFAULT_BASE64_ICON
    return icon


# Starts the program with all of its windows hidden or shown based on initial global value
def startProgram(target, visibility):
    rawtarget = r"{}".format(target)
    SW_HIDE = visibility
    info = subprocess.STARTUPINFO()
    info.dwFlags = subprocess.STARTF_USESHOWWINDOW
    info.wShowWindow = SW_HIDE
    p = subprocess.Popen(rawtarget, startupinfo=info)
    return p.pid


# Determine the program executable to trayify by checking for arguments and,
# if none found, a single exe in the same folder
def determine_parameters():
    program = None
    number_of_arguments = len(sys.argv)
    if number_of_arguments == 2:
        if WindowsPath(sys.argv[1]).exists():
            program = WindowsPath(sys.argv[1])
    elif number_of_arguments > 2:
        sys.exit("Error: Too many arguments. Run with either no parameters or the path to ONE executable to Trayify.")
    else:
        cwd = WindowsPath(sys.executable).parent
        local_executables = list(cwd.glob("*.exe"))
        try:
            local_executables.remove(WindowsPath(sys.executable))
        except:
            pass
        if len(local_executables) == 1:
            program = local_executables[0]
        else:
            sys.exit("Error: No path was passed and there is not exactly ONE executable in the directory.")
    return program, False


# Find all windows associated with the passed PID by iterating through all windows and comparing the associated PIDs
def find_window_for_pid(pid):
    result = []

    def callback(hwnd, _):
        nonlocal result
        ctid, cpid = GetWindowThreadProcessId(hwnd)
        if cpid == pid:
            result.append(hwnd)

    EnumWindows(callback, None)
    return result


# Change the window visibility of the passed list of HWND window handles and push into foreground
# SetForegroundWindow() is buggy in Windows, can lead to occasional crashes -> disable to fix
def change_visibility(hwndlist, bool):
    for hwnd in hwndlist:
        ShowWindow(hwnd, bool)
        if bool:
            # Send keys to workaround an issue in the Windows API.
            try:
                shell.SendKeys("%")
                SetForegroundWindow(hwnd)
                shell.SendKeys("%")
            except Exception as e:
                print("Exception occured on setting window focus. This is a bug in the Windows API.")
                print(e)
    return bool


# Set parameters, start trayified program and remember its PID and visibility
program_to_trayify, window_is_visible = determine_parameters()
program_pid = startProgram(program_to_trayify, window_is_visible)


# Define tray menu and icon
menu_def = ["UNUSED", ["Toggle", "Exit"]]
tray = sg.SystemTray(menu=menu_def, data_base64=find_icon(program_to_trayify))
shell = Dispatch("WScript.Shell")

# Main loop
while True:
    event = tray.read()
    print(event)
    if event == "Exit":
        # On Exit, attempt to gracefully terminate trayified process and end Trayify
        try:
            kill(program_pid, SIGTERM)
        finally:
            break
    elif event in ["Toggle", "__DOUBLE_CLICKED__"]:
        # On toggle, find all windows associated with pid at the time, then change visibility
        program_hwndlist = find_window_for_pid(program_pid)
        window_is_visible = change_visibility(program_hwndlist, not window_is_visible)


# todo:
# icon aus der exe auslesen??
# mehrere programme zugleich trayifyen lassen??
