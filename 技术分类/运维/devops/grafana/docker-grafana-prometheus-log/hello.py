#!/usr/bin/env python
# coding=utf-8
"""
Author: xiaobin.zhu
since: 2022-09-13 11:30:01
LastAuthor: xiaobin.zhu
LastEditTime: 2022-09-13 11:30:02
Description: write something
FilePath: hello
"""

import sysconfig

config_values = sysconfig.get_config_vars()
print("Found {} configuration settings".format(len(config_values.keys())))

print("\nSome highlights:\n")

print(" Installation prefixes:")
print("  prefix={prefix}".format(**config_values))
print("  exec_prefix={exec_prefix}".format(**config_values))

print("\n Version info:")
print("  py_version={py_version}".format(**config_values))
print("  py_version_short={py_version_short}".format(**config_values))
print("  py_version_nodot={py_version_nodot}".format(**config_values))

print("\n Base directories:")
print("  base={base}".format(**config_values))
print("  platbase={platbase}".format(**config_values))
print("  userbase={userbase}".format(**config_values))
print("  srcdir={srcdir}".format(**config_values))

print("\n Compiler and linker flags:")
