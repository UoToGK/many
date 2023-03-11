// Created by uoto on 16/4/27.
var ACTION = require("./action.yaml");
import { BEHAVIOR } from "../../../properties";

export module Behavior {
  // 标签行为转换
  export function formatBehavior(tag: TagInfo) {
    const actions = (Behavior[tag.localName] || Behavior.any)(tag);
    actions.nom = transform(actions.nom, tag);
    actions.sup = transform(actions.sup, tag);

    return actions;
  }

  // 转换行为到具体信息
  // 包括行为描述，预览，如：innerText，解析为 采集文本，预览文本内容等。
  function transform(list: string[], tag: TagInfo) {
    return list.map(function (type) {
      let obj = <any>ACTION[type];
      let result = {
        text: obj.text,
        name: obj.name || obj.text,
        behavior: type,
        attrs: null,
        title: "",
        desc: ""
      };
      if (type === BEHAVIOR.attr) {
        result.attrs = tag.attributes;
        result.title = result.desc = result.attrs
          .map(function (attr: TagAttr) {
            return `[${attr.name} = ${attr.value}]`;
          })
          .join(", \n");
      } else {
        result.title = tag[type] === void 0 ? obj.desc : tag[type];
        result.desc = obj.desc || result.title;
      }

      return result;
    });
  }

  /* 对应的特殊功能标签行为分别解析 */
  export function any(tag: TagInfo) {
    // 新增下拉分页功能
    const nom = [
      BEHAVIOR.paging,
      BEHAVIOR.cycle,
      BEHAVIOR.contentList,
      BEHAVIOR.pageTitle,
      BEHAVIOR.pageText,
      BEHAVIOR.pageSelectTag,
      BEHAVIOR.pageAutoText
    ];
    const sup = [
      BEHAVIOR.mouseover,
      BEHAVIOR.mouseout,
      BEHAVIOR.click,
      BEHAVIOR.getVerificationCode,
      BEHAVIOR.download
    ];

    if (tag.attributes.length) {
      // sup.unshift(BEHAVIOR.attr);
    }
    sup.unshift(BEHAVIOR.outerHTML);

    if (tag.innerHTML) {
      nom.unshift(BEHAVIOR.innerText);
      sup.unshift(BEHAVIOR.innerHTML);
    }
    if (tag.parentIsLink) {
      sup.unshift(BEHAVIOR.openLinkBlank);
    }
    if (tag.href && !_.includes(sup, BEHAVIOR.openLinkBlank)) {
      sup.unshift(BEHAVIOR.openLinkBlank);
    }

    return { nom, sup };
  }

  export function a(tag) {
    const actions = any(tag);
    actions.nom.unshift(BEHAVIOR.href);
    // if (!tag.parentIsLink) {
    //     actions.sup.unshift(BEHAVIOR.openLinkBlank);
    // }
    return actions;
  }

  export function input(tag) {
    if (/button|submit/.test(tag.type)) {
      return any(tag);
    }
    return textarea(tag);
  }

  export function select(tag) {
    const actions = any(tag);
    actions.sup.push(BEHAVIOR.select, BEHAVIOR.value);
    return actions;
  }

  export function textarea(tag) {
    const actions = any(tag);
    actions.sup.push(BEHAVIOR.fill, BEHAVIOR.value);
    return actions;
  }

  // 采集图片
  export function img(tag) {
    const actions = any(tag);
    actions.sup.push(BEHAVIOR.base64, BEHAVIOR.imgURL);
    return actions;
  }
}
