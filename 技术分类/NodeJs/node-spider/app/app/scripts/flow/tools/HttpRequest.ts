// Created by uoto on 16/4/15.
/// <reference path="./events.ts"/>

// import {indexOf, chain, toArray, last, debounce} from "lodash";
import * as _ from "lodash"; //4月6日修改bug electron升级
// import props from "../properties";
// import {delay} from "../../base/util";
// import {basename} from "path";
// const fs = require("fs");
const http = require("http");
// const https = require('https');
// const request = require('request');
// const qs = require('querystring');
// const rp = require('request-promise');
// import mime = require('mime');

//dom操作工具
/**
 * toBase64
 * 图片转换成base64
 * @param img
 * @returns {Promise<string>}
 */
export async function imgToBase64(optionsOrUrl): Promise<any | string> {
  let timeEvent;
  return new Promise(function(resolve, reject) {
    var size = 0;
    var chunks = [];
    var req = http
      .get(optionsOrUrl, function(res) {
        //正常网页
        if (res.statusCode == 200) {
          res.on("data", function(chunk) {
            clearTimeout(timeEvent);
            size += chunk.length;
            chunks.push(chunk);
          });
          res.on("end", function() {
            resolve({ chunks: chunks, size: size, res: res });
          });
        }
        //被重定向了的网页
        if (res.statusCode == 302 || res.statusCode == 301) {
          // getByUrl(res.headers.location,resolve, reject);
        }
      })
      .on("error", function(e) {
        console.log("Got error: " + e.message);
        reject(e);
      });

    timeEvent = window.setTimeout(function() {
      alert("请求处理超时");
      console.log("请求处理超时");
      req.abort();
    }, 6000);
  });
}
