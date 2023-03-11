// Created by uoto on 16/5/6.
import { ipcRenderer } from "electron";
import { getElementByPath, transformBtn, pageChanged } from "../tools/dom";
// 点击事件
export async function click(data, locals, resolveChannel, rejectChannel) {
    var el: any = await getElementByPath(data.selector);
    if (el) {
        try {
            el = transformBtn(el);
            pageChanged(el, function () {
                callback(resolveChannel, null);
            });

            el.allowed = true;
            el.click();

        } catch (e) {
            callback(rejectChannel, `stepExecutor[click]警告: ${String(e.stack || e)}`);
        }
    } else {
        callback(rejectChannel, `stepExecutor[click]未找到元素`);
    }
}

export async function mouseover(data, locals, resolveChannel, rejectChannel) {
    var el: any = await getElementByPath(data.selector);
    if (el) {
        try {
            pageChanged(el, function () {
                callback(resolveChannel, null);
            });
            el.allowed = true;
            triggerEvent(el, "mouseover");

        } catch (e) {
            callback(rejectChannel, `stepExecutor[mouseover]警告: ${String(e.stack || e)}`);
        }
    } else {
        callback(rejectChannel, `stepExecutor[mouseover]未找到元素`);
    }
}

export async function mouseout(data, locals, resolveChannel, rejectChannel) {
    var el: any = await getElementByPath(data.selector);// hightSetting

    if (el) {
        try {
            pageChanged(el, function () {
                callback(resolveChannel, null);
            });
            el.allowed = true;
            triggerEvent(el, "mouseout");
        } catch (e) {
            callback(rejectChannel, `stepExecutor[mouseout]警告: ${String(e.stack || e)}`);
        }
    } else {
        callback(rejectChannel, `stepExecutor[mouseout]未找到元素`);
    }
}
function callback(resolveChannel, returnVal) {
    ipcRenderer.sendToHost(resolveChannel, returnVal);
}

function triggerEvent(element, eventType) {
    var e = new Event(eventType)
    element.dispatchEvent(e);
    ipcRenderer.sendToHost('debug', `debug 触发${e.type}事件`)
}



