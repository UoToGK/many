#! /usr/bin/env node
class Queue {
  constructor(queue) {
    this.queue = queue;
  }
  add(req) {
    this.queue.push(req);
  }
}

class Request {
  constructor(url) {
    this.url = url;
  }
}

var item = [];
var queue = new Queue(item);
var req = new Request(
  "https://zhidao.baidu.com/search?ct=17&pn=0&tn=ikaslist&rn=10&fr=wwwt&word=%E7%97%94%E7%96%AE"
);
queue.add(req);
var request = require("request");
var cheerio = require("cheerio");
var iconv = require("iconv-lite");
var options = {
  headers: {
    Cookie:
      "AIDUID=076CFE59637F56CF3BE83A6F64134C25:FG=1; BIDUPSID=076CFE59637F56CF3BE83A6F64134C25; PSTM=1570636994; pgv_pvi=533365760; pgv_si=s621685760; delPer=0; PSINO=7; BDUSS=Td3emhhY2UxOWdadWd3NmprZlhQeEgzc3FrUkJlOUJjSGJFUWhHSk14VE1lfk5kSVFBQUFBJCQAAAAAAAAAAAEAAAA0fWmxVW9Ub19Vb01vAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMzuy13M7stdQ; BDRCVFR[VXHUG3ZuJnT]=mk3SLVN4HKm; H_PS_PSSID=; BDORZ=FFFB88E999055A3F8A630C64834BD6D0; cflag=13%3A3; ZD_ENTRY=baidu; Hm_lvt_6859ce5aaf00fb00387e6434e4fcc925=1573564296,1573564325,1573564374,1573732881; Hm_lpvt_6859ce5aaf00fb00387e6434e4fcc925=1573732881",
  },
};
// request(req.url, options, function(err, res, body) {
//   if (res.statusCode == 200) {
//     var $ = cheerio.load(body);
//     // console.log($("#wgt-list  dl dt a")[0].attribs.href);
//     request($("#wgt-list  dl dt a")[1].attribs.href, options, function(err, res, body) {
//       var $1 = cheerio.load(body);
//       //cheerio.load(iconv.decode(body, 'gb2312'));
//       console.log($1('div[id*="best-content"]')[0]);
//     });
//   }
// });
