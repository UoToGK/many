import { pageChanged } from "../../tools/dom";

import { ipcRenderer } from "electron";
import { delay } from "../../../base/util";

export async function autoPaging(step: IPagingStep, locals, resolve, reject) {
  try {
    pageChanged(document.body, function (timeout) {
      callback(resolve, !timeout);// 分页已结束
    });
    document.body.scrollTop = document.body.scrollHeight;
    await delay(1 * 1000);

  } catch (e) {
    callback(reject, `stepExecutor[autoPaging] 警告: ${String(e.stack || e)}`);
  }
}

function callback(resolve, value) {
  ipcRenderer.sendToHost(resolve, value);
}