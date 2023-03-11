var request = require("request"),
  cheerio = require("cheerio"),
  async = require("async"),
  url = "http://www.imooc.com/learn/857",
  movieUrl = "http://api.douban.com/v2/movie/top250";

request(movieUrl, function (err, res) {
  err && console.log(err);

  //   var $ = cheerio.load(res.body);

  console.log(res.toJSON().subject.length);
});
