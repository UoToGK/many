// Created by uoto on 16/4/15.

import { getElementByPagingPath, transformBtn, pageChanged } from "../../tools/dom";
import { ipcRenderer } from "electron";

////////add function by yadong////////////
function replaceURL(_url, _cursor) {
    if (_url.indexOf("?") >= 0) {
        _url = _url + "&iris=" + _cursor;
    } else {
        _url = _url + "?iris=" + _cursor;
    }
    return _url;
}
function initUrl() {
    let _url = window.location.href;
    let _cursor = 1;
    if (!/iris=\d+/g.test(_url)) {
        _url = replaceURL(_url, _cursor);
        window.history.replaceState({
            "url": "iris"
        }, "replaceURL", _url);
    }
    return _url;
}
function findParentNode(el) {//找出包含所有数字分页按钮的最近的父节点
    let _current = el;
    let _content = _current.innerHTML;
    if (/[^\<\>\w]/gmi.test(_content)) {
        _content = _current.innerHTML.replace(/[^\<\>\w]/gmi, "");
    }
    while (!_content.match(/\>\d+\</g) || _content.match(/\>\d+\</g).length <= 1) {
        _current = _current.parentNode;
        _content = _current.innerHTML.replace(/[^\<\>\w]/gmi, "");
        if (_current.tagName.toUpperCase() === "BODY") {
            break;
        }
    }
    return _current;
}
function checkParentNode(_current) {//翻页按钮的父节点是否包含超链接A节点
    while (true) {
        if (_current.tagName.toUpperCase() === "A" || _current.tagName.toUpperCase() === "BODY") {
            return _current;
        } else {
            _current = _current.parentNode;
        }
    }
}
function findElementPath(el, _pn) {
    let _path: string | Array<string> = "";
    let _parentNode = el.parentNode;
    for (let i = 0; i < _parentNode.children.length && el !== _pn; i++) {
        if (el === _parentNode.children[i]) {
            _path = i + "," + _path;
            i = -1;
            el = el.parentNode;
            _parentNode = el.parentNode;
        }
    }
    if (_path.indexOf(",") >= 0) {
        _path = _path.replace(/\,$/g, "");
    }
    if (_path.indexOf(",") >= 0) {
        _path = _path.split(",");
    } else {
        _path = [_path];
    }
    return _path;
}
function findTargetDom(_parentNode, _cursor) {
    let _list = _parentNode.getElementsByTagName("*");//拿到父节点中的所有子节点
    for (let i = 0; i < _list.length; i++) {//寻找要点击的翻页按钮
        if (_list[i].innerText.replace(/\s+/g, "") === String(_cursor)) {
            return _list[i];
        }
    }
}
function numberPage(element) {
    let _url = initUrl();
    let _cursor = Number(_url.match(/iris=\d+$/g)[0].match(/\d+/g)[0]) + 1;//==2

    let _parentNode = findParentNode(element);//找到包含所有分页按钮的最近的父节点
    let _path = findElementPath(element, _parentNode);//找到规则中按钮的路径索引

    let _target = findTargetDom(_parentNode, _cursor);//寻找要点击的翻页按钮
    _path[0] = findElementPath(_target, _parentNode)[0];//找到要点击的翻页按钮的路径

    _target = _parentNode;
    for (let m = 0; m < _path.length; m++) {//找到要点击分页的按钮
        _target = _target.children[_path[m]];
    }

    let _current = checkParentNode(_target);//翻页按钮的父节点是否包含超链接A节点
    //如果包含超链接a且a有href属性时，确定时超链接跳转分页
    if (_current.tagName.toUpperCase() === "A" && /^http(s)?:\/+\w+(\.\w+)+/g.test(_current.href)) {//如果包含A节点，将超链接的锚点更换为新链接
        _current.href = replaceURL(_current.href, _cursor);
    }
    return _target;
}

function storageNumber(_key) {
    let _cookie = document.cookie;
    let _result = 0;
    if (_cookie.indexOf(_key + "=") >= 0) {
        _result = Number(_cookie.match(new RegExp(_key + "=\\\d+", "g"))[0].match(/\d+$/g)[0]) + 1;
        document.cookie = _key + "=" + _result + ";";
    } else {
        _result = 2;
        document.cookie = _key + "=" + 2 + ";";
    }
    return _result;
}
function inputPage(element, _key) {//文本框输入页码值翻页
    let _cursor = storageNumber(_key);
    let _event = document.createEvent("HTMLEvents");
    Event.call(_event).keyCode = 13;
    // _event.keyCode=13;
    element.value = _cursor;
    element.allowed = true;
    _event.initEvent("keydown", true, true);
    element.dispatchEvent(_event);
    _event.initEvent("keypress", true, true);
    element.dispatchEvent(_event);
}
////////add function by yadong////////////

export async function paging(step: IPagingStep, locals, resolve, reject) {
    let element: any = await getElementByPagingPath(step.selector);
    if (element) {
        element = transformBtn(element);
    }
    if (!element || element.disabled || /disabled/i.test(element.classList.toString())) {
        callback(resolve, false);// 分页已失效
    } else {
        pageChanged(element, function (timeout) {
            callback(resolve, !timeout);// 分页已结束
        });


        ////////////////////add code ///////////////////////////////
        /**
         * 核心思想：
         * 1、如果是文本框输入实现翻页的情况，将翻页值存到cookie中。下次翻页时再取出来。
         * 2、如果是数字翻页的情况下，且每个翻页按钮是个超链接的话，去修改url。将翻页的值存到url参数中
         * 3、如果是普通按钮翻页，直接执行就好，执行的是原系统中的代码。
         * 缺点：效率低；原因是目前为止未找到事件通信机制
         */
        if (element.tagName.toUpperCase() === "INPUT" && element.type && element.type.toUpperCase() === "TEXT") {//输入框分页
            inputPage(element, step.id);
        } else if (/^\d+$/g.test(element.innerText.replace(/\s*/g, ""))) {//数字分页
            element = numberPage(element);
            element.allowed = true;
            element.click();
        } else {
            element.allowed = true;
            ipcRenderer.sendToHost('debug', '点击分页')
            element.click();
        }


        /////////////////////////////////////////////////////////////////
        //原版的代码////////////////////
        // element.allowed = true;
        // element.click();
    }
}

function callback(resolve, value) {
    ipcRenderer.sendToHost(resolve, value);
}