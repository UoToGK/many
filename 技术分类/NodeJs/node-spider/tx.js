let href =
  "https://pacaio.match.qq.com/irs/rcd?cid=146&token=49cbb2154853ef1a74ff4e53723372ce&ext=finance&page=2&expIds=20190621A00OL3|20190621A07HIP|20190621000788|20190507001749|s0887m2zkh3|20190621000661|20190620A0SZG8|20190621A058WN|a08875j4r0s|20190621V071IT|20190620A0T9JT|20190621A07JZJ|20190621A06TNA|g0887gw6ofa|20190621A07EYY|20190621V07F4L|20190621A07U82|t0887wtpzlg|20190621A03ZCA|20190621A07MCM/";
const axios = require("axios");
const url = require("url");
let http = require("http"),
  https = require("https"),
  originRequest = require("request"),
  cheerio = require("cheerio");

var iconv = require("iconv-lite");
var headers = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.65 Safari/537.36",
};
/**
 *
 *
 * @param {any} href
 * @returns
 */
function getDataByHref(href, obj) {
  return axios({
    method: "GET",
    url: href,
    data: obj,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  }).then((res) => {
    console.log(res.data.data);
  });
}
request(href, async (error, response, body) => {
  if (!error && response.statusCode == 200) {
    const info = JSON.parse(body);
    // console.log(info.data);
    let dataArr = info.data;
    let NRGJCBQ, NR, BT, LJ, YMSJ, contentUrl;
    let data = {};
    let list = [];
    for (let index = 0; index < dataArr.length; index++) {
      const obj = dataArr[index];
      data.BT = obj.title;
      data.NRGJCBQ = obj.tags;
      data.LJ = obj.vurl;
      data.YMSJ = obj.update_time;
      //
      data.NR = await getContent(obj.vurl, data);
      list.push(data);
      if (!data.NR) {
        console.log(obj.vurl);
      }
      // console.log(data)
    }
    console.error(list.length);
  }
});
// getDataByHref(href)
// axios
//     .get(href)
//     .then(async res => {
//         // console.log(res.data.data)
//         let dataArr = res.data.data;
//         let NRGJCBQ, NR, BT, LJ, YMSJ, contentUrl;
//         let data = {};
//         let list = [];
//         for (let index = 0; index < dataArr.length; index++) {
//             const obj = dataArr[index];
//             data.BT = obj.title;
//             data.NRGJCBQ = obj.tags;
//             data.LJ = obj.vurl;
//             data.YMSJ = obj.update_time;
//             //
//             data.NR = await getContent(obj.vurl)
//             list.push(data)
//             console.log(list)
//         }
//     })

/**
 *
 *
 * @param {any} url
 * @returns
 */

function request(url, callback) {
  var options = {
    url: url,
    encoding: null,
    headers: headers,
  };
  originRequest(options, callback);
}
function getContent(url, data) {
  // console.log(url)
  return new Promise((resovel, reject) => {
    request(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var html = iconv.decode(body, "gb2312");
        var $ = cheerio.load(html);
        // console.log($('.content-article ').text())
        resovel($(".LEFT").text());
        // return $('.LEFT').text()
      }
    });
  });
  //     .then(res => {
  //     // console.log(res)
  //     if (res) {
  //         console.log(url)
  //     }
  //     data.NR = res;
  // }).catch(error => console.log(error))
}

// request("https://www.baidu.com", function (error, response, body) {
//     if (!error && response.statusCode == 200) {
//         var $ = cheerio.load(body)
//         console.log(body)
//     }
// })
