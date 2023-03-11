//从zngirls的网站上爬取一张图片，并进行异步存储
//http://t1.zngirls.com/gallery/18071/18812/047.jpg (Paste Shift+Insert)
//测试结果异步下载的效率还是相当不错的，感觉比scrapy不差

//jquery使用$符号来进行包封
//var $ = require('jQuery');
//var jsdom = require('jsdom');
//var window = json.json().defaultView;

//var $ = require("jquery")(jsdom.jsdom().createWindow());
var url = require("url");
var http = require("http");
var util = require("util");
var fs = require("fs");
// var events = require('events');
var request = require("request");
var cheerio = require("cheerio");
// var EventEmitter = events.EventEmitter;

var host = "localhost";
var port = 8080;

function ZngrilDownloader(id, gallery) {
  //调用基类构造函数
  //EventEmitter(this);

  //任务ID
  this.id = id;
  //影集索引
  this.gallery = gallery;
}

/*
 ZngrilDownloader.prototype.start = function(){
 //读取页面数目
 var options = {
 host:host,
 port:port,
 path:`http://www.zngirls.com/g/${this.gallery}/`,
 headers:{Referer:'http://www.sina.com',},
 };
 http.get(options, function (res){
 //记录所有的数据
 var html = '';
 res.on('data', function(data){
 html += data;
 });
 res.on('end', function(){
 //使用jquery来进行解析
 text = $(html).find('#dinfo > span').text();
 console.log(text);
 });
 });
 }
 */

ZngrilDownloader.prototype.do = function (count) {
  //根据下载的总数来进行循环下载
  for (var i = 0; i < count; ++i) {
    var ur = this.getUrl(i);
    var jpg = `${this.id}/${this.gallery}/${i}.jpg`;
    var dir_gallery = this.id + "";
    var dirFile = this.id + "/" + this.gallery;
    if (!fs.existsSync(dir_gallery)) {
      fs.mkdirSync(dir_gallery);
    }
    if (!fs.existsSync(dirFile)) {
      fs.mkdirSync(dirFile);
    }
    console.log("url=" + ur + " jpg=" + jpg);
    download(ur, jpg);
  }
};

ZngrilDownloader.prototype.getUrl = function (num) {
  //根据图片的索引值来返回url地址
  if (num != 0) {
    var snum = "" + num;
    while (snum.length < 3) {
      snum = "0" + snum;
    }
  } else {
    snum = 0;
  }

  var ur = `http://t1.zngirls.com/gallery/${this.id}/${this.gallery}/${snum}.jpg`;
  return ur;
};

function download(ur, fileName) {
  //实现下载（网络异步）和文件保存（IO异步操作）
  var u = url.parse(ur);
  var options = {
    //代理服务器
    host: host,
    port: port,

    path: ur,
    //增加请求头，绕过服务器检测
    //headers : {Referer:'http://www.baidu.com',}
    headers: {
      Referer: "http://www.baidu.com",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Encoding": "gzip, deflate, sdch",
      "Accept-Language": "zh-CN,zh;q=0.8,en;q=0.6",
      Host: "t1.zngirls.com",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36",
    },
  };

  http.get(options, function (res) {
    //打开一个文件对象，在数据传输过程中，每次以块的形式
    //写入到文件中
    var fd = fs.openSync(fileName, "w");

    //监听数据传输
    res.on("data", function (chunk) {
      fs.writeSync(fd, chunk, 0, chunk.length);
      //console.log(util.inspect(chunk,true));
    });

    //监听传输完成
    res.on("end", function () {
      fs.closeSync(fd);
      console.log(`save to ${fileName}`);
    });
  });
}

function download_test() {
  var ur = "http://t1.zngirls.com/gallery/18071/18812/047.jpg";
  //var ur = 'http://www.baidu.com';
  var fileName = "047.jpg";
  download(ur, fileName);
}

//util.inherits(ZngrilDownloader, EventEmitter);
function proxyUrl(_url) {
  opt = {
    proxy: "http://localhost:8080",
    url: _url,
  };

  return opt;
}

function zngirlDownloaderTest(id) {
  //var gallery = [[18812, 49],[19695,49], [19019,43],[18214,49],[16751,54],[13207,72],[13206,68]];
  //var gallery = [[18812, 49],[19695,49], [19019,43],[18214,49],[16751,54],[13207,72],[13206,68]];
  var girlUrl = `http://www.zngirls.com/girl/${id}/`;

  request.get(proxyUrl(girlUrl), function (err, response, body) {
    if (err) {
      console.error(err);
      throw err;
    } else {
      var $ = cheerio.load(body);
      $("a.igalleryli_link").each(function (index) {
        var linkObj = $(this);
        var href = linkObj.attr("href");
        var hrefIndex = href.match(/.*\/(\d+)\/$/)[1];
        //console.log(hrefIndex);
        var galleryUrl = url.format({
          protocol: "http",
          hostname: url.parse(girlUrl).hostname,
          pathname: href,
        });

        console.log("next gallery => " + galleryUrl);
        request.get(proxyUrl(galleryUrl), function (err, response, body) {
          if (err) {
            console.error(err);
            throw err;
          } else {
            var $ = cheerio.load(body);
            $("#dinfo > span").each(function (index) {
              var spanObj = $(this);
              var spanText = spanObj.text();
              //console.log('span=' + spanText);
              var rs = spanText.match(/^(\d+).*/);
              //console.log('matched: '+ rs[1]);

              //开始爬取图片
              var gallery = [[hrefIndex, rs[1]]];
              gallery.forEach(function (i) {
                var z = new ZngrilDownloader(id, i[0]);
                z.do(i[1]);
              });
            });
          }
        });
      });
    }
  });

  /*
   */
}

//download_test();
//zngirlDownloaderTest(18071);
zngirlDownloaderTest(21542);
