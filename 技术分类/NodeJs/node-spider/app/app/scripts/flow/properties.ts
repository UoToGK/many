// Created by uoto on 16/5/3.

/**
 * 关键常量定义
 * 包括正则表达式用来处理模板标签
 * 行为映射表
 * 事件映射表
 * 字段列表
 * 数据额外标记
 * 属性名称
 * 标记名称
 * 超时设置
 */

// 正则表达式
export const REGEXP = {
  igTag: /html|body|iframe/,
  // 判断行为(behavior) 是否为循环
  cycle: /cycle|paging/,

  lastNth: /:nth-child\(\d+\)$/,

  // 判断 是否为抓取动作
  capture: /attr|value|href|HTML|Text|contentList|base64|imgURL|page|download/i,

  cls: /^[\w\-]+$/,

  number: /^\d+$/,

  filterNode: /script|style|video|embed/,

  words: /,|\s+/g
};

// 操作行为映射表
export const BEHAVIOR = {
  attr: "attr",
  href: "href",
  value: "value",
  innerText: "innerText",
  innerHTML: "innerHTML",
  outerHTML: "outerHTML",
  download: "download",
  openLink: "openLink",
  openLinkBlank: "openLinkBlank",
  fill: "fill",
  select: "select",
  click: "click",
  cycle: "cycle",
  paging: "paging",
  customCycle: "customCycle",
  captures: "captures",
  pageUrl: "pageUrl",
  pageTitle: "pageTitle",
  pageContent: "pageContent",
  pageText: "pageText",
  //新加入
  base64: "base64",
  imgURL: "imgURL",
  fixValue: "fixValue",
  contentList: "contentList",
  //新增下拉分页功能
  autoPaging: "autoPaging",
  //获取验证码
  getVerificationCode: "getVerificationCode",
  //新增鼠标mouseenter mouseleave
  mouseover: "mouseover",
  mouseout: "mouseout",
  // add 
  pageSelectTag: "pageSelectTag",
  pageAutoText: "pageAutoText"

};

// 事件映射表
export const EVENTS = {
  srcChange: "src_change",

  // 新创建step时触发
  newStep: "new_step",

  // 代理执行器的事件名称
  executor: "executor",

  // 当节点选中的事件名称
  elementSelect: "element_select"
};

/**
 * 用户可以选择的字段设置
 */
export const COLUMNS = [
  { columnName: `column_${BEHAVIOR.pageUrl}`, columnDesc: "链接" },
  { columnName: `column_${BEHAVIOR.pageTitle}`, columnDesc: "标题" },
  { columnName: `column_${BEHAVIOR.pageContent}`, columnDesc: "内容" },
  { columnName: "column_pageDate", columnDesc: "日期" },

  // //测试综合采集
  // {columnName: `column_${BEHAVIOR.contentList}`, columnDesc: '提取属性列表'},
  //测试图片
  { columnName: `column_${BEHAVIOR.base64}`, columnDesc: "图片base64" },
  //测试图片链接
  { columnName: `column_${BEHAVIOR.imgURL}`, columnDesc: "图片链接" }
];

const _DEFAULT_COLUMNS = [
  { columnName: `column_${BEHAVIOR.pageUrl}`, columnDesc: "链接" },
  { columnName: `column_${BEHAVIOR.pageTitle}`, columnDesc: "标题" },
  { columnName: `column_${BEHAVIOR.pageContent}`, columnDesc: "内容" },
  { columnName: `column_media`, columnDesc: "文章来源" },
  { columnName: "column_pageDate", columnDesc: "文章日期" }
];

export function getColumnByBehavior(behavior) {
  switch (behavior) {
    case BEHAVIOR.pageUrl:
      return _DEFAULT_COLUMNS[0];
    case BEHAVIOR.pageTitle:
      return _DEFAULT_COLUMNS[1];
    case BEHAVIOR.pageContent:
      return _DEFAULT_COLUMNS[2];
  }
}

/**
 * 数据额外标记
 * 用户无法选择，采集时程序自动生成
 */
export const CAPTURE_MARK = {
  captureTime: "captureTime", // 采集时间
  parentUrl: "parentUrl", // 父页面url
  pagePreview: "pagePreview", // 页面快照
  keys: "keys" // 采集关键字
};

// 属性名
export const ATTRS = {
  // 鼠标滑过节点时的样式
  hover: "iris-hover",

  // 当循环的节点被选中时的样式
  cycle: "iris-cycle",

  // 存在动作的样式
  behavior: "iris-behavior",

  // 分页
  paging: "iris-paging",

  autoPaging: "iris-autoPaging"
};

// 标记
export const MARK = {
  /**
   * 获取此元素的父path
   * 规则：当前对像css选择器-》当前对像元素选择器-》父对像选择器
   * @see mark_parent_path
   */
  parentPath: "mark_parent_path",
  /**
   * 获取此元素的循环path
   * @see mark-cycle-path
   */
  cyclePath: "mark_cycle_path",

  /**
   * 调用此事件,将选中当前节点的兄弟节点作为循环队列
   * @see mark-cycleSelect
   */
  cycleSelect: "mark_select",

  /**
   * 调用此事件,将当前选中的循环队列扩大范围
   * @see mark-cycleExpand
   */
  cycleExpand: "mark_expand",

  /**
   * 调用此事件,重置循环队列
   * @see mark-cycleReset
   */
  cycleReset: "mark_reset",

  /**
   * 普通行为标记
   * @see mark-defaults
   */
  defaults: "mark_defaults",

  /**
   * 分页组件
   * @see mark-paging
   */
  paging: "mark_paging",

  autoPaging: "mark_autoPaging",

  getVerificationCode: "mark_getVerificationCode",

  /**
   * @see mark-paging-path
   */
  paging_path: "mark_paging_path",

  /**
   * 抓取行为标记
   * @see mark-captures
   */
  captures: "mark_captures",

  /**
   * 获取全部css路径
   * @see mark-paths
   */
  paths: "mark_paths",

  /**
   * 取消标记
   * @see mark-cancel
   */
  cancel: "mark_cancel",

  /**
   * 获取标记
   * @see select-options
   */
  select_options: "mark_select_options"
};

// 打开链接超时
export const OPEN_LINK_TIMEOUT = 120 * 1000;

// 命令执行器超时
export const EXECUTOR_TIMEOUT = 35 * 1000;

export const MARK_AUTOPAGING_EXECUTOR_TIMEOUT = 2 * 60 * 1000;
export const selectorFind = " > ";
export const frameFind = " >> ";

export default {
  OPEN_LINK_TIMEOUT,
  EXECUTOR_TIMEOUT,
  selectorFind,
  frameFind,
  REGEXP,
  BEHAVIOR,
  EVENTS,
  CAPTURE_MARK,
  COLUMNS,
  ATTRS,
  MARK
};
