import { ipcRenderer } from "electron";
import { setParentLocals, getElementByPaths } from "../tools/dom";

/**
 * 流程控制的 `if` 暂时不上把
 */

export async function IF(data, locals, resolveChannel, rejectChannel) {
    await setParentLocals(locals);
    let img = await getElementByPaths(data.paths, locals);//获取验证码图片
    if (img) {
        ipcRenderer.sendToHost("seccode", toBase64(img));
        return true;
    }
}

function toBase64(img, outputFormat?) {
    const canvas = document.createElement("canvas"),
        ctx = canvas.getContext("2d");

    canvas.height = img.height * 1.4;
    canvas.width = img.width * 2.0;
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL(outputFormat || "image/jpeg");
}

function callback(resolveChannel, returnVal) {
    ipcRenderer.sendToHost(resolveChannel, returnVal);
}