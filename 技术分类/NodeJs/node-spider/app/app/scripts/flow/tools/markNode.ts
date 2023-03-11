import { each, chain, intersection, toArray } from "lodash";
import {
  getElementByPath,
  filterNodeList,
  getTagPaths,
  getPagingPath,
  getElementByPagingPath,
  getAllCssPath,
  getNodeCss,
  normalClass,
  pageChanged
} from "./dom";
import { ipcRenderer } from "electron";
import { delay } from '../../base/util'
import { MARK, ATTRS, REGEXP, BEHAVIOR } from "../properties";

/**
 * 标记元素，包括标记元素循环列表，分页选择器，采集元素等等。。。、
 * @type {{}}
 */
var markNode = {
  /**
   * 获取选择器上级选择器
   * @name mark_parent_path
   * @param data
   * @param locals
   * @param resolve
   * @param reject
   */
  async [MARK.parentPath](selector, locals) {
    var path = selector;
    var pathHome, currentPath;
    var el = locals.el;
    if (path) {
      pathHome = currentPath = path;
      if (path.lastIndexOf(">") >= 0) {
        pathHome = path.slice(0, path.lastIndexOf(">")).trim();
        currentPath = path.slice(path.lastIndexOf(">") + 1).trim();
        var tagname = currentPath.match(/([a-z0-9]*)*/i)[1];
        if (currentPath && tagname != currentPath) {
          path = `${pathHome}> ${tagname}`;
        } else {
          path = pathHome;
        }
      }
    }

    return path;

    function filter(nodeList) {
      return toArray(nodeList).filter(function (el: any) {
        return !REGEXP.filterNode.test(el.localName);
      });
    }
  },
  /**
   * 获取循环元素的循环path
   * @name mark-cycle-path
   * @param data
   * @param locals
   * @param resolve
   * @param reject
   */
  async [MARK.cyclePath](data, locals, resolve, reject) {
    let el;
    if (data.selector) {
      el = await getElementByPath(data.selector);
    } else {
      el = data.el;
    }
    var path = data.selector;

    if (el) {
      let cls,
        nodes = filter(el.parentElement.children);
      cls = chain(<any>nodes)
      ["map"]("classList")
        .invokeMap("toString")
        .invokeMap("trim")
        .compact() // 去掉空
        .invokeMap("split", " ")
        .value();
      cls = intersection(...cls); // 找交集
      cls = normalClass(cls);
      path = getAllCssPath(el, false, false, false);
      path = path.slice(0, path.lastIndexOf(">"));
      if (cls.length && isAllMatch(nodes.length, el.parentElement, cls)) {
        path = `${path}> .${cls.join(".")}`; // 这里不设置标签名称
      } else {
        path = `${path}> ${el.localName}`;
      }
    }

    if (path) {
      // 测试获取的path是否合理,如果无法找到自己,则使用下面备用方案
      var item = await getElementByPath(path);
      if (item) {
        let list = filter(item.parentElement.children);
        if (!list.some(node => node === el)) {
          path = null;
        }
      }
    }

    if (!path) {
      path = getAllCssPath(el);
    }
    if (resolve) {
      defaultCallback(resolve, path);
    } else {
      return path;
    }

    function isAllMatch(len, parent, css) {
      let len2 = parent.querySelectorAll(`.${css.join(".")}`).length;
      return len2 / len > 0.4;
    }

    function filter(nodeList) {
      return toArray(nodeList).filter(function (el: any) {
        return !REGEXP.filterNode.test(el.localName);
      });
    }
  },
  /**
   * 将当前的元素添加样式,作为循环标记
   * @name mark-cycleSelect
   * @param data
   * @param locals
   * @param resolveChannel
   * @param rejectChannel
   */
  async [MARK.cycleSelect](data, locals, resolveChannel, rejectChannel) {
    var step: ICycleStep = data.step,
      selector;
    var attr = ATTRS.cycle;
    var element = await getElementByPath(step.selector);
    var doc;
    if (element) {
      doc = element.ownerDocument;
      removeAttrs(doc.querySelectorAll(`[${attr}]`), attr);
    }

    let res, newNode;

    if (step.expert) {
      selector = step.custom_selector;
      if (selector) {
        let list = await getElementByPath(selector, null, true);
        res = filterNodeList(list, step.filters);
      }
    } else {
      selector = step.selector.replace(REGEXP.lastNth, "");
      newNode = await getElementByPath(selector);
      res = filterList(newNode, step.filters);
    }

    addStyleAttr(res.list, attr);

    if (!step.custom_selector) {
      return cycleCallback(
        resolveChannel,
        res.list,
        await markNode[MARK.cyclePath]({ el: res.list[0] })
      );
    }
    cycleCallback(resolveChannel, res.list, step.custom_selector);
  },

  /**
   * 扩大选择范围
   * @name mark-cycleExpand
   * @param data
   * @param locals
   * @param resolveChannel
   * @param rejectChannel
   */
  async [MARK.cycleExpand](data, locals, resolveChannel, rejectChannel) {
    var step: ICycleStep = data.step;
    // var element = await getElementByPath(step.selector);//查询所有元素,返回
    // var element_sour = await getElementByPath(step.selector_sour || step.selector);
    var elements = await getElementByPath(step.selector, null, true); //查询所有元素
    var elements_sour = await getElementByPath(
      step.selector_sour || step.selector,
      null,
      true
    ); //查询所有元素
    var parentElement;
    var res;

    //清除节点被选中的样式
    var attr = ATTRS.cycle;
    elements && removeAttrs(elements[0].parentElement.children, attr);
    elements_sour && removeAttrs(elements_sour[0].parentElement.children, attr);
    var path = await markNode[MARK.parentPath](step.selector, {
      el: elements[0]
    });

    var pelements = await getElementByPath(path, null, true); //查询所有元素
    //对查出的元素进行数据过滤
    if (
      elements &&
      elements[0].parentElement &&
      elements[0].parentElement.localName != "body"
    ) {
      //新加入对下一页的
      parentElement = elements[0].parentElement;
      res = filterNodeList(pelements, step.filters);
    } else if (elements[0]) {
      res = filterNodeList(pelements, step.filters);
    }

    addStyleAttr(res.list, attr);
    if (step.behavior != BEHAVIOR.contentList) {
      path = await markNode[MARK.cyclePath]({ el: parentElement });
    }
    // var path = await markNode[MARK.cyclePath]({el: parentElement});

    cycleCallback(resolveChannel, res.list, path);
  },

  /**
   * 重置循环元素范围
   * @name mark-cycleReset
   * @param data
   * @param locals
   * @param resolveChannel
   * @param rejectChannel
   */
  async [MARK.cycleReset](data, locals, resolveChannel, rejectChannel) {
    var step: ICycleStep = data.step;
    var element = await getElementByPath(step.selector);
    var res;
    element && removeAttrs(element.parentElement.children, ATTRS.cycle);

    res = filterList(await getElementByPath(step.selector_sour), step.filters);

    addStyleAttr(res.list, ATTRS.cycle);

    cycleCallback(resolveChannel, res.list, step.selector_sour);
  },

  /**
   * 标记抓取元素
   * @name mark-captures
   * @param data
   * @param locals
   * @param resolveChannel
   * @param rejectChannel
   * @return Promise.resolve(list)
   */
  async [MARK.captures](data, locals, resolveChannel, rejectChannel) {
    var step: ICaptureStep = data.step;
    var result = await selectList(step.captures);

    addStyleAttr(result.elements, ATTRS.behavior);

    defaultCallback(resolveChannel, result.list);
  },

  /**
   * 标记默认step
   * @name mark-defaults
   * @param data
   * @param locals
   * @param resolveChannel
   * @param rejectChannel
   */
  async [MARK.defaults](data, locals, resolveChannel, rejectChannel) {
    var step: IStepOption = data.step;
    var element = [await getElementByPath(step.selector)];

    addStyleAttr(element, ATTRS.behavior);

    defaultCallback(resolveChannel, true);
  },

  /**
   * 分页标记
   * @name mark-paging
   * @param data
   * @param locals
   * @param resolveChannel
   * @param rejectChannel
   */
  async [MARK.paging](data, locals, resolveChannel, rejectChannel) {
    var element = await getElementByPagingPath(data.step.selector);

    addStyleAttr([element], ATTRS.paging);

    defaultCallback(resolveChannel, true);
  },

  /**
   * 获取分页元素的精简 css path
   * @name mark-paging-path
   * @param data
   * @param locals
   * @param resolveChannel
   * @param rejectChannel
   */
  async [MARK.paging_path](data, locals, resolveChannel, rejectChannel) {
    var element = await getElementByPath(data.tag.selector);
    var selector;
    if (element) {
      selector = await getPagingPath(element);
    }

    defaultCallback(resolveChannel, selector);
  },

  /**
   * 取消标记
   * @name mark-cancel
   * @param data
   * @param locals
   * @param resolveChannel
   * @param rejectChannel
   */
  async [MARK.cancel](data, locals, resolveChannel, rejectChannel) {
    var res = await selectList(data.selects);

    removeAttrs(res.elements, ATTRS.behavior, ATTRS.cycle, ATTRS.paging);

    defaultCallback(resolveChannel, true);
  },

  /**
   * 处理节点的获取路径
   * @name mark-capturePaths
   * @param data
   * @param locals
   * @param resolveChannel
   * @param rejectChannel
   */
  async [MARK.paths](data, locals, resolveChannel, rejectChannel) {
    var element = await getElementByPath(data.tag.selector);
    var paths = [];
    if (element) {
      paths = getTagPaths(element);
    }

    var endCss = getNodeCss(<any>element, false, false, false);

    paths.push(endCss);

    defaultCallback(resolveChannel, paths);
  },

  /**
   * @name select-options
   * @param data
   * @param locals
   * @param resolve
   * @param reject
   */
  async [MARK.select_options](data, locals, resolve, reject) {
    var select: HTMLSelectElement = await getElementByPath(data.step.selector);

    var list = chain(<any>select.options)
    ["map"](option => {
      return { text: option.text, value: option.value };
    })
      .value();
    defaultCallback(resolve, {
      list
    });
  },
  //模拟下拉点击
  async [MARK.autoPaging](data, locals, resolveChannel, rejectChannel) {

    try {
      pageChanged(document.body, function (timeout) {
        ipcRenderer.sendToHost(resolveChannel, timeout);
        defaultCallback(resolveChannel, {})
      });
      document.body.scrollTop = document.body.scrollHeight
      await delay(1 * 1000);
    } catch (e) {
      defaultCallback(rejectChannel, `stepConfig[autoPaging] 警告: ${String(e.stack || e)}`);
    }
  }


}
let a = 2;

export default markNode;

// 添加样式属性
function addStyleAttr(list, attr) {
  each(list, function (node) {
    if (node && node.setAttribute) {
      if (!node.clientHeight || !node.clientWidth) {
        node.setAttribute(attr + "-childs", "true");
      }
      node.setAttribute(attr, "true");
    }
  });
}

// 移除样式属性
function removeAttrs(list, ...attr) {
  each(list, function (node) {
    if (node && node.removeAttribute) {
      attr.forEach(function (n) {
        node.removeAttribute(n);
        node.removeAttribute(n + "-childs");
      });
    }
  });
}

// 过滤列表
function filterList(element, filters: INodeFilters) {
  return filterNodeList(element.parentElement.children, filters);
}

async function selectList(array) {
  var elements = [];
  if (!array) {
    array = [];
  }
  var list = array.filter(function (item) {
    return item.selector;
  });

  for (var i = 0; i < list.length; i++) {
    elements[i] = await getElementByPath(list[i].selector);
  }

  return {
    elements,
    list
  };
}

function cycleCallback(resolveChannel, list, selector) {
  ipcRenderer.sendToHost(resolveChannel, {
    size: list.length,
    selector: selector
  });
}

function defaultCallback(resolveChannel, resultValue) {
  ipcRenderer.sendToHost(resolveChannel, resultValue);
}
