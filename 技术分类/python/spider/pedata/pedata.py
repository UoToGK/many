# Standard Library
import json
import threading

# from tkinter.tix import Tree

# Third Library
import execjs  # pip install PyExecJS
import requests

# from loguru import logger

news_est_url = "https://max.pedata.cn/api/q4x/ep/ipo"
login_token = "1a33a3b39bbd30e6d291697f4ad8b1ad540a2bdc45d07d157b9b4d0487ba5762"  # token 换成你自己的
headers = {
    "Accept": "application/json, text/plain, */*",
    "Content-Type": "application/json",
    "Host": "max.pedata.cn",
    "HTTP-X-TOKEN": login_token,
    "Origin": "https://max.pedata.cn",
    "Referer": "https://max.pedata.cn/client/ep/ipo",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36",
}


def get_decrypted_data(encrypted_data, exor):
    """_summary_

    Args:
        encrypted_data (_type_): _description_
        exor (_type_): _description_

    Returns:
        _type_: _description_
    """
    with open("pedata_decrypt.js", "r", encoding="utf-8") as f:
        pedata_js = f.read()
    decrypted_data = execjs.compile(pedata_js).call("getDecryptedData", encrypted_data, exor, login_token)

    return decrypted_data


def get_encrypted_data():
    """_summary_

    Returns:
        _type_: _description_
    """
    data = {"type": "", "module": "LP", "page": {"currentPage": 1, "pageSize": 10}}
    response = requests.post(url=news_est_url, headers=headers, json=data).json()
    encrypted_data, exor = response["data"], response["exor"]

    print(exor)
    return encrypted_data, exor


def main():
    """
    main start
    """
    encrypted_data, exor = get_encrypted_data()
    decrypted_data = get_decrypted_data(encrypted_data, exor)
    # Standard Library
    import base64

    decrypted_data = base64.b64decode(decrypted_data).decode()
    decrypted_data = dict(json.loads(decrypted_data))
    # result = decrypted_data["result"]
    print(decrypted_data)
    # for r in result:
    #     print(r['namecn'])


if __name__ == "__main__":
    main()
    currentPage = 1
    end = 30
    while currentPage < 30693:

        thread_list = []
        for i in range(currentPage, end, 1):
            if i > 30693:
                break
            currentPage = i
            t = threading.Thread(target=get_encrypted_data, args=[i])
            t.setDaemon = True
            thread_list.append(t)
        [i.start() for i in thread_list]
        [i.join() for i in thread_list]
        currentPage = currentPage + 1
        end = currentPage + 30
