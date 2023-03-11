/**
 * Created by Administrator on 2016/4/1.
 * 抓取公众号的预加载监听事件
 */
const ipcRenderer = require("electron").ipcRenderer;
//微信搜索文章的链接
const moment = require("moment");
let oldSend = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.send = function () {
  this.setRequestHeader("Referrer", location.href);
  oldSend.apply(this, arguments);
};
ipcRenderer.on("search", function () {
  ipcRenderer.sendToHost("debug", `search start`);
  if (_checkAntispider()) {
    return;
  }
  const wx_pub = document.querySelector(
    "#sogou_vr_11002301_box_0 > div > div.img-box > a"
  );
  if (wx_pub) {
    wx_pub.click();
    location.href = wx_pub.href;
    return ipcRenderer.sendToHost("debug", "页面跳转" + wx_pub.href);
  }
  if (_checkAntispider()) {
    return;
  }
  //模拟点击公众号的链接
  // const wx_latest = document.querySelector(".news-list2> li dl span");
  const firstLinkDate = document.querySelector("div>p.weui_media_extra_info");
  ipcRenderer.sendToHost(
    "debug",
    "firstLinkDate:" + firstLinkDate + "---href---" + location.href
  );
  if (firstLinkDate) {
    const _publishTime = moment(firstLinkDate.innerText, "YYYY-MM-DD").format(
      "YYYY-MM-DD"
    );
    ipcRenderer.sendToHost(
      "debug",
      "_publishTime:" + _publishTime,
      document.title
    );
    if (_checkAntispider()) {
      return;
    }

    // 前往列表页 emit did-finshed-loaded   location.href=document.querySelector(".news-list2 > li a").href
    ipcRenderer.sendToHost("debug", "看下最近一条文章时间是" + _publishTime);

    if (
      !moment().isSame(_publishTime, "day")
      // || moment(_publishTime).isSame(moment().add(-1, "days"), "day")
      // /小时|分钟/.test(_publishTime)
      // || /1天前/.test(_publishTime) // add 增加一天前的采集内容
    ) {
      return ipcRenderer.sendToHost(
        "search_continue",
        "最近一条文章发表时间为：" + _publishTime
      );
    } else {
      ipcRenderer.sendToHost(
        "debug",
        "进入到公众号文章列表页：" + location.href
      );
      const results = document.querySelectorAll("div.weui_media_bd h4");
      ipcRenderer.sendToHost(
        "debug",
        "document.body.title",
        document.body.title
      );
      return ipcRenderer.sendToHost("search_results", _filter(results) || []);
    }
  }
});

//对公众号的文章处理
ipcRenderer.on("content", function () {
  if (_checkAntispider()) {
    console.log("遇到验证码，请求打码" + location.href);
    return ipcRenderer.sendToHost(
      "debug",
      "遇到验证码，请求打码：" + location.href
    );
  }
  const _results = {
    column_pageTitle: "",
    column_pageUrl: "",
    column_pageContent: "",
    column_media: "",
    column_pageDate: ""
  };
  // _results.column_pageTitle = document.title;
  _results.column_pageTitle = document.querySelector(
    "#activity-name"
  ).innerText;
  if (document.body && location) {
    _results.column_pageUrl = location.href;
    _results.column_pageContent = document.body.innerHTML;
    const _rich_media_meta = document.querySelector("a#js_name"); //---
    if (_rich_media_meta) {
      _results.column_media = _rich_media_meta.innerText;
    }
    const postDate = document.querySelector("#publish_time"); //---
    if (postDate) {
      _results.column_pageDate = postDate.innerText;
    }
    ipcRenderer.sendToHost("contentResult", _results);
  }
});
ipcRenderer.on("antispider", function (ev, code) {
  const input = document.querySelector("#seccodeInput,#input.frm_input");
  console.log("----------------输入验证码", input, code);
  //   const input = document.querySelector("#seccodeInput");
  ipcRenderer.sendToHost("debug", input);
  ipcRenderer.sendToHost(
    "debug",
    JSON.stringify({
      msg: "获取到验证码，输入验证码",
      code: code,
      input: input
    })
  );
  if (input) {
    input.value = code;

    setTimeout(function () {
      document.querySelector("#submit") &&
        document.querySelector("#submit").click();
      document.querySelector("#bt") && document.querySelector("#bt").click();
    }, 500);
  }
});

function _filter(results) {
  const arr = [];
  for (let i = 0; i < results.length; i++) {
    arr.push("http://mp.weixin.qq.com" + results[i].getAttribute("hrefs"));
  }
  return arr;
}

function _checkAntispider() {
  const img = document.querySelector("#seccodeImage,#verify_img"); //#verify_img

  if (img) {
    ipcRenderer.sendToHost("seccode", toBase64(img));
    return true;
  }
}

window.onerror = function () {
  console.log("weixin webview error", arguments);
  return true;
};

window.alert = function (msg) {
  console.debug("news alert : ", msg);
};

function toBase64(img, outputFormat) {
  const canvas = document.createElement("canvas"),
    ctx = canvas.getContext("2d");

  canvas.height = img.height * 1.4;
  canvas.width = img.width * 2.0;
  ctx.drawImage(img, 0, 0);
  return canvas.toDataURL(outputFormat || "image/jpeg");
}

ipcRenderer.on("replaceImg", function (ev) {
  return new Promise(resolve => {
    document.querySelectorAll("img").forEach(function (i) {
      if (i.getAttribute("data-src")) {
        i.setAttribute("src", i.getAttribute("data-src"));
      }
    });
  });
});
