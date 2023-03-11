const axios = require("axios");
const cheerio = require("cheerio");
const url = require("url");
const href = "https://cnodejs.org";

// 抓取url
axios
  .get(href)
  .then((res) => {
    let $ = cheerio.load(res.data);
    let node = $("#topic_list a.topic_title");
    let list = [];
    node.each((index, value) =>
      list.push(url.resolve(href, value.attribs.href))
    );
    return list;
  })
  .then((list) => {
    // 7 个并发
    many(list, 7)
      .then((data) => console.log(data))
      .catch((err) => console.log(err));
  })
  .catch((err) => err);

// 多线程异步,并发
function many(arr, n) {
  return new Promise((resolve, reject) => {
    // 多线程统一数据存放
    let list = [];
    // 正在运行的线程数
    let thread = 0;
    // 队列
    let length = 0;

    // 单线程异步
    function queues(arr) {
      return new Promise((resolve, reject) => {
        // 队列数据统一存放
        let datas = [];
        function queue(arr) {
          length++;
          return new Promise((resolve, reject) => {
            axios
              .get(arr[length - 1])
              .then((res) => {
                if (length < arr.length) {
                  console.log("..." + length);
                  datas.push(res.data);
                  return queue(arr).then(() => resolve());
                } else {
                  resolve();
                }
              })
              .catch((err) => reject(err));
          });
        }

        queue(arr).then(() => resolve(datas));
      });
    }

    // 多线程创建
    for (let i = 0; i < n; i++) {
      thread++;
      queues(arr)
        .then((data) => {
          list.push(data);
          thread--;
          if (thread === 0) {
            // 最后一个线程返回数据
            resolve(list);
          }
        })
        .catch((err) => reject(err));
    }
  });
}
