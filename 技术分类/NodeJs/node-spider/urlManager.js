var utils = require("./utils");
class UrlManager {
  /**
   *Creates an instance of UrlManager.
   * @author uoto
   * @date 2019-11-16
   * @param {Array} new_urls
   * @memberof UrlManager
   */
  constructor(new_urls) {
    this.new_urls = new_urls;
    this.oldMap = new Map();
  }

  static getSingleInstance() {
    var instance = null;
    if (instance) return;
    instance = new UrlManager([]);
    return instance;
  }
  // 在待爬取集合添加url
  add_new_url(url) {
    if (!url) return;
    if (this.has_visited(url)) return;
    this.new_urls.push(url);
  }
  add_new_urls(urls) {
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      this.add_new_url(url);
    }
  }
  //获取待爬取的url 将待爬取的url移动到已爬取中
  get_one_url() {
    if (this.new_urls.length > 0) {
      var url = this.new_urls.shift();
      var hashCode = url_to_hashcode(url);
      this.oldMap.set(hashCode);
      return url;
    }
  }
  // 判断该url是否已经访问过
  has_visited(url) {
    let hashCode = url_to_hashcode(url);
    return this.oldMap.get(hashCode) ? true : false;
  }
  // 判断待爬取集合是否还有
  has_new_url() {
    return this.new_urls.length > 0;
  }
  url_to_hashcode(url) {
    return utils.hashCode(url);
  }
}

var url_manage = UrlManager.getSingleInstance();

module.exports = url_manage;
