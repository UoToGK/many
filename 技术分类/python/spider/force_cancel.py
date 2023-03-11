# Standard Library
import time

# Third Library
import win32con
import win32gui

"""
python 操作windows api  取消窗口操作
"""


def get_child_windows(parent):
    """
    获得parent的所有子窗口句柄
     返回子窗口句柄列表
    """
    if not parent:
        return
    hwndChildList = []
    win32gui.EnumChildWindows(parent, lambda hwnd, param: param.append(hwnd), hwndChildList)
    return hwndChildList


def _MyCallback(hwnd, extra):
    windows = extra
    temp = []
    if win32gui.GetClassName(hwnd) == "#32770":
        temp.append(hwnd)
        temp.append(win32gui.GetClassName(hwnd))
        temp.append(win32gui.GetWindowText(hwnd))
        windows[hwnd] = temp


def find_cancle(child_list):
    for hwnd in child_list:
        title = win32gui.GetWindowText(hwnd)
        clsname = win32gui.GetClassName(hwnd)
        if title == "确定" and clsname == "Button":
            win32gui.SendMessage(hwnd, win32con.BM_CLICK, None, None)
            print(hwnd, title, clsname)


def EnumWindows():
    windows = {}
    win32gui.EnumWindows(_MyCallback, windows)
    if windows:
        for k, v in windows.items():
            if v[2] != "":
                print(v[2])
                child_list = get_child_windows(k)
                find_cancle(child_list)


if __name__ == "__main__":
    while True:
        try:
            EnumWindows()
        except Exception:
            pass
        time.sleep(1)
