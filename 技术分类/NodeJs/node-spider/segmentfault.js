let originRequest = require("request");
const bodyParser = require("body-parser");
var headers = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.65 Safari/537.36",
  Cookie:
    "_ga=GA1.2.858795485.1557129516; sf_remember=b8b970202c1bcf850b29aad951045186; PHPSESSID=web1~aifie4d7bopas0t48d36mf8r6p; _gid=GA1.2.1769867268.1562553887; Hm_lvt_e23800c454aa573c0ccb16b52665ac26=1562643740,1562651487,1562736843,1562741765; Hm_lpvt_e23800c454aa573c0ccb16b52665ac26=1562814840",
  Referer: "https://segmentfault.com/",
};
function request(url, callback) {
  var options = {
    url: url,
    encoding: "utf-8",
    headers: headers,
  };
  originRequest(options, callback);
}
var url =
  "https://segmentfault.com/api/timelines/feed?offset=1562159360085&_=84a3595216c368e57057b5b81d520c3c ";
request(url, function (error, response, body) {
  // console.log(response.statusCode)
  if (!error && response.statusCode == 200) {
    // console.log(JSON.parse(Array.prototype.slice.call(body.data).from))
    var body = JSON.parse(body);
    // console.log(body.data[0])
    console.log(Array.prototype.slice.call(body.data)[0].from);
  }
});
