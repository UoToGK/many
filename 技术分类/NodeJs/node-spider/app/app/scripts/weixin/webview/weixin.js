/**
 * Created by uoto on 16/2/18.
 */
const ipcRenderer = require('electron').ipcRenderer;

ipcRenderer.on('antispider', function (ev, code) {
    // 验证码处理
    const input = document.querySelector('#seccodeInput');
    if (input) {
        input.value = code;
        setTimeout(function () {
            document.querySelector('#submit').click();
        }, 500);
    }
});

ipcRenderer.on('content', function () {
    // 触发获取内容时，先判断是否存在验证码，如果存在验证码则先处理验证码
    if (checkAntispider()) {
        return;
    }

    // 否则返回内容
    if (document.body && location) {
        ipcRenderer.sendToHost('contentResult', {
            title: document.title,
            href: location.href,
            content: document.body.innerText
        });
    } else {
        ipcRenderer.sendToHost('contentResult', {title: document.title, href: location.href});
    }
});

ipcRenderer.on('links', function () {
    // 获取文章列表链接时，也需要判断是否存在验证码
    if (checkAntispider()) {
        return;
    }

    if (document.body) {
        const results = document.querySelectorAll('div.results .wx-rb h4 a');

        ipcRenderer.sendToHost('linksResult', getLinks(results || []));
    } else {
        ipcRenderer.sendToHost('linksResult', []);
    }
});

function checkAntispider() {
    // 当存在验证码图片时，就可以认为是跳转到了验证码拦截页面，将图片处理为 base64 的数据反馈到上级用来解析
    const img = document.querySelector('#seccodeImage');
    if (img) {
        ipcRenderer.sendToHost('seccode', toBase64(img));
        return true;
    }
}

function getLinks(results) {
    const arr = [];
    for (let i = 0; i < results.length; i++) {
        arr.push(results[i].href);
    }
    return arr;
}

window.onerror = function () {
    console.log('weixin webview error', arguments);
    return true;
};

window.alert = function (msg) {
    console.debug('news alert : ', msg);
};

function toBase64(img, outputFormat) {
    const canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d');

    canvas.height = img.height * 1.4;
    canvas.width = img.width * 2;
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL(outputFormat || 'image/jpeg');
}