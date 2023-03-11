// 系统变量采集

export var sysCapture = {
  //页面地址
  pageUrl(document) {
    return Promise.resolve(document.location.href);
  },

  //页面标题
  pageTitle(document) {
    return Promise.resolve(document.title);
  },

  //页面内容
  pageContent(document) {

    return Promise.resolve(document.body.innerHTML)

  },
  //页面内容(不带标签)
  pageText(document) {
    return Promise.resolve(document.body.innerText);
  },
  pageSelectTag(document) {
    var pText = [];
    [].slice.call(document.querySelectorAll('p')).map(v => {
      pText.push(v.innerText)
    })
    return Promise.resolve(pText)
  },
  pageAutoText(document) {
    var SiteType = {
      xinhuanet: 1,
      sina: 2,
      people: 3,
      other: 4
    };
    var SiteTypeID; // 标记当前是哪个站点
    var selector;
    if (location.host.indexOf("xinhuanet.com") > -1) {
      SiteTypeID = SiteType.xinhuanet;
      selector = "#p-detail"
    } else if (location.host.indexOf('people.com.cn') > -1) {
      SiteTypeID = SiteType.people;
      selector = "#rwb_zw,.box_con"
    }
    else if (location.host.indexOf('sina.com.cn') > -1) {//兼容经济类
      SiteTypeID = SiteType.sina;
      selector = "#article,#artibody"
    } else {
      SiteTypeID = SiteType.other;
      selector = "body"
    }
    var el = document.querySelector(selector);
    var title = document.title;
    if (el && selector != "body") {
      console.debug(`标记当前是哪个站点 selector ${selector}  el ${el.length} `)
      var start = el.innerText.indexOf(title)
      var result = (start > -1) ? el.innerText.substring(start) : el.innerText
      return Promise.resolve(result)
    } else {
      var pText = [];
      [].slice.call(document.querySelectorAll('p')).map(v => {
        pText.push(v.innerText)
      })
      return Promise.resolve(pText)
    }
  }
};
