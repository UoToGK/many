#!/usr/bin/env python
# -*- coding: utf-8 -*-
import base64
from hashlib import md5
import json
import math
from os.path import abspath, dirname, join
import random
import re
from threading import Thread
import time
from urllib.parse import unquote, quote

import execjs
import requests
import urllib3
from Crypto.Cipher import AES, PKCS1_v1_5
from Crypto.PublicKey import RSA
from Crypto.Util.Padding import unpad
from fake_headers import Headers
from loguru import logger

# from des_adaper import DESAdapter

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
cur_dir = join(abspath(dirname(__file__)), ".")
print((cur_dir))
with open(f"{cur_dir}/core.js", "r", encoding="utf-8") as f:
    sm_js = f.read()


def work1(ua):
    def e(e, t):
        n = 0
        i = 0
        for n in range(len(t)):
            i |= r[n] << 8 * n
        return e ^ i

    i = ua["User-Agent"]
    t = 0
    n = 0
    r = []
    a = 0
    for t in range(len(i)):
        n = ord(i[t])
        r.insert(0, 255 & n)
        if len(r) >= 4:
            a = e(a, r)
            r = []
    if len(r) > 0:
        a = e(a, r)
        return hex(a)


def generate_distinct_id(ua):
    screen = {"height": 1080, "width": 1920}
    t = hex((screen.get("height", 1080) * screen.get("width", 1920)))
    get_time = lambda t: int(round(time.time() * 1000))
    Ve = lambda t: math.ceil(((9301 * get_time("abc") + 49297) % 233280) / 233280 * t)
    C = lambda t: Ve(1e19) / 1e19
    e = lambda t: str(hex(get_time("abc")).replace("0x", "") + hex(random.randint(1000, 9999))).replace("0x", "")
    defau_ua = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"}
    a = e("abc")
    b = e("abc")
    c = work1(ua) if work1(ua) else work1(defau_ua)
    distinct_id = a + "-" + hex(int(str(C("abc")).replace(".", ""))) + "-" + c + "-" + t + "-" + b
    return distinct_id


def de(e):
    n = []
    for i in range(len(str(e))):
        if ord(str(e)[i : i + 1]) < 126:
            s = (ord(str(e)[i : i + 1]) + 13) % 126
            n.append(chr(s))
    return "".join(n)


def get_sensorsdata2015jssdkcross(ua):
    distinct_id = generate_distinct_id(ua)
    identities = {"$identity_cookie_id": distinct_id}
    identities = de(json.dumps(identities))
    sensorsdata2015jssdkcross = {
        "distinct_id": distinct_id,
        "first_id": "",
        "props": {
            #  "付费广告流量",
            "$latest_traffic_source_type": ["引荐流量", "社交网站流量", "直接流量", "自然搜索流量"][math.floor(random.random() * 4)],
            #  "未取到值_直接打开" : "未取到值_非http的url"  "未取到值"
            "$latest_search_keyword": "未取到值_直接打开",
            "$latest_referrer": ["https://cn.bing.com/", "https://www.baidu.com/"][math.floor(random.random() * 2)],
        },
        "identities": identities,
        "history_login_id": {"name": "", "value": ""},
        "$device_id": distinct_id,
    }
    t = json.dumps(sensorsdata2015jssdkcross)
    sensorsdata2015jssdkcross = quote(t.replace("\r\n", ""))
    return {"sensorsdata2015jssdkcross": sensorsdata2015jssdkcross}


key_dict = {
    1: "xc46VoB49X3PGYAg",
    2: "KE3pb84wxqLTZEG3",
    3: "18Lw0OEaBBUwHYNT",
    4: "jxxWWIzvkqEQcZrd",
    5: "40w42rjLEXxYhxRn",
    6: "K6hkD03WNW8N1fPM",
    7: "I8V3IwIhrwNbWxqz",
    8: "3JNNbxAP4zi5oSGA",
    9: "7pUuESQl8aRTFFKK",
    10: "KB4GAHN6M5soB3WV",
}


def decrypt(data, hasUse):
    html = base64.b64decode(data)
    key = key_dict[hasUse].encode()
    aes = AES.new(key=key, mode=AES.MODE_ECB)
    info = aes.decrypt(html)
    decrypt_data = unpad(info, 16).decode()
    return decrypt_data


def encrypt(msg):
    key = """-----BEGIN PUBLIC KEY-----
    MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCGwmr39OKRP1KaI4REddlpLDrcuTDh23G+ZdTerHqiN835GR+AjAcvtuLGBfYMf3eqOLHJcJ5oU/UR8ODmOSnYATDwqYpoV42lq4OzqSBgElFQXw0LDAMefo/ITfBnUD1/ZTZ+Lh2JhgP7FxtpQb1cverqhNWiO3u+4KBz69p3SQIDAQAB
    -----END PUBLIC KEY-----"""
    publickey = RSA.importKey(key)
    pk = PKCS1_v1_5.new(publickey)
    encrypt_text = pk.encrypt(msg.encode("utf-8"))
    result = base64.b64encode(encrypt_text)
    return result.decode("utf-8")


def md5_encrypt(x):
    if not isinstance(x, bytes):
        x = x.encode()
    n = md5()
    n.update(x)
    return n.hexdigest()


def get_proxies(proxy_type="random"):
    # proxy = requests.get(f"http://192.168.9.3:55555/{proxy_type.lower()}").text.strip()
    proxy = "127.0.0.1:7890"
    return {"http": "http://" + proxy, "https": "http://" + proxy}


class Policy(object):
    def __init__(self):
        self.session = requests.session()
        self.pid = "fyw9n1jhpf@3a1b5a97673481b"
        self.proxies = get_proxies()
        self.ua = Headers(True).generate().get("User-Agent")
        # self.ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
        self.headers = {"User-Agent": self.ua}
        self.session.proxies.update(self.proxies)
        self.session.headers.update(self.headers)
        # self.session.mount("http://", DESAdapter())
        # self.session.mount("https://", DESAdapter())
        self.detail_cookie = None
        self.sdk_ctx = execjs.compile(sm_js)
        logger.info(f"self.headers -> {self.headers}")
        logger.debug(f"proxies -> {self.proxies}")

    def get_signature(self):
        i = ""
        n = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
        for _ in range(6):
            a = round(random.random() * 61)
            i += n[a]
        r = md5(i.encode()).hexdigest()
        res = md5((r + "undefinedundefined").encode()).hexdigest()
        return res + "." + i

    def get_eagleeye_sessionid(self):
        n = []
        r = int(time.time() * 1000)
        r = self.base_encode(r)
        r = list(r)
        for i in range(20):
            e = int(random.random() * 36)
            t = self.base_encode(e)
            res = t if e % 3 else t.upper()
            n.append(res)
        for i in range(8):
            j = 3 * i + 2
            res = r[i]
            n.insert(j, res)

        return "".join(n)

    @staticmethod
    def base_encode(number, base=36):
        num_str = "0123456789abcdefghijklmnopqrstuvwxyz"
        if number == 0:
            return "0"

        base36 = []
        while number != 0:
            number, ii = divmod(number, base)  # 返回 number// 36 , number%36
            base36.append(num_str[ii])

        return "".join(reversed(base36))

    def get_eagleeye_traceid(self):
        _ip = self.get_randip()
        t = int(time.time() * 1000)
        i = 1000
        r = _ip + str(t) + str(i) + "3481b"
        return r

    def get_randip(self):
        e = []
        for t in range(4):
            i = math.floor(256 * random.random())
            res = "" if i > 15 else "0"
            res += self.base_encode(i, 16)
            e.append(res)
        e = "".join(e)
        e = re.sub("^0", "1", e)
        return e

    def get_uuid(self, signature, ua):
        e = ua
        n = "".join(e[:8]) + (str(int(time.time() * 1000)) + "".join(e[-6:]) + signature)
        return md5_encrypt(n)

    def main(self, init_url, req_url, json_body):
        for _ in range(3):
            res = None
            try:
                res = self.session.get(init_url, verify=False, timeout=3)
            except Exception:
                logger.warning("init cookie exception")
            if res:
                break

        data = self.sdk_ctx.call("get_data", self.headers.get("User-Agent"))  # 保证useragent一致
        smidV2 = self.sdk_ctx.call("getLocalsmid")
        ep = encrypt(data["sdk_data"]["ep"])
        smAesData = data["sdk_data"]["smAesData"]
        # self.detail_cookie = data["cookie"]
        gen_cookie = get_sensorsdata2015jssdkcross(self.headers)
        self.detail_cookie = gen_cookie
        # self.session.cookies.update(gen_cookie)

        v4_url = "https://fp-it.portal101.cn/deviceprofile/v4"
        v4_json = {
            "appId": "default",
            "compress": 2,
            "data": smAesData,
            "ep": ep,
            "encode": 5,
            "organization": "CSrn3Jcu7Q3n5GGcqTbb",
            "os": "web",
        }

        try:
            r = self.session.post(url=v4_url, timeout=3, json=v4_json)
            data = r.json()
        except Exception as e:
            logger.warning(f"代理异常  {json_body['current']} {e}")
            logger.debug(f"获取deviceId失败 {json_body['current']}")
        print(data)
        if data.get("code") == 1100:
            device_id = data.get("detail", "").get("deviceId", "")
        else:
            device_id = "D" + base64.b64encode(json.dumps(v4_json).encode()).decode()
            logger.debug(f" NOT smID 生成smID  smidV2:{smidV2}")
            self.detail_cookie.update({"smidV2": smidV2})
            # return False
        logger.info(f"device_id:{device_id}")

        self.detail_cookie.update(
            {
                ".thumbcache_de0d870e3139ba2368b2e7ea8f11063c": device_id,
                "sajssdk_2015_cross_new_user": "1",
                "s_webp": "s",
                "sensorsdata2015jssdkchannel": "%7B%22prop%22%3A%7B%22_sa_channel_landing_url%22%3A%22%22%7D%7D",
                "smidV2": smidV2,
                "_bl_uid": self.sdk_ctx.call("get_bl_uid"),
            }
        )
        signature = self.get_signature()
        user_agent_web = self.session.cookies.get("wz_uuid") if self.session.cookies.get("wz_uuid") else f"X/{self.get_uuid(signature, self.ua)}"
        headers = {
            "accept": "application/json, text/plain, */*",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "zh-CN,zh;q=0.9",
            "content-type": "application/json; charset=UTF-8",
            "origin": "https://zhengce.qizhidao.com",
            "eagleeye-pappname": "fyw9n1jhpf@e3fdbf165821069",
            "eagleeye-sessionid": self.get_eagleeye_sessionid(),
            "eagleeye-traceid": self.get_eagleeye_traceid(),
            "referer": quote(init_url, safe=":|/|?|=|&"),
            "device-id": "B" + device_id,
            "signature": signature,
            "device": "0",
            "h5version": "v1.0.0",
            "user-agent-web": unquote(user_agent_web),
            "x-web-ip": self.session.cookies.get("x-web-ip"),
        }
        self.session.cookies.update(self.detail_cookie)
        cookie = ""
        for k, v in self.session.cookies.items():
            cookie += f"{k}={v}"
        self.session.headers.update(headers)
        self.session.headers.update({"cookie": cookie})
        # logger.info(self.session.headers)
        return self.get_data(req_url, json_body)

    def get_data(self, req_url, json_body):
        logger.info(f'x-web-ip {self.session.cookies.get("x-web-ip")}')
        response = None
        try:
            # json_ja3 = {
            #     "url": req_url,
            #     "method": "post",
            #     "options": {
            #         "ja3": "771,49195-49199-49196-49200-52393-52392-49161-49171-49162-49172-156-157-47-53-49170-10-4865-4866-4867,0-5-10-11-13-65281-16-18-43-51,29-23-24-25,0",
            #         "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
            #         "proxy": self.proxies["http"],
            #         "body": json.dumps(json_body),
            #         "headers": dict(self.session.headers),
            #     },
            #     "use_proxy": False,
            # }
            # response = requests.post("http://localhost:3333/custom", json=json_ja3)
            response = requests.post(
                url=req_url,
                timeout=3,
                json=json_body,
                headers=self.session.headers,
                proxies=self.session.proxies,
            )
            # response.encoding = response.apparent_encoding
            logger.info(f"self.session.proxies {self.session.proxies}")
            res = response.json()
            if not res["success"]:
                logger.warning(res)
                return True
        except Exception as e:
            logger.info(e)
            logger.info("数据获取异常")
            return True
        # logger.info(
        #     f'msg:{res.get("msg")} -> current: {data.get("current")} -> total: {data.get("total")}'
        # )
        if response.json().get("data1", ""):
            records = json.loads(
                decrypt(
                    response.json().get("data1"),
                    response.json().get("hasUse"),
                )
            ).get("records")

            for record in records:
                logger.info(record)
        if response.json().get("data", ""):
            records = response.json().get("data").get("records")

            for record in records:
                logger.info(record)
        return True


def run(page):
    init_url = "https://zhengce.qizhidao.com"
    # req_url = "https://app.qizhidao.com/qzd-bff-pcweb/project/searchAll"  # 需要登录 政策补贴
    # json_body = {
    #     "areaDTO": [{"provinceCode": "440000", "cityCode": "440300"}],
    #     "areaFlag": 0,
    #     "current": page,
    #     "pageSize": 20,
    #     "keyword": "文旅",
    #     "fromSite": "sub",
    # }
    req_url = "https://app.qizhidao.com/qzd-bff-enterprise/qzd/v18/es/enterprise/pc/pageQueryEnterpriseProduct"  # 无需登录
    json_body = {"current": page, "pageSize": 20, "searchKey": "文旅"}
    # req_url = "https://zhengce.qizhidao.com/api/qzd-bff-marketing/enterprise/info/queryCompanyRangeCompany"
    # json_body = {
    #     "current": page,
    #     "pageSize": 4,
    #     "projectNames": ["国家高新技术企业认定"],
    #     "searchCompanyName": "",
    # }
    # req_url = "https://qiye.qizhidao.com/api/qzd-bff-enterprise/qzd/v1/enterprise/zhichan/enterpriseListV2"
    # json_body = {
    #     "platform": "0",
    #     "content": page,
    #     "provinceCode": "",
    #     "cityCode": "",
    #     "distCode": "",
    #     "industry_code_1": "",
    #     "industry_code_2": "",
    #     "industry_code_3": "",
    #     "found_years": [],
    #     "reg_capi": [],
    #     "social_security_num": [],
    #     "type_new": [],
    #     "econ_kind_code": [],
    #     "distance": "",
    #     "current": 1,
    #     "pageSize": 20,
    #     "registration_status": [],
    # }

    for _ in range(1):
        cls = Policy()
        if cls.main(init_url, req_url, json_body):
            break


if __name__ == "__main__":
    thread_list = []
    # run(1) range(1, 2) ["华为", "腾讯", "阿里"]
    for page in range(1, 2):
        t = Thread(target=run, args=[page])
        thread_list.append(t)
    [i.start() for i in thread_list]
    [i.join() for i in thread_list]
