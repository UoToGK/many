// Created by uoto on 16/4/15.
// 标签采集器
import { imgToBase64 } from "../../tools/dom";
const http = require('http');
const https = require('https');
const rp = require('request-promise');
import * as _ from "lodash";//4月6日修改bug electron升级
const nodejsUrl = require('url');
import * as dateUtils from "../../tools/DateUtils";

export var nodeCapture = {
    href(el, capture, result, locals) {
        return Promise.resolve(el.href);
    },

    value(el, capture, result, locals) {
        return Promise.resolve(el.value);
    },

    //固定值的数据提取
    fixValue(el, capture, result, locals) {
        return Promise.resolve(capture.preview);
    },

    //提取内容列表
    contentList(els, capture, result, locals) {
        let objs = [];

        if (_.isArray(els)) {
            for (var el of els) {
                objs.push(el["outerHTML"])
            }
        } else {
            objs.push(els.outerHTML)
        }

        return Promise.resolve(objs);
    },

    getGprs(el, capture, result, locals) {
        return new Promise((resolve, reject) => {
            var data;
            var val = locals.val;
            if (val && val.split) {
                var vals = val.split(":");
                if (vals.length > 1) {
                    val = vals[vals.length - 1];
                }
            }

            var options = {
                uri: 'http://api.map.baidu.com/geocoder/v2/',
                qs: {
                    address: val,
                    output: 'json',
                    ak: 'F454f8a5efe5e577997931cc01de3974'
                },
                headers: {
                    'User-Agent': 'Request-Promise',
                    'content-type': 'application/x-www-form-urlencoded'
                },
                json: true
            };

            rp(options)
                .then(function (data) {
                    resolve(data);
                })
                .catch(function (err) {
                    reject(err);
                });
        });
    },

    //属性采集器
    attr(el, capture, result, locals) {

    },

    //标签采集(包含标签)
    outerHTML(el, capture, result, locals) {
        return Promise.resolve(el.outerHTML);
    },

    //内容采集器(含标签)
    innerHTML(el, capture, result, locals) {
        return Promise.resolve(el.innerHTML);
    },

    //内容采集器(不包含标签)
    innerText(el, capture, result, locals) {
        //提起所选节点，不含标签
        var html = el.innerText;
        var content = "";
        if (html) {
            content = html.replace(/<[^>]+>/g, "");
        }
        //alert("capture.columnDesc="+capture.columnDesc+"  --"+content);
        if (capture.columnDesc && (capture.columnDesc.includes('时间') || capture.columnDesc.includes('日期'))) {
            content = dateUtils.tryDateExtract(content, false);
        }

        return Promise.resolve(html);
        // return Promise.resolve(el.innerText);
    },

    //匹配正则采集
    regexp(el, capture, result, locals) {

    },

    //转换为base64
    base64(el, capture, result, locals) {
        var imgsrc = el.src;
        var prefix = "data:image/png;base64,";
        return new Promise((resolve, reject) => {
            if (el.src.startsWith("http:")) {
                var req = http.get(imgsrc, function (res) {
                    var size = 0;
                    var chunks = [];
                    res.on('data', function (chunk) {
                        size += chunk.length;
                        chunks.push(chunk);
                    });
                    res.on('end', function () {
                        var data = Buffer.concat(chunks, size);
                        resolve(prefix + data.toString("base64"));
                    });
                }).on('error', function (e) {
                    console.log("Got error: " + e.message);
                });
                req.end();
            } else if (el.src.startsWith("https:")) {
                var req = https.get(imgsrc, function (res) {
                    var size = 0;
                    var chunks = [];
                    res.on('data', function (chunk) {
                        size += chunk.length;
                        chunks.push(chunk);
                    });
                    res.on('end', function () {
                        var data = Buffer.concat(chunks, size);
                        resolve(prefix + data.toString("base64"));
                    });
                }).on('error', function (e) {
                    console.log("Got error: " + e.message);
                });
                req.end();
            } else {
                el.crossOrigin = 'anonymous';
                var base64 = imgToBase64(el);
                return resolve(base64);
            }
        });

    },

    //附件下载
    download(el, capture, result, locals) {
        var objUrl = el.href;
        var objText = el.text;

        //生成base64的前缀内容
        function buildPrefix(res, objName) {
            let prefix = "data:";
            try {
                prefix = prefix + "content-type=" + (res.headers["content-type"] || '');
                prefix = prefix + ",content-length=" + (res.headers["content-length"] || '');
                //prefix=prefix+",content-disposition="+res.headers["content-disposition"];
                //content-disposition:"attachment; filename=Ã¿ÈÕ¾­¼ÃµÚ5665ÆÚ.DOC"
                prefix = prefix + "," + (res.headers["content-disposition"] || '').replace("attachment;", "").trim();
                prefix = prefix + ",name=" + (objName || '');
                prefix = prefix.replace(";", ",");
                prefix = prefix + ";base64,";
                //去除回车、换行、，，
                prefix = prefix.replace(",,", ",").replace("\r", "").replace("\n", "");
            } catch (e) {
                console.error("EROOR : ", e);
            }
            return prefix;
        }

        function getByUrl(href, resolve, reject) {
            // 查询所有 cookies.
            let timeEvent;
            let prefix = "";
            let urlObj = nodejsUrl.parse(href);
            //用与发送的参数类型
            let options = {
                host: urlObj.host,    //ip
                port: urlObj.port || '80',     //port
                path: urlObj.path,     //get方式使用的地址
                method: "GET", //get方式或post方式
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'Content-Encoding': 'gzip',
                    'Cookie': document.cookie,
                    'User-Agent': navigator.userAgent,
                    'Host': urlObj.host,
                    'Accept': '*/*',
                    'Accept-Language': 'zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2'
                }
            };
            if (href.startsWith("http:")) {
                options.port = urlObj.port || '80';
                var req = http.get(options, function (res) {
                    var size = 0;
                    var chunks = [];
                    //被重定向了的网页
                    if (res.statusCode >= 300 && res.statusCode < 400) {
                        clearTimeout(timeEvent);
                        getByUrl(res.headers.location, resolve, reject);
                    }
                    //正常网页
                    if (res.statusCode == 200) {
                        res.on('data', function (chunk) {
                            clearTimeout(timeEvent);
                            size += chunk.length;
                            chunks.push(chunk);
                        });
                        res.on('end', function () {
                            prefix = buildPrefix(res, objText);
                            var data = Buffer.concat(chunks, size);
                            resolve(prefix + data.toString("base64"));
                        });
                    }
                }).on('error', function (e) {
                    console.error("Got error: " + e.message);
                    reject("Got error: " + e.message);
                });
                req.end();

                timeEvent = window.setTimeout(function () {
                    alert("http 请求处理超时");
                    req.destroy();
                }, 40 * 1000);
            } else if (href.startsWith("https:")) {
                options.port = urlObj.port || '443';
                var req = https.get(options, function (res) {
                    var size = 0;
                    var chunks = [];
                    //被重定向了的网页
                    if (res.statusCode >= 300 && res.statusCode < 400) {
                        clearTimeout(timeEvent);
                        getByUrl(res.headers.location, resolve, reject);
                    }
                    if (res.statusCode == 200) {
                        res.on('data', function (chunk) {
                            clearTimeout(timeEvent);
                            size += chunk.length;
                            chunks.push(chunk);
                        });
                        res.on('end', function () {
                            prefix = buildPrefix(res, objText);
                            var data = Buffer.concat(chunks, size);
                            resolve(prefix + data.toString("base64"));
                        });
                    }
                }).on('error', function (e) {
                    reject("Got error: " + e.message);
                });
                req.end();

                timeEvent = window.setTimeout(function () {
                    alert("https 请求处理超时");
                    req.destroy();
                }, 40 * 1000);
            } else {
                el.crossOrigin = 'anonymous';
                return resolve("");
            }
        }

        return new Promise((resolve, reject) => {
            //return resolve("");
            return getByUrl(objUrl, resolve, reject);

        });

    },

    // 采集img的链接
    imgURL(el, capture, result, locals) {
        var img = el.src;
        return Promise.resolve(img);
    }




};
