#!/usr/bin/env python
# coding=utf-8
"""
Author: xiaobin.zhu
since: 2022-11-22 20:46:55
LastAuthor: xiaobin.zhu
LastEditTime: 2022-11-22 20:46:56
Description: write something
FilePath: des_adptor
"""

import random
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.ssl_ import create_urllib3_context

"""
'ECDH+AESGCM:DH+AESGCM:ECDH+AES256:DH+AES256:RSA+3DES:!aNULL:'
'!eNULL:!MD5'
"""
ORIGIN_CIPHERS = ":".join(
    [
        "ECDHE+AESGCM",
        # "ECDHE+CHACHA20",
        # "DHE+AESGCM",
        # "DHE+CHACHA20",
        # "ECDH+AESGCM",
        "DH+AESGCM",
        "ECDH+AES256",
        "DH+AES256",
        # "RSA+AESGCM",
        "RSA+3DAES",
        "!aNULL",
        "!eNULL",
        "!MD5",
        # "!DSS",
    ]
)


class DESAdapter(HTTPAdapter):
    def __init__(self, *args, **kwargs):
        """
        A TransportAdapter that re-enables 3DES support in Requests.
        """
        CIPHERS = ORIGIN_CIPHERS.split(":")
        random.shuffle(CIPHERS)
        CIPHERS = ":".join(CIPHERS)
        self.CIPHERS = CIPHERS
        super().__init__(*args, **kwargs)

    def init_poolmanager(self, *args, **kwargs):
        context = create_urllib3_context(ciphers=self.CIPHERS)
        kwargs["ssl_context"] = context
        return super(DESAdapter, self).init_poolmanager(*args, **kwargs)

    def proxy_manager_for(self, *args, **kwargs):
        context = create_urllib3_context(ciphers=self.CIPHERS)
        kwargs["ssl_context"] = context
        return super(DESAdapter, self).proxy_manager_for(*args, **kwargs)


if __name__ == "__main__":
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36 Edg/92.0.902.67"
    }
    s = requests.Session()
    s.headers.update(headers)

    for _ in range(5):
        s.mount("https://ja3er.com", DESAdapter())
        resp = s.get("https://ja3er.com/json").json()
        print(resp)
