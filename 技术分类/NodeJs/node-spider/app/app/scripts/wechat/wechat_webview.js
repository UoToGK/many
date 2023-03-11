/**
 * Created by Administrator on 2016/4/1.
 * 抓取公众号的预加载监听事件
 */
const ipcRenderer = require("electron").ipcRenderer;

//微信搜索文章的链接

ipcRenderer.on("executeSearch", function (ev, msg) {
    ipcRenderer.sendToHost("debug", `当前页链接：${location.href}`);
    if (_checkAntispider()) {
        ipcRenderer.sendToHost("debug", "有验证码")
        return;
    }
    var searchInput = document.querySelector('#query');
    var clickBtn = document.querySelector('#searchForm > div > input.swz');
    if (searchInput && clickBtn && !searchInput.value) {
        ipcRenderer.sendToHost("debug", `填充微信号：${msg}`);

        searchInput.value = msg;
        ipcRenderer.sendToHost("debug", `click按钮${clickBtn.value}---searchInput value :${searchInput.value}`)
        setTimeout(() => {
            clickBtn.click();
            ipcRenderer.sendToHost("debug", `click后当前页链接：此时尚未跳转${location.href}`)
        }, 500);
        return;
    }

    ipcRenderer.sendToHost("debug", `往下走`);
    if (_checkAntispider()) {
        ipcRenderer.sendToHost("debug", "有验证码")
        return;
    }
    if (location.href == "https://weixin.sogou.com/" || location.href.includes('antispider') || document.title.includes('502')) {
        ipcRenderer.sendToHost("debug", "返回首页")
        return ipcRenderer.sendToHost('goTohome')
    }
    if (_checkAntispider()) {
        ipcRenderer.sendToHost("debug", "有验证码")
        return;
    }
    // 筛选一周内时间
    var time_range = document.querySelector('#tool > span:nth-child(1) > div > a:nth-child(4)')

    if (time_range && time_range.getAttribute('href') != "javascript:void(0)") {
        ipcRenderer.sendToHost("debug", `点击元素是否为“一周内”--${time_range.innerText == "一周内" ? "是" : "否"}`);

        setTimeout(() => {
            time_range.click();
        }, 500);

        return;
    }

    ipcRenderer.sendToHost("debug", `点击选取条件后，再次进入，当前页链接：${location.href}`);
    // 获取列表链接
    const results = document.querySelectorAll('#main > div.news-box > ul>li>div.txt-box>h3>a')
    if (!results || !results.length) {
        return ipcRenderer.sendToHost('Over')
    }
    ipcRenderer.sendToHost("debug", `获取列表链接数量：${results.length}`);
    return ipcRenderer.sendToHost('search_results', _filter(results) || [], location.href)

});
ipcRenderer.on('getReadyToContent', function (ev, msg) {
    if (_checkAntispider()) {
        return;
    }
    var element = document.getElementById(msg);
    ipcRenderer.sendToHost("debug", `获取列表元素：${element.id}---${element.innerText}`);
    if (element) {
        element.click();
        return;
    }

})
//对公众号的文章处理
ipcRenderer.on("content", function () {
    if (_checkAntispider()) {
        return;
    }
    ipcRenderer.sendToHost("debug", `开始获取内容`);

    var source = document.getElementById('js_share_source');
    if (source) {
        source.click();
        return;
    }
    const _results = {
        column_pageTitle: "",
        column_pageUrl: "",
        column_pageContent: "",
        column_media: "",
        column_pageDate: ""
    };
    var globalErr = document.querySelector('#activity-detail > div > div.text_area > div')

    if (globalErr || document.querySelector('body > div > div').innerText.includes('访问频繁')) {
        _results.column_pageUrl = location.href;
        _results.column_pageContent = globalErr.innerText;
        return ipcRenderer.sendToHost('contentResult', _results)
    }
    // _results.column_pageTitle = document.title;
    var title = document.querySelector("#activity-name");
    if (title) {
        ipcRenderer.sendToHost("debug", `column_pageTitle：${title.innerText}`);
        _results.column_pageTitle = title.innerText
    } else {
        ipcRenderer.sendToHost('debug', '标题不存在,全文获取innerHTML')
        _results.column_pageContent = document.body.innerHTML
        return ipcRenderer.sendToHost("contentResult", _results)
    }
    if (document.body && location) {
        _results.column_pageUrl = location.href;
        _results.column_pageContent = document.body.innerHTML;//#js_content
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
    ipcRenderer.sendToHost('finished')
});

var countInput = 0;
ipcRenderer.on("antispider", function (ev, code) {
    const input = document.querySelector("#seccodeInput,#input.frm_input,#seccode");
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
    if (!code) {
        ipcRenderer.sendToHost("debug", "验证码不存在，返回搜索页")
        return ipcRenderer.sendToHost('goTohome')
    }
    if (input) {
        ipcRenderer.sendToHost("debug", "填充验证码")

        input.value = code;

        var submit = document.getElementById('submit');
        var errTips = document.querySelector('#error-tips');
        ipcRenderer.sendToHost("debug", `提交按钮${submit.value}`)
        if (submit) {
            setTimeout(function () {
                submit.click();

                ipcRenderer.sendToHost("debug", `错误信息是否展示 ${errTips.style.display}`)
                if (!(errTips.style.display == "none")) {
                    errTips.style.display = "none"
                    ipcRenderer.sendToHost("debug", `验证码输入错误，请重新输入`)
                    _checkAntispider();
                    countInput++;
                    if (countInput > 2) {
                        return ipcRenderer.sendToHost('goTohome')
                    }
                }
            }, 500);
        }

    }
});

function _filter(results) {
    const arr = [];
    for (let i = 0; i < results.length; i++) {
        arr.push(results[i].getAttribute("id"));
    }
    return arr;
}

function _checkAntispider() {
    let img = document.querySelector("#seccodeImage,#code-img"); //#verify_img

    if (img || location.href.includes('antispider')) {
        ipcRenderer.sendToHost("debug", `遇到打码，返回大码图片`);
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
    return true;
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
        resolve('')
    });
});
