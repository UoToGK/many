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
  //判断是否选取了html|body|iframe
  igTag: /html|body|iframe/,
  // 判断行为(behavior) 是否为循环
  cycle: /cycle|paging/,
  //判断是否是最后一个元素
  lastNth: /:nth-child\(\d+\)$/,

  // 判断 是否为抓取动作
  capture: /attr|value|href|HTML|Text|contentList|base64|imgURL|page|download/i,
  //开头为字符带-的结尾,筛选这种class
  cls: /^[\w\-]+$/,
  /**
   * 变量不能是纯数字，必须是字母、下划线、$开头的，编译器对纯数字的理解就是一个数字,
   * 所以针对id为纯数字的html元素进行特殊处理
   */
  number: /^\d+$/,
  //需要过滤掉的节点
  filterNode: /script|style|video|embed/,
  //单词或者空格
  words: /,|\s+/g
};

// 操作行为映射表
export const BEHAVIOR = {
  attr: 'attr', //抓取属性值
  href: 'href',
  value: 'value',
  innerText: 'innerText',
  innerHTML: 'innerHTML',
  outerHTML: 'outerHTML',
  download: 'download',
  openLink: 'openLink',
  openLinkBlank: 'openLinkBlank',
  fill: 'fill',
  select: 'select',
  click: 'click',
  cycle: 'cycle',
  paging: 'paging',
  customCycle: 'customCycle',
  captures: 'captures',
  pageUrl: 'pageUrl',
  pageTitle: 'pageTitle',
  pageContent: 'pageContent',
  base64: 'base64',
  imgURL: 'imgURL',
  fixValue: 'fixValue',
  contentList: 'contentList',
  autoPaging: 'autoPaging'
};

// 事件映射表
export const EVENTS = {
  srcChange: 'src_change',

  // 新创建step时触发
  newStep: 'new_step',

  // 代理执行器的事件名称
  executor: 'executor',

  // 当节点选中的事件名称
  elementSelect: 'element_select'
};

/**
 * 用户可以选择的字段设置
 */
export const COLUMNS = [
  { columnName: `column_${BEHAVIOR.pageUrl}`, columnDesc: '链接' },
  { columnName: `column_${BEHAVIOR.pageTitle}`, columnDesc: '标题' },
  { columnName: `column_${BEHAVIOR.pageContent}`, columnDesc: '内容' },
  { columnName: 'column_pageDate', columnDesc: '日期' },

  // 测试综合采集
  { columnName: `column_${BEHAVIOR.contentList}`, columnDesc: '提取属性列表' },
  //测试图片
  { columnName: `column_${BEHAVIOR.base64}`, columnDesc: '图片base64' },
  //测试图片链接
  { columnName: `column_${BEHAVIOR.imgURL}`, columnDesc: '图片链接' }
];
//微信公众号采取默认抓取
const _DEFAULT_COLUMNS = [
  { columnName: `column_${BEHAVIOR.pageUrl}`, columnDesc: '链接' },
  { columnName: `column_${BEHAVIOR.pageTitle}`, columnDesc: '标题' },
  { columnName: `column_${BEHAVIOR.pageContent}`, columnDesc: '内容' },
  { columnName: `column_media`, columnDesc: '文章来源' },
  { columnName: 'column_pageDate', columnDesc: '文章日期' }
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
 * 用户无需选择，采集时程序自动生成
 */
export const CAPTURE_MARK = {
  captureTime: 'captureTime', // 采集时间
  parentUrl: 'parentUrl', // 父页面url
  pagePreview: 'pagePreview', // 页面快照
  keys: 'keys' // 采集关键字
};

// 属性名
export const ATTRS = {
  // 鼠标滑过节点时的样式
  hover: 'ES-hover',

  // 当循环的节点被选中时的样式
  cycle: 'ES-cycle',

  // 存在动作的样式
  behavior: 'ES-behavior',

  // 分页
  paging: 'ES-paging',

  autoPaging: 'ES-autoPaging'
};

// 标记
export const MARK = {
  /**
   * 获取此元素的父path
   * 规则：当前对象css选择器-》当前对象元素选择器-》父对象选择器
   * @see mark_parent_path
   */
  parentPath: 'mark_parent_path',
  /**
   * 获取此元素的循环path
   * @see mark-cycle-path
   */
  cyclePath: 'mark_cycle_path',

  /**
   * 调用此事件,将选中当前节点的兄弟节点作为循环队列
   * @see mark-cycleSelect
   */
  cycleSelect: 'mark_select',

  /**
   * 调用此事件,将当前选中的循环队列扩大范围
   * @see mark-cycleExpand
   */
  cycleExpand: 'mark_expand',

  /**
   * 调用此事件,重置循环队列
   * @see mark-cycleReset
   */
  cycleReset: 'mark_reset',

  /**
   * 普通行为标记
   * @see mark-defaults
   */
  defaults: 'mark_defaults',

  /**
   * 分页组件
   * @see mark-paging
   */
  paging: 'mark_paging',
  /**
   * 下拉
   */
  autpPaging: 'mark_autoPaging',

  /** 分页路径
   * @see mark-paging-path
   */
  paging_path: 'mark_paging_path',

  /**
   * 抓取行为标记
   * @see mark-captures
   */
  captures: 'mark_captures',

  /**
   * 获取全部css路径
   * @see mark-paths
   */
  paths: 'mark_paths',

  /**
   * 取消标记
   * @see mark-cancel
   */
  cancel: 'mark_cancel',

  /**
   * 获取标记
   * @see select-options
   */
  select_options: 'mark_select_options'
};

// 打开链接超时
export const OPEN_LINK_TIMEOUT = 120 * 1000;

// 命令执行器超时
export const EXECUTOR_TIMEOUT = 35 * 1000;
// 元素选择器
export const selectorFind = ' > ';
//iframe路径用` >> `来分隔
export const frameFind = ' >> ';

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
