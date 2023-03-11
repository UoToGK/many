// Created by uoto on 16/4/15.

import {ipcRenderer} from "electron";
import {setParentLocals, getElementByPaths, resolveHref} from "../tools/dom";
import qs = require('querystring');

/**
 * 子流程设计器创建
 * 用来获取子页面链接
 */
export async function openLinkBlank(data: ILinkBlankStep, locals, resolveChannel, rejectChannel) {
    let href, form, el,sourceHref;
    try {
        await setParentLocals(locals);
        el = await getElementByPaths(data.paths, locals);

        if (el) {
            let link = el.closest('a'),
                button = el.closest('button'),
                hrefEl = el.closest('[href]');
            if (el.localName === 'a') {
                href = el.href;
                sourceHref = el.getAttribute('href');
            } else if (el.localName === 'button') {
                form = setForm(el);
            } else if (hrefEl) {
                sourceHref = href = hrefEl.getAttribute('href');
            } else if (link) {
                href = link.href;
                sourceHref = link.getAttribute('href');
            } else if (button) {
                form = setForm(button);
            }
            if (!form && !href) {
                form = setForm(el);
            }
            if (!form && href && (/^#+$/.test(sourceHref) || sourceHref.startsWith('javascript:'))) {
                href = null;
                form = setForm(el);
            }
        } else {
            return callback(rejectChannel, 'stepExecutor[openLinkBlank]警告: 未找到元素');
        }
    } catch (e) {
        return callback(rejectChannel, String(e.stack || e));
    }

    function getRoot() {
        var baseUrl;
        var curWwwPath = window.document.location.href;
        //获取主机地址之后的目录，如： myproj/view/my.jsp
        var pathName = window.document.location.pathname;
        var pos = curWwwPath.indexOf(pathName);
        //获取主机地址，如： http://localhost:8083
        var localhostPaht = curWwwPath.substring(0, pos);
        //获取带"/"的项目名，如：/myproj
        var projectName = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);
        //得到了 http://localhost:8083/myproj
        var realPath = localhostPaht + projectName;
        if(document.querySelector("head > base")){
            baseUrl=document.querySelector("head > base").getAttribute("href");
        }
        return baseUrl||localhostPaht;
    }

    //TODO:新增一个测试连通性功能，用于区分http://hostname/project 和 http://hostname/的情况
    if (href && data.url) {
        href = data.url.replace("\$1", href).trim();
        if(sourceHref&&sourceHref.startsWith("//www.")){
            href=document.location.protocol+sourceHref;
        }
        if(!/^http/.test(href)){//如果URL不是以http开头，
            href=getRoot()+href;
        }
    }
    if (href) {
        callback(resolveChannel, href);
    } else {
        // 重定向指定页面
        window['onRedirect'] = function (url) {
            offEvent(resolveChannel, url);
        };

        // method='get' 的 form
        window['onGetForm'] = function (form, ev) {
            var fd: any = new FormData(form);
            var data = {};
            fd.forEach(function (val, key) {
                if (typeof data[key] === 'undefined') {
                    data[key] = val;
                } else {
                    if (Array.isArray(data[key])) {
                        data[key].push(val);
                    } else {
                        data[key] = [data[key], val];
                    }
                }
            });
            var param = qs.stringify(data);
            var url = form.action;
            if (url.indexOf('?') > -1) {
                url += '&' + param;
            } else {
                url += '?' + param;
            }
            offEvent(resolveChannel, url);
        };

        // window.open
        window['onOpen'] = function (url) {
            offEvent(resolveChannel, url);
        };

        ipcRenderer.sendToHost('setRedirect');

        el.allowed = true;
        el.click();
    }
}

function offEvent(resolveChannel, url) {
    window['onRedirect'] = null;
    window['onGetForm'] = null;
    window['onOpen'] = null;
    ipcRenderer.sendToHost('unRedirect');
    callback(resolveChannel, resolveHref(url));
}

function callback(resolveChannel, returnVal) {
    ipcRenderer.sendToHost(resolveChannel, returnVal);
}

function setForm(el) {
    var form;
    try {
        form = el.closest('form');
        if (form) {
            form['subDesigner'] = true;
        }
    } catch (e) {
    }
    return !!form;
}