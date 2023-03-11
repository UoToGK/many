import { indexOf, toArray, last, debounce } from 'lodash';
import * as _ from 'lodash'; //4月6日修改bug electron升级
import props from './properties';
import { basename } from 'path';

//dom操作工具
/**
 * toBase64
 * 图片转换成base64
 * @param img
 * @returns {Promise<string>}
 */
export async function imgToBase64(img) {
  //img.src="https://ss0.bdstatic.com/5aV1bjqh_Q23odCf/static/superman/img/logo/logo_white_fe6da1ec.png";
  img.crossOrigin = '*';
  return new Promise(function(resolve, reject) {
    if (!img || img.localName != 'img') {
      resolve();
    }
    //console.debug("imgToBase64",img.complete,img.height , img.width,img.src,mime.lookup(img.src));
    if (img.complete && img.height && img.width) {
      results();
    } else {
      var imgsrc = img.src;
      img.crossOrigin = 'anonymous';
      img.onload = results;
      //img.src=img.src1;
      results();
    }
    function results() {
      var canvas = document.createElement('canvas');
      canvas.setAttribute('id', 'myIrisCanvas');
      canvas.height = img.height;
      canvas.width = img.width;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      var datas = canvas.toDataURL();
      //console.debug("imgToBase64  results",datas,canvas.outerHTML,img.outerHTML);
      canvas = img = null;
      resolve(datas); //默认使用 image/png
    }
  });
}

/**
 * 根据csspath选择dom
 * @param path selector
 * @param parent 父元素的selector
 * @param all 是否全局查找
 * @returns {Promise<T[]>}
 */
export async function getElementByPath(path, parent, all) {
  let nm = await normalDoc(path); //确定是否存在frame元素
  return await queryElement(nm.path, parent || nm.document, all);
}

/**
 * 根据分页的cssPath来选择dom
 * @param path 分页path
 * @returns {Promise<any>}
 */
export async function getElementByPagingPath(path) {
  let nm = await normalDoc(path);
  let separator = ':content';
  let nm_path = nm.path;
  if (nm_path.includes(separator)) {
    let paths = nm_path.split(separator);
    let list = await queryElement(paths[0], nm.document, true);

    if (list && list.length) {
      let content = paths[1].slice(1, -1);
      for (let i = 0; i < list.length; i++) {
        if (getContent(list[i]) == content) {
          return list[i];
        }
      }
    } else {
      return null;
    }
  } else {
    return await queryElement(nm.path, nm.document);
  }
}

/**
 * 根据css选择器找到元素
 * @param paths
 * @param locals
 * @param selector
 * @returns {Promise<any>}
 */
export async function getElementByPaths(paths, locals, selector, all) {
  if (locals && locals.capture && locals.capture.isGlobalPath && selector) {
    var cur = document.querySelector(selector);
    if (cur) {
      //console.debug(" 按照路径去查找元素-cur:", paths[i],cur,cur.outerHTML);
      return cur;
    }
  }
  //1、存在父选择级操作项时
  if (locals.parentSelector && locals.parent) {
    //console.debug(" getElementByPaths:", paths, selector, locals);
    // 按照路径去查找元素
    for (let i = 0, l = paths.length, cur; i < l; i++) {
      //子元素是通过paths内的选择器来选择的。
      if ((cur = locals.parent.querySelector(paths[i]))) {
        if (cur) {
          //console.debug(" 按照路径去查找元素-cur:", paths[i],cur,cur.outerHTML);
          return cur;
        }
      }
    }
    //获取最后一个选择器
    let path = last(paths),
      splits = path.split(/\.|#/g),
      tagName = splits[0],
      cur;
    //按标签.样式名的去选择元素
    if (splits.length > 2) {
      // splits = [tagName , class , class....]
      for (let i = 1; i < splits.length; i++) {
        if ((cur = locals.parent.querySelector(tagName + '.' + splits[i]))) {
          if (cur) {
            //console.debug(" 按标签.样式名的去选择元素-cur:", cur);
            return cur;
          }
        }
      }
    }
    //按标签去选择元素
    if ((cur = locals.parent.querySelector(tagName))) {
      if (cur) {
        //console.debug(" 按标签去选择元素-cur:", cur);
        return cur;
      }
    }
    //如果没有找到,测试是否为本身
    if (tagName === locals.parent.localName) {
      //console.debug(" 如果没有找到,测试是否为本身-cur:", cur);
      return locals.parent;
    }
  }
  //2、针对存在选择器的情况， 如果上面的无法找到,则直接查找节点
  return await getElementByPath(selector || paths[0], null, all);
}

/**
 * 如果css选择器无法找到元素，则尝试多个版本来尝试选择到元素
 * @param selector
 * @returns {any}
 */
function cacheSelector(selector) {
  let reg = /nth-child\((\d+)\)/;
  let el = document.querySelector(selector);
  if (!el) {
    let max = -1;
    while (max < 10) {
      let newSelector = selector.replace(reg, `nth-child(${max + +RegExp.$1})`);
      let el = document.querySelector(newSelector);
      if (el) {
        return newSelector;
      }
      max += 1;
    }
  } else {
    return selector;
  }
}

/**
 * 设置parent对象的变量，将 selector 转换为 dom节点
 * @param locals
 * @returns {Promise<void>}
 */
export async function setParentLocals(locals) {
  let selector = locals.parentSelector;
  if (selector) {
    let newSelector = cacheSelector(selector);
    if (newSelector) {
      selector = newSelector != selector ? newSelector : selector;
    }
    locals.parent = await getElementByPath(selector);

    if (!locals.parent) {
      // 去除限制序号
      locals.parent = await getElementByPath(selector.replace(/\:nth-child\(\d+\)/, ''));
    }

    // 这里判断,如果这个父节点没有任何内容时
    // 将它赋值为空,不抓取
    if (locals.parent && !locals.parent.innerText.trim()) {
      locals.parent = null;
    }
  }
}

/**
 * 根据cssPath获取所属元素的 document
 * @param path
 * @returns {Promise<any>}
 */
async function normalDoc(path) {
  //用于分隔多个iframe的情况
  var paths = path.split(props.frameFind); //frameFind = ' >> '
  if (paths.length === 1) {
    // 没有 frame
    //console.debug("选择器为 无 iframe 模式",path);
    return { document, path };
  }
  return {
    //存在iframe模式
    document: await chooseDoc(paths, document),
    path: last(paths)
  };
}

/**
 * 查找dom节点的document
 * @param paths
 * @param doc
 * @returns {Promise<any>}
 */
async function chooseDoc(paths, doc) {
  var frame;
  //console.debug("选择器为 iframe 模式",paths);
  for (let i = 0; i < paths.length; i++) {
    let path = paths[i];
    if (path.includes('iframe')) {
      try {
        frame = await queryElement(path, doc);
        //：如 div.main:nth-child(1) > iframe#ifr_foot.htm >> div:nth-child(1)
        //有时iframe选择器无法选中，无法选中时，直接用 标签 iframe 去选择。
        frame = frame || (await queryElement('iframe', doc));
        frame = await onFrameReady(frame);
        doc = frame.contentDocument;
      } catch (e) {
        console.error(e);
      }
    }
  }
  return doc;
}

//查询页面元素，支持返回数据和单个元素
export async function queryElement(path, doc, all) {
  var method = all ? 'querySelectorAll' : 'querySelector';
  var timerSize = 10;
  var timeout = 100;
  var maxtimer = 2;
  var el,
    i = 1;
  while (true) {
    // if(path.includes('iframe'){//有时存在If
    //
    // }else{
    //     el = doc[method](path);
    // }
    el = doc[method](path);

    console.info('path=', path);
    console.info('method=', method);
    console.info('el=', el);
    if (el && el.nodeType === 1) {
      break;
    } else if (el && el.length) {
      break;
    } else if (i == timerSize && window['_loaded']) {
      break;
    } else if (i === timerSize * maxtimer) {
      // 最多等待时间
      break;
    }

    await delay(timeout);
    i++;
  }
  return el && el.length && el.localName != 'select' ? _.toArray(el) : el;
}

/**
 * 获取分页路径
 * @param node
 * @returns {Promise<string>}
 */
export function getPagingPath(node) {
  return new Promise(function(resolve, reject) {
    let tagName = node.localName;
    let framePath = getDocPath(node);

    let path;
    if (node.id) {
      path = getAllCssPath(node, true);
    } else if (/a|input|button/.test(tagName)) {
      path = `${framePath}${getCssPathSim(node, false, false)}:content(${getContent(node)})`;
    } else if (tagName === 'img') {
      path = `${framePath}${getCssPathSim(node, false, false)}[src*="${basename(node.src)}"]`;
    } else {
      path = `${framePath}${getCssPathSim(node, false, false)}`;
    }

    resolve(path);
  });
}

function getContent(el) {
  var content = el.innerText || el.value || '';
  return content.replace(/[\.>]/g, '');
}

/**
 * 获取节点的路径集合,用来通过多种途径来查找它
 * @param node
 * @returns {any[]}
 */
export function getTagPaths(node) {
  var cssPaths = [],
    parent;
  parent = node.parentNode;
  while (parent) {
    if (parent.localName === 'body') {
      break;
    }
    cssPaths.push(getCssPath(node, false, parent, true, false));
    parent = parent.parentNode;
  }
  return cssPaths.reverse();
}

/**
 * 过滤节点
 * @param nodeList
 * @param filters
 * @returns {any[]}
 */
export function filterNodeList(nodeList, filters) {
  var list = toArray(nodeList);

  let msg = ['共有节点' + list.length];
  let result = {
    msg: '',
    list: list
  };

  // 去除无用节点 /script|style|video|embed/
  list = list.filter((node) => !props.REGEXP.filterNode.test(node.localName));

  msg.push('去除 (script|style|video|embed) 后,剩余' + list.length);

  list = list.filter((node) => !!node.innerText.trim());

  msg.push('去除内容为空的节点后,剩余' + list.length);

  if (filters && filters.ignoreNodes) {
    let start = 0,
      end;
    // if (filters.ignoreNodes.includes('empty')) {// 去除空行
    //  list = list.filter(node => !!node.innerText.trim());
    // }
    if (filters.ignoreNodes.includes('first')) {
      msg.push('去除首个节点');
      start = 1;
    }
    if (filters.ignoreNodes.includes('last')) {
      msg.push('去除末尾节点');
      end = -1;
    }
    list = list.slice(start, end);
    msg.push(`过滤条件(首尾节点:${filters.ignoreNodes})后剩余${list.length}`);
  }

  if (filters && filters.includeText) {
    var includes = filters.includeText.split(props.REGEXP.words);
    /**
     * 使用过滤器
     * @type {HTMLElement[]}
     */
    list = list.filter(function(node) {
      return includes.some((word) => node.innerText.includes(word));
    });
    msg.push(`过滤条件(includeText:${filters.includeText})后剩余${list.length}`);
  }

  if (filters && filters.ignoreText) {
    var ignores = filters.ignoreText.split(props.REGEXP.words);
    /**
     * 使用过滤器
     * 任意节点的innerText如果包含任何一个忽略的字符
     * 将忽略此节点
     * @type {HTMLElement[]}
     */
    list = list.filter(function(node) {
      return !ignores.some((word) => node.innerText.includes(word));
    });
    msg.push(`过滤条件(ignoreText:${filters.ignoreText})后剩余${list.length}`);
  }

  result.msg = msg.join(';');
  result.list = list;
  return result;
}

/**
 * 获取节点完整的路径
 * 包含有iframe路径,iframe路径用` >> `来分隔
 * @param element
 * @param isTagName 是否只输出标签不输出class
 * @param isNth 是否输出带nth-child
 * @param isId 是否根据id输出
 * @returns {string}
 */
export function getAllCssPath(element, isTagName, isNth, isId) {
  let isarr = _.isArray(element);
  if (isarr && element.length > 1) {
    //多个元素不做处理
  } else if (isarr && element.length === 1) {
    return getDocPath(element[0]) + getCssPath(element[0], isTagName, false, isNth, isId);
  } else {
    return getDocPath(element) + getCssPath(element, isTagName, false, isNth, isId);
  }
}

/** 返回的是相对于body，即body>getDocPath(element) + getCssPathSim(element, false)但
 * body>不显示
 * 获取精简版的完整css路径
 * @param element
 * @returns {string}
 */
export function getAllCssPathSim(element) {
  return getDocPath(element) + getCssPathSim(element, false);
}

/**
 * 获取节点的完整css
 * @param node
 * @param isTagName
 * @param isNth
 * @param isId
 * @returns {string}
 */
export function getNodeCss(node, isTagName = false, isNth = true, isId = true) {
  if (node.nodeType === 9) {
    return '#document';
  }

  var name = node.localName;
  var nth = `:nth-child(${nthChildIndex(node)})`;

  //方式一：提取标签里的ID选择器
  if (isId && node.id && !props.REGEXP.number.test(node.id)) {
    return name + getCssId(node);
  }
  //方式二：提取标签的bth选择器  isTagName=true isNth=false
  if (isTagName) {
    if (isNth === false) {
      return name;
    }
    return name + nth;
  }
  //方式三：class选择器    isNth=false
  if (node.classList.length) {
    var cls = normalClass(toArray(node.classList));
    if (cls.length) {
      name += '.' + cls.join('.');
    }
  }

  if (!isNth) {
    return name;
  }
  //方式四：class选择器 + nth
  return name + nth;
}

export function normalClass(classList) {
  return classList.filter(function(value) {
    return props.REGEXP.cls.test(value);
  });
}

/**
 * 获取css路径，
 * 不包含iframe path信息
 * @param node 节点
 * @param isTagName 是否只输出标签不输出class
 * @param stopParent 停止元素
 * @param isNth 是否输出带nth-child
 * @param isId 是否根据id输出
 * @returns {string}
 */
export function getCssPath(node, isTagName, stopParent, isNth, isId) {
  let selector = '',
    path = [],
    doc = node.ownerDocument;
  while (node) {
    if (stopParent && node == stopParent) {
      break;
    }

    selector = getNodeCss(node, isTagName, isNth, isId);

    if (selector.includes('[id=') || selector.includes('#')) {
      //selector ---name+id //wei考虑页面中id存在两个相同的元素的情况
      /**
       * 1、在测试过的所有浏览器下，采用情况一下的方式，也就是直接用id取值的话，浏览器只会返回id相同的第一个元素的值。
       * 后面的值不会覆盖前面的值。
          2、采用情况二的方式，也就是不同范围内的相同id取值，在ie6下返回的结果是第一个能找到，
          但是第二个返回的是undefined，也就是说找不到值。但是在chrome和firefox下是可以分别取到两个值的。这就是不同浏览器的区别。
          综上所述，在一个页面里尽量的不要出现有相同id的元素
          注释：不要使用数字开头的 ID 名称！在某些浏览器中可能出问题。
       */
      if (doc.querySelectorAll(selector).length == 1) {
        path.push(selector);
        break;
      }
    }

    path.push(selector);

    node = node.parentNode;
    if (node && node.localName === 'body') {
      //递归处理到body不在继续处理
      node = null;
    }
  }
  return path.reverse().join(props.selectorFind);
}

/**
 * 找到规范的dom
 * 并且规范dom的属性
 * @param el
 * @returns {any}
 */
export function transformBtn(el) {
  try {
    if (el.closest('a')) {
      el = el.closest('a');
    } else if (el.closest('button')) {
      el = el.closest('button');
    }

    var _blank = '_blank',
      _self = '_self';

    if (el.localName === 'a' && (el.target === _blank || !el.target)) {
      el.target = _self;
    }

    let form;
    if ((form = el.closest('form')) && form.target === _blank) {
      form.target = _self;
    }
  } catch (e) {
    return false;
  }

  return el;
}

/**
 * 监听页面变化,有页面跳转,ajaxdom变化,还有 popstate 变化
 * @param el
 * @param done
 * @param timeout
 */
export function pageChanged(el, done, timeout = 20000) {
  let doc = el.ownerDocument,
    win = doc.defaultView;
  var removeListener, popstate;

  removeListener = DomChange(doc, function() {
    if (popstate) {
      console.debug('popstate change');
    } else {
      console.debug('ajax dom change');
    }
    callback();
  });

  win.onpopstate = function() {
    popstate = true;
  };

  // 任何类型的跳转操作都会触发unload事件
  win.onunload = function() {
    console.debug('href change');
    callback();
  };

  var oldOpen = win.open;
  win.open = function(url) {
    console.debug('win.open href change');
    win.open = oldOpen;
    location.href = url;
  };

  var timer = window.setTimeout(callback.bind(null, true), timeout);
  var triggered = false;

  function callback(timeout) {
    if (triggered) {
      return;
    }
    clearTimeout(timer);
    triggered = true;
    removeListener();
    win.onunload = null;
    win.onpopstate = null;
    done(timeout);
  }
}

/**
 * 获取精简的 css 路径
 * @param node
 * @param isTagName
 * @param stopParent
 * @returns {string}
 */
export function getCssPathSim(node, isTagName, stopParent) {
  var selector = '',
    path = [];
  while (node) {
    if (stopParent && node == stopParent) {
      break;
    }
    path.push((selector = getNodeCss(node, isTagName, false, false)));

    node = node.parentNode;
    if (node && node.localName === 'body') {
      //递归处理到body不在继续处理
      node = null;
    }
  }
  return path.reverse().join(props.selectorFind);
}

// 获取节点的 frame 路径
function getDocPath(node) {
  //ownerDocument 可返回某元素的根元素
  var parentDoc = node.ownerDocument;
  var path = [];
  while (parentDoc) {
    if (parentDoc.iframePath) {
      path.push(parentDoc.iframePath);
    }
    parentDoc = parentDoc.parentDoc;
  }
  var res = path.reverse().join(props.frameFind);
  return res ? res + props.frameFind : res;
}

// 获取元素位置的 css nth-child 索引从1开始
export function nthChildIndex(node) {
  return indexOf(node.parentNode.children, node) + 1;
}

export function resolveHref(href, doc = document) {
  let linkHrefGet = doc.createElement('a');
  doc.body.appendChild(linkHrefGet);
  linkHrefGet.href = href;
  href = linkHrefGet.href;
  document.body.removeChild(linkHrefGet);
  return href;
}

/**
 * 获取css中的id选择器
 * 在规范中,id不能以数字开头所以节点处理将会把以数字开头的id做特殊处理
 * @param {HTMLElement} node 处理节点
 * @example
 * 例子
 * <example module="getCssId">
 * <file name="file.html">
 *     <div id="123a"> id以数字开头 </div>
 *     <div id="test-id"> 正常id </div>
 * </file>
 * <file name="file.ts">
 *     var p = document.getElementById('123a');
 *     var a = document.getElementById('test-id');
 *
 *     //数字开头的id必须以这样写才是合法的css选择器
 *     var id:string = getCssId(p); // => [id="123a"]
 *     var id2:string = getCssId(p); // => #test-id
 * </file>
 * </example>
 */
export function getCssId(node) {
  if (node.id) {
    var id = node.id;
    return /\d/.test(id.charAt(0)) ? `[id="${id}"]` : `#${id}`;
  }
  return '';
}

/**
 * 监听frame的准备就绪事件
 * @param iframe
 * @returns {Promise<HTMLIFrameElement>}
 */
export function onFrameReady(iframe) {
  return new Promise(function(resolve, reject) {
    try {
      if (iframe.contentWindow['ready']) {
        return resolve(iframe);
      }
      //对iframe发生错误或者就绪，统一覆盖
      iframe.onerror = iframe.onload = function ready() {
        iframe.onload = null;
        iframe.contentWindow['ready'] = true;
        resolve(iframe);
      };
      if (iframe.contentDocument.readyState === 'complete') {
        iframe.onerror = iframe.onload = null;
        resolve(iframe);
      }
    } catch (e) {
      reject();
    }
  });
}

/**
 * 将dom节点的关键属性转换成普通对象用来在ipc通信中传递
 * @param event
 * @returns {TagInfo}
 */
export function formatDomToObject(event) {
  if (!event) {
    return null;
  }
  return formatDom.format(event.target);
}

export function DomChange(doc, callback, progress) {
  let fn = debounce(function() {
    unwatch();
    callback();
  }, 888);

  var callproxy = function() {
    fn();
    progress && progress();
  };

  doc.addEventListener('DOMNodeInserted', callproxy);
  doc.addEventListener('DOMNodeRemoved', callproxy);

  function unwatch() {
    doc.removeEventListener('DOMNodeInserted', callproxy);
    doc.removeEventListener('DOMNodeRemoved', callproxy);
  }

  return unwatch;
}

/**
 * 将一个dom元素转换为一个类似dom的对象
 * @param dom
 * @returns {{id, localName, tagName, nodeName, nodeType: (any|number), type, href, parentIsLink: (boolean|JQuery|Element|null|any[]), value, innerHTML, innerText, outerHTML, attributes: TagAttr[], selector}}
 */
export function format(dom) {
  dom = getDom(dom);
  let link = dom.closest('a');
  let href = dom.closest('[href]');
  let form = dom.closest('form');
  if (form && form.method === 'get') {
    form = true;
  }
  return {
    id: dom.id,
    localName: dom.localName,
    tagName: dom.tagName,
    nodeName: dom.nodeName,
    nodeType: dom.nodeType,
    type: dom.type || '',
    href: dom.href || dom.attributes.href || dom.attributes.link || '',
    imgURL: dom.src || '',
    base64: dom.src || '',
    parentIsLink: !!link || !!href || form,
    value: simStr(dom.value),
    innerHTML: simStr(dom.innerHTML),
    innerText: simStr(dom.innerText),
    outerHTML: simStr(dom.outerHTML),
    attributes: fromTagAttrs(dom.attributes, dom),
    selector: getAllCssPath(dom, true)
  };
}

// 忽略模板中的无用元素
// 如 <a><span>asd</span></a> 这里的span就会被忽略
function getDom(dom) {
  var parent = dom.parentElement;
  if (parent && parent.childElementCount === 1 && parent.localName === 'a' && parent.innerText.trim()) {
    return parent;
  }
  if (dom.closest('button')) {
    return dom.closest('button');
  }
  return dom;
}

var sp = /\s+/g;

function simStr(str) {
  return String(str || '')
    .replace(sp, ' ')
    .slice(0, 200);
}

// 忽略的属性名称
var ignoreAttrs = /class|style|id|autocomplete|autofocus|disabled|iris-/;

export function fromTagAttrs(attributes, dom) {
  return _.chain(Array.from(attributes))
    .filter(function(attr) {
      return !ignoreAttrs.test(attr.name);
    })
    .map(function(attr) {
      return {
        name: attr.name,
        value: dom[attr.name] || attr.value,
        type: 'attr'
      };
    })
    .value();
}
