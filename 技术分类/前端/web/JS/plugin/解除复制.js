// ==UserScript==
// @name         解除各大文档站，小说站的复制限制，右键限制（无需任何设置即可突破限制）
// @namespace    http://zkq8.com
// @version      1.0.1
// @description  解除知乎、360doc、百度阅读、17k、文起书院、逐浪、红薯网等大部分网站复制、剪切、选择文本、右键菜单的操作限制
// @description  增加淘宝天猫查找优惠券功能，方便领取当前商品的大额度优惠券
// @author       max su
// @include      *://wenku.baidu.com/view/*
// @include      *://www.wocali.com/tampermonkey/doc/download
// @include      *://api.ebuymed.cn/ext/*
// @include      *://www.ebuymed.cn/
// @include      *://pan.baidu.com/s/*
// @include      *://yun.baidu.com/s/*
// @include      *://pan.baidu.com/share/init*
// @include      *://yun.baidu.com/share/init*
// @include      *://www.zhihu.com/*
// @include      *://www.bilibili.com/read/*
// @include      *://b.faloo.com/*
// @include      *://bbs.coocaa.com/*
// @include      *://book.hjsm.tom.com/*
// @include      *://book.zhulang.com/*
// @include      *://book.zongheng.com/*
// @include      *://book.hjsm.tom.com/*
// @include      *://chokstick.com/*
// @include      *://chuangshi.qq.com/*
// @include      *://yunqi.qq.com/*
// @include      *://city.udn.com/*
// @include      *://cutelisa55.pixnet.net/*
// @include      *://huayu.baidu.com/*
// @include      *://tiyu.baidu.com/*
// @include      *://yd.baidu.com/*
// @include      *://yuedu.baidu.com/*
// @include      *://imac.hk/*
// @include      *://life.tw/*
// @include      *://luxmuscles.com/*
// @include      *://read.qidian.com/*
// @include      *://www.15yan.com/*
// @include      *://www.17k.com/*
// @include      *://www.18183.com/*
// @include      *://www.360doc.com/*
// @include      *://www.eyu.com/*
// @include      *://www.hongshu.com/*
// @include      *://www.coco01.com/*
// @include      *://news.missevan.com/*
// @include      *://www.hongxiu.com/*
// @include      *://www.imooc.com/*
// @include      *://www.readnovel.com/*
// @include      *://www.tadu.com/*
// @include      *://www.jjwxc.net/*
// @include      *://www.xxsy.net/*
// @include      *://www.z3z4.com/*
// @include      *://yuedu.163.com/*
// @include      http*://chaoshi.detail.tmall.com/*
// @include      http*://detail.tmall.com/*
// @include      http*://item.taobao.com/*
// @include      http*://list.tmall.com/*
// @include      http*://list.tmall.hk/*
// @include      http*://s.taobao.com/*
// @include      http*://detail.tmall.hk/*
// @include      http*://chaoshi.tmall.com/*
// @require      https://code.jquery.com/jquery-3.4.0.min.js
// @connect 	 www.quzhuanpan.com
// @connect		 pan.baidu.com
// @connect		 yun.baidu.com
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceText
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_download
// @grant        GM_addStyle
// @require      http://libs.baidu.com/jquery/2.0.0/jquery.min.js
// @require      https://greasyfork.org/scripts/376804-intelligent-weight/code/Intelligent_weight.js?version=684520
// @run-at       document-end
// @compatible	 Chrome
// @compatible	 Firefox
// @compatible	 Edge
// @compatible	 Safari
// @compatible	 Opera
// @compatible	 UC
// @license      LGPLv3
// ==/UserScript==

(function() {
  "use strict";
  var $ = $ || window.$;
  var window_url = window.location.href;
  var website_host = window.location.host;

  var analysis = {};
  analysis.judge = function() {
    if (website_host.indexOf("wenku.baidu.com") != -1) {
      return true;
    }
    return false;
  };
  analysis.addHtml = function() {
    if (analysis.judge()) {
      //左边图标
      var topBox =
        "<div style='position:fixed;z-index:999999;background-color:#ccc;cursor:pointer;top:200px;left:0px;'>" +
        "<div id='crack_vip_document_box' style='font-size:13px;padding:10px 2px;color:#FFF;background-color:#25AE84;'>下载</div>" +
        "<div id='crack_vip_search_wenku_box' style='font-size:13px;padding:10px 2px;color:#FFF;background-color:#DD5A57;'>网盘</div>" +
        /*"<div id='crack_vip_search_wangpan_box' style='font-size:13px;padding:10px 2px;color:#FFF;background-color:#357EFD;'>网盘</div>"+*/
        "<div id='crack_vip_copy_box' style='font-size:13px;padding:10px 2px;color:#FFF;background-color:#FE8A23;'>复制</div>" +
        "</div>";
      $("body").append(topBox);
      var searchWord = "";
      if ("wenku.baidu.com" === website_host) {
        if ($("#doc-tittle-0").length != 0) {
          searchWord = $("#doc-tittle-0").text();
        } else if ($("#doc-tittle-1").length != 0) {
          searchWord = $("#doc-tittle-1").text();
        } else if ($("#doc-tittle-2").length != 0) {
          searchWord = $("#doc-tittle-2").text();
        } else if ($("#doc-tittle-3").length != 0) {
          searchWord = $("#doc-tittle-3").text();
        }
      }

      //为每一页添加复制按钮
      var onePageCopyContentHtml =
        '<div class="copy-one-page-text" style="float:left;padding:3px 10px;background:green;z-index:999;position:relative;top:60px;color:#fff;background-color:#FE8A23;font-size:14px;cursor:pointer;">获取此页面内容</div>';
      $(
        ".mod.reader-page.complex, .ppt-page-item, .mod.reader-page-mod.complex"
      ).each(function() {
        $(this).prepend(onePageCopyContentHtml);
      });

      var defaultCrackVipUrl =
        "https://www.wocali.com/tampermonkey/doc/download?kw=@";
      $("body").on("click", "#crack_vip_document_box", function() {
        defaultCrackVipUrl = defaultCrackVipUrl.replace(
          /@/g,
          encodeURIComponent(searchWord)
        );
        GM_setValue("document_url", window_url);
        window.open(defaultCrackVipUrl, "_blank");
      });

      var defaultSearchWenkuUrl =
        "https://www.quzhuanpan.com/source/search.action?q=@&currentPage=1";
      $("body").on("click", "#crack_vip_search_wenku_box", function() {
        defaultSearchWenkuUrl = defaultSearchWenkuUrl.replace(
          /@/g,
          encodeURIComponent(searchWord)
        );
        window.open(defaultSearchWenkuUrl, "_blank");
      });

      $("body").on("click", "#crack_vip_copy_box", function() {
        analysis.copybaiduWenkuAll();
      });

      $("body").on("click", ".copy-one-page-text", function() {
        var $inner = $(this)
          .parent(".mod")
          .find(".inner");
        analysis.copybaiduWenkuOne($inner);
      });
    }
    start_pan();
  };
  analysis.showBaiduCopyContentBox = function(str) {
    var ua = navigator.userAgent;
    var opacity = "0.95";
    if (ua.indexOf("Edge") >= 0) {
      opacity = "0.6";
    } else {
      opacity = "0.95";
    }
    var copyTextBox =
      '<div id="copy-text-box" style="width:100%;height:100%;position: fixed;z-index: 9999;display: block;top: 0px;left: 0px;background:rgba(255,255,255,' +
      opacity +
      ');-webkit-backdrop-filter: blur(20px);display: flex;justify-content:center;align-items:center;">' +
      '<div id="copy-text-box-close" style="width:100%;height:100%;position:fixed;top:0px;left:0px;"></div>' +
      '<pre id="copy-text-content" style="width:60%;font-size:16px;line-height:22px;z-index:10000;white-space:pre-wrap;white-space:-moz-pre-wrap;white-space:-pre-wrap;white-space:-o-pre-wrap;word-wrap:break-word;word-break:break-all;max-height:70%;overflow:auto;"></pre>' +
      '</div>"';
    $("#copy-text-box").remove();
    $("body").append(copyTextBox);
    $("#copy-text-content").html(str);
    $("#copy-text-box-close").click(function() {
      $("#copy-text-box").remove();
    });
  };
  analysis.showDialog = function(str) {
    var dialogHtml =
      '<div id="hint-dialog" style="margin:0px auto;opacity:0.8;padding:5px 10px;position:fixed;z-index: 10001;display: block;bottom:30px;left:44%;color:#fff;background-color:#CE480F;font-size:13px;border-radius:3px;">' +
      str +
      "</div>";
    $("#hint-dialog").remove();
    $("body").append(dialogHtml);
    timeoutId = setTimeout(function() {
      $("#hint-dialog").remove();
    }, 1500);
  };
  analysis.copybaiduWenkuAll = function() {
    analysis.copybaiduWenkuOne($(".inner"));
  };
  analysis.copybaiduWenkuOne = function($inner) {
    if (analysis.judge()) {
      //提取文字
      var str = "";
      $inner.find(".reader-word-layer").each(function() {
        str += $(this)
          .text()
          .replace(/\u2002/g, " ");
      });
      str = str.replace(/。\s/g, "。\r\n");

      //提取css中的图片
      var picHtml = "";
      var picUrlReg = /[\'\"](https.*?)[\'\"]/gi;
      var cssUrl = "";
      var picNum = 0;
      var picUrlLengthMin = 65;
      var picTemplate =
        "<div style='margin:10px 0px;text-align:center;'><img src='@' width='90%'><div>____图(#)____</div></div>";
      $inner.find(".reader-pic-item").each(function() {
        cssUrl = $(this).css("background-image");
        //在css中的情况
        if (
          !!cssUrl &&
          (cssUrl.indexOf("http") != -1 || cssUrl.indexOf("HTTP") != -1)
        ) {
          var array = cssUrl.match(picUrlReg);
          if (array.length > 0) {
            cssUrl = array[0].replace(/\"/g, "");
            if (!!cssUrl && cssUrl.length > picUrlLengthMin) {
              picNum++;
              var onePic = picTemplate;
              onePic = onePic.replace(/#/g, picNum);
              onePic = onePic.replace(/@/g, cssUrl);
              picHtml += onePic;
            }
          }
        }
      });

      //如果还有img标签，一并提取出来
      var srcUrl = "";
      $inner.find("img").each(function() {
        srcUrl = $(this).attr("src");
        if (
          !!srcUrl &&
          srcUrl.length > picUrlLengthMin &&
          srcUrl.indexOf("https://wkretype") != -1
        ) {
          picNum++;
          var onePic = picTemplate;
          onePic = onePic.replace(/#/g, picNum);
          onePic = onePic.replace(/@/g, srcUrl);
          picHtml += onePic;
        }
      });

      //追加内容
      var contentHtml = str + picHtml;
      if (!!contentHtml && contentHtml.length > 0) {
        if (picNum != 0) {
          contentHtml =
            str +
            "<div style='color:red;text-align:center;margin-top:20px;'>文档中的图片如下：(图片可右键另存为)</div>" +
            picHtml;
        }
        analysis.showBaiduCopyContentBox(contentHtml);
      } else {
        analysis.showDialog("提取文档内容失败了");
      }
    }
  };
  analysis.download = function() {
    if ("api.ebuymed.cn" === website_host) {
      var sendUrl = GM_getValue("document_url");
      if (!!sendUrl) {
        GM_setValue("document_url", "");
        $("#downurl").val(sendUrl);
        $("#buttondown").click();
      }
    }
  };
  analysis.init = function() {
    analysis.addHtml();
    analysis.download();
  };
  analysis.init();

  //如果于文档相关，则执行至此
  if (
    website_host.indexOf("api.ebuymed.cn") != -1 ||
    website_host.indexOf("www.ebuymed.cn") != -1 ||
    website_host.indexOf("wenku.baidu.com") != -1
  ) {
    return false;
  }
  /*
   * 网页解除限制，集成了脚本：网页限制解除（精简优化版）
   * 作者：Cat73、xinggsf
   * 原插件地址：https://greasyfork.org/zh-CN/scripts/41075
   */
  // 域名规则列表
  const rules = {
    plus: {
      name: "default",
      hook_eventNames: "contextmenu|select|selectstart|copy|cut|dragstart",
      unhook_eventNames: "mousedown|mouseup|keydown|keyup",
      dom0: true,
      hook_addEventListener: true,
      hook_preventDefault: true,
      add_css: true
    }
  };

  const returnTrue = e => true;
  // 获取目标域名应该使用的规则
  const getRule = host => {
    return rules.plus;
  };
  const dontHook = e => !!e.closest("form");
  // 储存被 Hook 的函数
  const EventTarget_addEventListener = EventTarget.prototype.addEventListener;
  const document_addEventListener = document.addEventListener;
  const Event_preventDefault = Event.prototype.preventDefault;
  // 要处理的 event 列表
  let hook_eventNames, unhook_eventNames, eventNames;

  // Hook addEventListener proc
  function addEventListener(type, func, useCapture) {
    let _addEventListener =
      this === document
        ? document_addEventListener
        : EventTarget_addEventListener;
    if (!hook_eventNames.includes(type)) {
      _addEventListener.apply(this, arguments);
    } else {
      _addEventListener.apply(this, [type, returnTrue, useCapture]);
    }
  }

  // 清理或还原DOM节点的onxxx属性
  function clearLoop() {
    let type,
      prop,
      c = [document, document.body, ...document.getElementsByTagName("div")],
      // https://life.tw/?app=view&no=746862
      e = document.querySelector('iframe[src="about:blank"]');
    if (e && e.clientWidth > 99 && e.clientHeight > 11) {
      e = e.contentWindow.document;
      c.push(e, e.body);
    }

    for (e of c) {
      if (!e) continue;
      e = e.wrappedJSObject || e;
      for (type of eventNames) {
        prop = "on" + type;
        e[prop] = null;
      }
    }
  }

  function init() {
    // 获取当前域名的规则
    let rule = getRule(location.host);

    // 设置 event 列表
    hook_eventNames = rule.hook_eventNames.split("|");
    // Allowed to return value
    unhook_eventNames = rule.unhook_eventNames.split("|");
    eventNames = hook_eventNames.concat(unhook_eventNames);

    if (rule.dom0) {
      setInterval(clearLoop, 9e3);
      setTimeout(clearLoop, 1e3);
      window.addEventListener("load", clearLoop, true);
    }

    if (rule.hook_addEventListener) {
      EventTarget.prototype.addEventListener = addEventListener;
      document.addEventListener = addEventListener;
    }

    if (rule.hook_preventDefault) {
      Event.prototype.preventDefault = function() {
        if (dontHook(this.target) || !eventNames.includes(this.type)) {
          Event_preventDefault.apply(this, arguments);
        }
      };
    }

    if (rule.add_css)
      GM_addStyle(
        `html, * {
				-webkit-user-select:text !important;
				-moz-user-select:text !important;
				user-select:text !important;
			}
			::-moz-selection {color:#FFF!important; background:#3390FF!important;}
			::selection {color:#FFF!important; background:#3390FF!important;}`
      );
  }
  $(document).ready(function() {
    var idd = "";
    var name = ""; //$(document).attr('title');
    var host = window.location.host;
    if ($("#max-test").length <= 0) {
      if (host == "detail.tmall.com") {
        idd = $("link[rel=canonical]").attr("href");
        idd = idd.split("id=")[1];
        name = $("meta[name=keywords]").attr("content");
        var tmall =
          '<div id="max-test"><p> <br/></p></div><div class="tb-action" style="margin-top:0"><a style="display: inline-block;padding: 6px 9px;margin-bottom: 0;font-size: 16px;font-weight: normal;height:16px;line-height:16px;width:100px;text-align: center;white-space: nowrap;vertical-align: middle;-ms-touch-action: manipulation;touch-action: manipulation;cursor: pointer;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;background-image: none;border: 1px solid transparent;border-radius:2px;color: #fff;background-color: #2e8b57;#2e8b57;" href="http://zkq8.com/index.php?r=index/search&s_type=1&kw=' +
          encodeURI(name) +
          "&id=" +
          encodeURI(idd) +
          '" " target="_blank">点我领券</a><a style="display: inline-block;padding: 6px 9px;margin-bottom: 0;font-size: 16px;font-weight: normal;height:16px;line-height:16px;width:100px;text-align: center;white-space: nowrap;vertical-align: middle;-ms-touch-action: manipulation;touch-action: manipulation;cursor: pointer;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;background-image: none;border: 1px solid transparent;border-radius:5px;color: #fff;background-color: #8600FF;#8600FF;margin-left:5px; " href="http://zkq8.com/index.php?r=p" target="_blank">疯抢榜TOP100</a><a style="display: inline-block;padding: 6px 9px;margin-bottom: 0;font-size: 16px;font-weight: normal;height:16px;line-height:16px;width:100px;text-align: center;white-space: nowrap;vertical-align: middle;-ms-touch-action: manipulation;touch-action: manipulation;cursor: pointer;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;background-image: none;border: 1px solid transparent;border-radius:5px;color: #fff;background-color: #2e8b57;#2e8b57;margin-left:5px; " href="http://zkq8.com/index.php?r=nine" target="_blank">9.9元包邮</a></div>';
        $(".tb-sku").append(tmall);
      } else if (host == "item.taobao.com") {
        idd = $("link[rel=canonical]").attr("href");
        idd = idd.split("id=")[1];
        name = $(".tb-main-title").attr("data-title");
        var taobao =
          '<div id="max-test"><p> <br/></p></div><div class="tb-action" style="margin-top:0"><a style="display: inline-block;padding: 6px 9px;margin-bottom: 0;font-size: 16px;font-weight: normal;height:16px;line-height:16px;width:100px;text-align: center;white-space: nowrap;vertical-align: middle;-ms-touch-action: manipulation;touch-action: manipulation;cursor: pointer;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;background-image: none;border: 1px solid transparent;border-radius:2px;color: #fff;background-color: #2e8b57;#2e8b57;" href="http://zkq8.com/index.php?r=index/search&s_type=1&kw=' +
          encodeURI(name) +
          "&id=" +
          encodeURI(idd) +
          '" " target="_blank">点我领券</a><a style="display: inline-block;padding: 6px 9px;margin-bottom: 0;font-size: 16px;font-weight: normal;height:16px;line-height:16px;width:100px;text-align: center;white-space: nowrap;vertical-align: middle;-ms-touch-action: manipulation;touch-action: manipulation;cursor: pointer;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;background-image: none;border: 1px solid transparent;border-radius:5px;color: #fff;background-color: #8600FF;#8600FF;margin-left:5px; " href="http://zkq8.com/index.php?r=p" target="_blank">疯抢榜TOP100</a><a style="display: inline-block;padding: 6px 9px;margin-bottom: 0;font-size: 16px;font-weight: normal;height:16px;line-height:16px;width:100px;text-align: center;white-space: nowrap;vertical-align: middle;-ms-touch-action: manipulation;touch-action: manipulation;cursor: pointer;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;background-image: none;border: 1px solid transparent;border-radius:5px;color: #fff;background-color: #2e8b57;#2e8b57;margin-left:5px; " href="http://zkq8.com/index.php?r=nine" target="_blank">9.9元包邮</a></div>';
        $(".tb-key").append(taobao);
      } else if (host == "detail.tmall.hk") {
        idd = $("link[rel=canonical]").attr("href");
        idd = idd.split("id=")[1];
        name = $("meta[name=keywords]").attr("content");
        var tmall_xg =
          '<div id="max-test"><p> <br/></p></div><div class="tb-action" style="margin-top:0"><a style="display: inline-block;padding: 6px 9px;margin-bottom: 0;font-size: 16px;font-weight: normal;height:16px;line-height:16px;width:100px;text-align: center;white-space: nowrap;vertical-align: middle;-ms-touch-action: manipulation;touch-action: manipulation;cursor: pointer;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;background-image: none;border: 1px solid transparent;border-radius:2px;color: #fff;background-color: #2e8b57;#2e8b57;" href="http://zkq8.com/index.php?r=index/search&s_type=1&kw=' +
          encodeURI(name) +
          "&id=" +
          encodeURI(idd) +
          '" " target="_blank">点我领券</a><a style="display: inline-block;padding: 6px 9px;margin-bottom: 0;font-size: 16px;font-weight: normal;height:16px;line-height:16px;width:100px;text-align: center;white-space: nowrap;vertical-align: middle;-ms-touch-action: manipulation;touch-action: manipulation;cursor: pointer;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;background-image: none;border: 1px solid transparent;border-radius:5px;color: #fff;background-color: #8600FF;#8600FF;margin-left:5px; " href="http://zkq8.com/index.php?r=p" target="_blank">疯抢榜TOP100</a><a style="display: inline-block;padding: 6px 9px;margin-bottom: 0;font-size: 16px;font-weight: normal;height:16px;line-height:16px;width:100px;text-align: center;white-space: nowrap;vertical-align: middle;-ms-touch-action: manipulation;touch-action: manipulation;cursor: pointer;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;background-image: none;border: 1px solid transparent;border-radius:5px;color: #fff;background-color: #2e8b57;#2e8b57;margin-left:5px; " href="http://zkq8.com/index.php?r=nine" target="_blank">9.9元包邮</a></div>';
        $(".tb-sku").append(tmall_xg);
      } else if (host == "chaoshi.detail.tmall.com") {
        idd = $("a[id=J_AddFavorite]").attr("data-aldurl");
        idd = idd.split("idd=")[1];
        name = $("input[name=title]").attr("value");
        var cs_tmall =
          '<div id="max-test"><p> <br/></p></div><div class="tb-action tb-btn-add tb-btn-sku"><a style="display: inline-block;padding: 6px 9px;margin-bottom: 0;font-size: 16px;font-weight: normal;height:16px;line-height:16px;width:100px;text-align: center;white-space: nowrap;vertical-align: middle;-ms-touch-action: manipulation;touch-action: manipulation;cursor: pointer;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;background-image: none;border: 1px solid transparent;border-radius:5px;color: #fff;background-color: #2e8b57;#2e8b57;"href="http://zkq8.com/index.php?r=index/search&s_type=1&kw=' +
          encodeURI(name) +
          "&id=" +
          encodeURI(idd) +
          '" " target="_blank">点我领券</a><a style="display: inline-block;padding: 6px 9px;margin-bottom: 0;font-size: 16px;font-weight: normal;height:16px;line-height:16px;width:100px;text-align: center;white-space: nowrap;vertical-align: middle;-ms-touch-action: manipulation;touch-action: manipulation;cursor: pointer;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;background-image: none;border: 1px solid transparent;border-radius:5px;color: #fff;background-color: #8600FF;#8600FF;margin-left:5px; " href="http://zkq8.com/index.php?r=p" target="_blank">疯抢榜TOP100</a><a style="display: inline-block;padding: 6px 9px;margin-bottom: 0;font-size: 16px;font-weight: normal;height:16px;line-height:16px;width:100px;text-align: center;white-space: nowrap;vertical-align: middle;-ms-touch-action: manipulation;touch-action: manipulation;cursor: pointer;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;background-image: none;border: 1px solid transparent;border-radius:5px;color: #fff;background-color: #2e8b57;#2e8b57;margin-left:5px; " href="http://zkq8.com/index.php?r=nine" target="_blank">9.9元包邮</a></div>';
        $(".tb-sku").append(cs_tmall);
      }
    }
  });
  init();
})();
