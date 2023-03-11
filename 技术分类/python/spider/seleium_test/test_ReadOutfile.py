# coding: utf-8
# Standard Library
import os
import sys
from pprint import pprint

# Third Library
from wechatarticles.ReadOutfile import Reader

sys.path.append(os.getcwd())

if __name__ == "__main__":
    outfile = "outfile"
    reader = Reader()
    reader.contral(outfile)
    appmsg_token, cookie = reader.request(outfile)
    print(appmsg_token, cookie)
