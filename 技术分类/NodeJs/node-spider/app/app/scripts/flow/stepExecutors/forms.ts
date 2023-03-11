// Created by uoto on 16/5/6.

import { getElementByPath, pageChanged } from "../tools/dom";
import { ipcRenderer } from "electron";
export async function fill(data, locals, resolveChannel, rejectChannel) {
    var el: any = await getElementByPath(data.selector);
    if (el) {
        if (data.value === '$0' && locals && locals['$0']) {
            el.value = locals['$0'];
        } else if (data.value === '$2' && locals && locals['verificationCode']) {
            el.value = locals['verificationCode'];
        } else {
            el.value = data.value;
        }
        triggerEvent(el, 'change');
    }

    callback(resolveChannel);
}

export async function select(data, locals, resolveChannel, rejectChannel) {
    var el: any = await getElementByPath(data.selector);

    if (el) {
        if (data.value === '$0' && locals && locals['$0']) {
            el.value = locals['$0'];
        } else {
            el.value = data.value;
        }
        triggerEvent(el, 'change');

        pageChanged(el, function () {
            callback(resolveChannel);
        });
    } else {
        callback(rejectChannel, 'stepExecutor[select] 未找到元素');
    }
}

function callback(resolveChannel, ...args) {
    ipcRenderer.sendToHost(resolveChannel, ...args);
}

function triggerEvent(element, eventType) {
    var e = document.createEvent('MouseEvent');
    e.initEvent(eventType, true, true);
    element.dispatchEvent(e);
}