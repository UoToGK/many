#!/usr/bin/env python
# coding=utf-8
"""
Author: UoToGK
LastEditors: UoToGK
Date: 2022-05-28 13:56:23
LastEditTime: 2022-08-11 21:05:03
FilePath: pyredistools.py
Description:
Copyright (c) 2022 by DyTheme, All Rights Reserved.
"""

# Standard Library
import time

# Third Library
import redis
import retry

debug_str = "@debug"


class IndexTool(object):
    def __init__(self, host, port, pwd, db):
        self.ttl = 7 * 24 * 60 * 60
        self.pool = redis.ConnectionPool(host=host, port=port, password=pwd, db=db, decode_responses=True)
        self.debug = False

    def _get_conn(self):
        conn = redis.Redis(connection_pool=self.pool, decode_responses=True)
        return conn

    @retry.retry(3)
    def get(self, key, field):
        if self.debug:
            key = key + debug_str
        conn = self._get_conn()
        val = conn.hget(key, field)
        return val

    @retry.retry(3)
    def get_all(self, key):
        if self.debug:
            key = key + debug_str
        conn = self._get_conn()
        val = conn.hgetall(key)
        return val

    @retry.retry(3)
    def set(self, key, field, val):
        if self.debug:
            key = key + debug_str
        conn = self._get_conn()
        ret = conn.hset(key, field, str(val))
        conn.hset(key, "last_modify", str(time.time()))
        conn.expire(key, self.ttl)
        return ret

    @retry.retry(3)
    def hdel(self, key, field):
        if self.debug:
            key = key + debug_str
        conn = self._get_conn()
        ret = conn.hdel(key, field)
        return ret

    @retry.retry(3)
    def set_str(self, key, val):
        if self.debug:
            key = key + debug_str
        conn = self._get_conn()
        ret = conn.set(key, val)
        conn.expire(key, self.ttl)
        return ret
