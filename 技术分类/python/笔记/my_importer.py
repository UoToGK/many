#!/usr/bin/env python
# coding=utf-8
"""
Author: xiaobin.zhu
since: 2022-09-06 15:08:20
LastAuthor: xiaobin.zhu
LastEditTime: 2022-09-06 15:08:21
Description: 自定义实现远程模块导入器
    python -m http.server 定义一个远程模块服务器 http://localhost:8000/  存放my_info.py 以及aa.py
    即可在文件中引用aa和my_info文件模块
具体使用:
    from my_importer import install_meta
    install_meta("http://localhost:8000/")
    import my_info, aa
    print(my_info.name, aa.age)
extra tips:
    # 重复导入my_info模块
    # my_info.__spec__.loader.load_module("my_info")
政策项目可优化点:
    1.动态开启多线程可优化为装饰器,支持run文件也可以供其他基类复用
FilePath: my_importer.py
"""


import sys
import urllib.request as urllib2
from importlib import abc
from importlib.machinery import ModuleSpec


class UrlMetaFinder(abc.MetaPathFinder):
    def __init__(self, baseurl):
        self._baseurl = baseurl

    # py3 必须是find_spec
    def find_spec(self, fullname, path=None, target=None):
        if path is None:
            baseurl = self._baseurl
        else:
            # 不是原定义的url就直接返回不存在
            if not path.startswith(self._baseurl):
                return None
            baseurl = path

        try:
            loader = UrlMetaLoader(baseurl)
            return ModuleSpec(fullname, loader, is_package=loader.is_package(fullname))
        except Exception:
            return None


class UrlMetaLoader(abc.SourceLoader):
    def __init__(self, baseurl):
        self.baseurl = baseurl

    def get_code(self, fullname):
        f = urllib2.urlopen(self.get_filename(fullname))
        return f.read()

    def get_data(self):
        pass

    def get_filename(self, fullname):
        return self.baseurl + fullname + ".py"


def install_meta(address):
    finder = UrlMetaFinder(address)
    sys.meta_path.append(finder)
