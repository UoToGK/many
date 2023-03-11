// Created by uoto on 16/4/15.
import { ipcRenderer } from "electron";
import {
  getElementByPath,
  filterNodeList,
  getAllCssPath,
  setParentLocals,
  getElementByPaths
} from "../../tools/dom";
import { REGEXP } from "../../properties";
import { setIframeVars } from "../../tools/events";
import { delay } from "../../../base/util";
import { nodeCapture } from "../captures/node-capture";

export async function cycle(step: ICycleStep, locals, resolve, reject) {
  let result = {},
    element;
  await delay((+step.delay || 0) * 1000);
  if (step.expert) {
    //adj. 熟练的；内行的；老练的
    let list = await getElementByPath(step.custom_selector, null, true);

    element = [].slice.call(list)[0];
    ipcRenderer.sendToHost("debug", `stepExecutor[cycle] element${element.nodeName}`);
    result = filterNodeList(list, step.filters);
  } else {
    element = await getElementByPath(step.selector.replace(REGEXP.lastNth, ""));
    if (element) {

      result = filterNodeList(element.parentElement.children, step.filters);
    }
  }
  if (!element) {
    result["msg"] = "stepExecutor[cycle] 警告: 未找到元素";
    return callback(resolve, result);
  }
  let doc = element.ownerDocument,
    win = doc.defaultView,
    parent = win.parent;

  //TODO:找一个带有Ifram嵌套的页面进行测试一下如下的逻辑是什么。重要
  if (
    parent.document &&
    win.frameElement &&
    win != parent &&
    !doc["iframePath"]
  ) {
    // 是 iframe 框架页面,有可能在iframe刷新之后,绑定的属性 `iframePath` 之类的会消失
    // 这里需要重新设置它
    setIframeVars(doc, parent.document, win.frameElement);
  }
  result["list"] = result["list"].map(function (element) {
    return getAllCssPath(element, void true, void false, false);
  });

  callback(resolve, result);
}

export async function preCycleCapture(data, locals, resolve, reject) {
  let res = [],
    { capture, list } = data;
  for (let i = 0; i < list.length; i++) {
    let _locals = { parentSelector: list[i] };
    await setParentLocals(_locals);
    let el = await getElementByPaths(capture.paths, _locals, capture.selector);
    let exec = nodeCapture[capture.behavior];
    if (el && exec) {
      let result = {};
      result["selector"] = list[i];
      result["value"] = await exec(el, capture, result, _locals);
      res.push(result);
    }
  }
  callback(resolve, res);
}

function callback(resolve, result) {
  ipcRenderer.sendToHost(resolve, result);
}
