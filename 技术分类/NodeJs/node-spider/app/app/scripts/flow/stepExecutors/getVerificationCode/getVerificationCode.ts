import { ipcRenderer } from "electron";
import rp = require('request-promise');
// Created by uoto on 2017/1/10.
var config = require("../../../../resource/config.yaml");
//const uuwApi = 'http://115.29.147.233:8080/uuwise-web/uuwise/doVerify';
//
// export function decodeBase64(base64: string, callback: Function) {
//     $['post'](config['uuwise_api'], {base: base64}, 'json').done(callback);
// }

export async function getVerificationCode(step, locals, resolveChannel, rejectChannel) {

    try {
        var captchael = document.querySelector(step.selector);
        console.log("判断元素是否存在", captchael)
        // 1.判断元素是否存在
        // 2.不存在 正常返回
        // 3.存在
        // 4.检查验证码图片元素是否可以找到
        // 5.无法找到抛出错误
        // 6.可以找到
        // 7.读取图片base64内容，远程获取转换内容
        let datas = { 'verificationCode': "" };
        if (captchael) {// 1.判断元素是否存在 存在
            // 读取图片base64
            var imgBase64 = await _imgToBase64(captchael);
            var result: KvObj = await decodeBase64(imgBase64, step.captchaLen);
            if (result.success == 'true' || result.success == true) {
                //放入locals中
                datas = { 'verificationCode': result.code };
            }
        } else {// 1.判断元素是否存在 不存在
            console.log("验证码元素未找到，跳过此步骤");
            callback(rejectChannel, `stepExecutor[getVerificationCode] 验证码元素未找到，跳过此步骤`);
        }

        callback(resolveChannel, datas);

    } catch (e) {
        callback(rejectChannel, `stepExecutor[getVerificationCode] 警告: ${String(e.stack || e)}`);
    }

}

function callback(resolve, value) {
    ipcRenderer.sendToHost(resolve, value);
}

async function _imgToBase64(img) {
    img.crossOrigin = '*';
    return new Promise(function (resolve, reject) {
        if (!img || img.localName != 'img') {
            resolve()
        }
        if (img.complete && img.height && img.width) {
            results();
        } else {
            var imgsrc = img.src;
            img.crossOrigin = 'anonymous';
            img.onload = results;
            results();
        }
        function results() {
            var canvas = document.createElement('canvas');
            canvas.setAttribute("id", "myIrisCanvas");
            canvas.height = 30;
            canvas.width = 80;
            // 260*70 80*30
            var ctx = canvas.getContext('2d');
            ctx.scale(80 / img.naturalWidth, 30 / img.naturalHeight);
            ctx.drawImage(img, 0, 0);
            var datas = canvas.toDataURL("image/jpeg", 1.0);
            canvas = img = null;
            resolve(datas);// 默认使用 image/png
        }
    });
}

// const uuwApi = 'http://uuwise.ideadata.com.cn/uuwise-web/uuwise/doVerify';
const uuwApi = config['uuwise_api']

async function decodeBase64(imgBase64, captchaLen) {
    // alert("发送验证码识别请求");

    return new Promise(function (resolve, reject) {
        // $['post'](config['uuwise_api'], {base64: imgBase64, type: captchaLen}, 'json').done(function (res) {
        //     resolve(res);
        // });
        let url = uuwApi + "?base64=" + imgBase64 + "&type=" + captchaLen;
        var options = {
            method: 'POST',
            json: true,
            uri: url,
            header: {
                "content-type": "application/x-www-form-urlencoded"
            },
            body: {
                base64: imgBase64,
                impl: "lianzhong"
            }
        };
        console.error("imgBase64 options=", options);
        rp(options)
            .then(function (data) {
                resolve(data);
            })
            .catch(function (err) {
                // alert("验证码识别失败");
                //resolve({"success":true,"code":"2i8iui"});
                reject(err);
            });
    });
}