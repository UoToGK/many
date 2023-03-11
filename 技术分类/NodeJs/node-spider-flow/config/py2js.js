var _ = require('lodash')
var request = require('request');
var cheerio = require('cheerio');

var utils = (function () {
    function hashCode(url) {
        var hash = 0;
        if (url.length == 0) return hash;
        for (i = 0; i < url.length; i++) {
            char = url.charCodeAt(i);
            hash = ((hash << 8) - hash) + char;
            hash = hash & hash;
        }
        return hash;
    }
    return {
        hashCode: hashCode
    }
}())


class Request {

    constructor(url = "www.baidu.com", type = "", catetory = "") {
        this.url = url;
        this.type = type;
        this.catetory = catetory;
    }

}



var singleQueue = (function () {
    var instance = null;
    var map = null;
    return {
        getSingle: getSingle
    }
    function getSingle() {
        if (!instance) {
            instance = new RequestQueue();
            map = new Map()
        }
        return instance
    }
    function RequestQueue() {
        this.items = [];
        this.enqueue = enqueue;
        this.dequeue = dequeue;
        this.front = front;
        this.isEmpty = isEmpty;
        this.size = size;
        this.clear = clear;
        this.print = print;
        this.instance = getSingle;
        this.removeByIndex = removeByIndex;

    }

    function findElement(element) {
        return this.items.indexOf(element)
    }
    function remove(req) {
        this.items.splice(this.items.indexOf(req, 1))
    }
    function enqueue(element) {
        if (map.get(utils.hashCode(element.url))) {
            return;
        }
        map.set(utils.hashCode(element.url), element)
        this.items.push(element);
    }

    function dequeue() {
        return this.items.shift();
    }

    function front() {
        return this.items[0];
    }

    function isEmpty() {
        return this.items.length === 0;
    }

    function size() {
        return this.items.length;
    }

    function clear() {
        this.items.length = 0;
    }

    // 打印队列里的元素
    function print() {
        console.log(this.items.toString());
    }
}())

function Main() {
    var url = "https://xuexi.huize.com/study/list-1-1.html";
    var req = new Request(url, type = 'list', catetory = '新闻资讯');
    var reqQueue = singleQueue.getSingle();
    reqQueue.enqueue(req)
    while (reqQueue.items.length > 0) {
        request(url, function (err, res, body) {
            if (err) console.error(err)
            if (res.statusCode == 200) {
                var $ = cheerio.load(body);
                var nextLink = $("#kkpager > div:nth-child(1) > span > a:nth-child(12)");
                console.log('next', "https:" + nextLink[0].attribs.href)
                var nextUrl = "https:" + nextLink[0].attribs.href
                var nextReq = new Request(nextUrl, type = 'list', catetory = '新闻资讯');
                reqQueue.enqueue(nextReq);
            }
        })
        this.reqQueue.remove(req)
    }
}

Main()
