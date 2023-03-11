#!/usr/bin/env python
# coding=utf-8
"""
Author: UoToGK
LastEditors: UoToGK
Date: 2022-05-31 10:29:02
LastEditTime: 2022-06-04 10:39:43
FilePath: dbutils.py
Description:

CREATE TABLE `qy_info_from_zyj` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `company_name` varchar(255) DEFAULT NULL COMMENT '公司全名',
  `short_name` varchar(255) DEFAULT NULL COMMENT '简称',
  `people_num` varchar(255) DEFAULT NULL COMMENT '人气',
  `fans` varchar(255) DEFAULT NULL COMMENT '粉丝',
  `liker` varchar(255) DEFAULT NULL COMMENT '喜欢',
  `feedback` varchar(255) DEFAULT NULL COMMENT '反馈',
  `tag_list` varchar(255) DEFAULT NULL COMMENT '上榜关键词',
  `industry` varchar(255) DEFAULT NULL COMMENT '行业',
  `decription` text COMMENT '公司简介',
  `crawl_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '采集时间',
  `detail_url` varchar(255) NOT NULL COMMENT '详情页链接',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_detail_url` (`detail_url`) USING BTREE,
  KEY `idx_crawl_time` (`crawl_time`),
  KEY `idx_company_name` (`company_name`)
) ENGINE=InnoDB AUTO_INCREMENT=381418 DEFAULT CHARSET=utf8mb4 COMMENT='职友集_企业数据，create by xiaobin.zhu';

Copyright (c) 2022 by DyTheme, All Rights Reserved.
"""


# Third Library
import pymysql
from dbutils.pooled_db import PooledDB
from loguru import logger as logging


class MySQLHelper:
    _pool = None

    def __init__(
        self,
        *,
        host,
        port,
        user,
        password,
        database,
        use_unicode=True,
        charset="utf8mb4",
        min_cached=10,
        max_cached=10,
        max_shared=20,
        max_connections=100,
        blocking=True,
        max_usage=0,
        set_session="",
    ):
        if self._pool is None:
            self._pool = PooledDB(
                creator=pymysql,
                host=host,
                port=port,
                user=user,
                password=password,
                database=database,
                use_unicode=use_unicode,
                charset=charset,
                mincached=min_cached,
                maxcached=max_cached,
                maxshared=max_shared,
                maxconnections=max_connections,
                blocking=blocking,
                maxusage=max_usage,
                setsession=set_session,
            )

    def get_conn(self):
        conn = self._pool.connection()
        cursor = conn.cursor()
        return cursor, conn

    def createDataBase(self, DB_NAME):
        # 创建数据库
        self.cur.execute("CREATE DATABASE IF NOT EXISTS %s  DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci" % DB_NAME)
        self.con.select_db(DB_NAME)
        print("creatDatabase:" + DB_NAME)

    def select_all_with_callback(self, *, sql="", param=(), callback=None):
        """
        description:  插出来的每条数据调用callback
        param {*}
        return {*}
        """
        if callback is None:
            logging.warning("failed to select with callback, callback is None")
            return
        cursor, conn = None, None
        try:
            cursor, conn = self.execute(sql=sql, param=param)
            res = cursor.fetchone()
            while res is not None:
                callback(res)
                res = cursor.fetchone()
            self.close(cursor, conn)
        except Exception as e:
            logging.exception("failed to select with call_back %s, params %s", sql, param, exc_info=e)
            self.close(cursor, conn)

    def select_all(self, *, sql="", param=()):
        """
        description: select_all
        param {*}sql
        return {*}
        """
        cursor, conn = None, None
        try:
            cursor, conn = self.execute(sql=sql, param=param)
            res = cursor.fetchall()
            self.close(cursor, conn)
            return res
        except Exception as e:
            logging.exception("failed to select many %s, params %s", sql, param, exc_info=e)
            self.close(cursor, conn)
            return None

    def select_one(self, sql="", param=()):
        cursor, conn = None, None
        try:
            cursor, conn = self.execute(sql=sql, param=param)
            res = cursor.fetchone()
            self.close(cursor, conn)
            return res
        except Exception as e:
            # Standard Library
            import traceback

            print(traceback.format_exc())
            logging.exception("failed to select one %s, params %s", sql, param, exc_info=e)
            self.close(cursor, conn)
            return None

    def fetchmany(self, *, sql="", size=None, param=()):
        cursor, conn = None, None
        try:
            cursor, conn = self.execute(sql=sql, param=param)
            res = cursor.fetchmany(size)
            self.close(cursor, conn)
            return res
        except Exception as e:
            logging.exception("failed to select one %s, params %s", sql, param, exc_info=e)
            self.close(cursor, conn)
            return None

    def insert(self, sql="", param=()):
        cursor, conn = None, None
        try:
            cursor, conn = self.execute(sql=sql, param=param)
            _id = cursor.rowcount
            self.close(cursor, conn)
            return _id
        except Exception as e:
            logging.exception("failed to insert %s, params %s", sql, param, exc_info=e)
            conn.rollback()
            self.close(cursor, conn)
            return 0

    def insert_many(self, *, sql="", param=()):
        cursor, conn = self.get_conn()
        try:
            cursor.executemany(sql, param)
            conn.commit()
            self.close(cursor, conn)
            return True
        except Exception as e:
            logging.exception("failed to insert many %s, params %s", sql, param, exc_info=e)
            conn.rollback()
            self.close(cursor, conn)
            return False

    def delete(self, *, sql="", param=()):
        cursor, conn = None, None
        try:
            cursor, conn = self.execute(sql=sql, param=param)
            self.close(cursor, conn)
            return True
        except Exception as e:
            logging.exception("failed to delete %s, params %s", sql, param, exc_info=e)
            conn.rollback()
            self.close(cursor, conn)
            return False

    def update(self, *, sql="", param=()):
        cursor, conn = None, None
        try:
            cursor, conn = self.execute(sql=sql, param=param)
            _id = cursor.rowcount
            logging.info(f"数据更新成功，{_id}")
            self.close(cursor, conn)
            return _id
        except Exception as e:
            logging.exception("failed to update %s, params %s", sql, param, exc_info=e)
            conn.rollback()
            self.close(cursor, conn)
            return 0

    def execute(self, *, sql="", param=(), auto_close=True):
        cursor, conn = self.get_conn()
        try:
            if param:
                cursor.execute(sql, param)
            else:
                cursor.execute(sql)
            conn.commit()
            if auto_close:
                self.close(cursor, conn)
        except Exception as e:
            logging.exception("failed to execute %s, params %s", sql, param, exc_info=e)
            conn.rollback()
        return cursor, conn

    def execute_many(self, *, sql_list=None):
        if sql_list is None:
            sql_list = []
        cursor, conn = self.get_conn()
        try:
            for order in sql_list:
                sql = order["sql"]
                param = order["param"]
                if param:
                    cursor.execute(sql, param)
                else:
                    cursor.execute(sql)
            conn.commit()
            self.close(cursor, conn)
            return True
        except Exception as e:
            logging.exception("failed to execute %s", sql_list, exc_info=e)
            conn.rollback()
            self.close(cursor, conn)
            return False

    def table_exists(self, tablename):
        # tablename是传过来的表名
        logging.info("tablename:" + tablename)
        sql = "show tables;"
        cursor, conn = self.get_conn()
        cursor.execute(sql)  # 执行sql语句
        tables = [cursor.fetchall()]  # 返回所有结果
        # Standard Library
        import re

        table_list = re.findall("('.*?')", str(tables))
        table_list = [re.sub("'", "", each) for each in table_list]
        if tablename in table_list:  # 存在
            return True
        else:  # 不存在
            return False

    def close(self, cursor, conn):
        if cursor is not None:
            cursor.close()
        if conn is not None:
            conn.close()
