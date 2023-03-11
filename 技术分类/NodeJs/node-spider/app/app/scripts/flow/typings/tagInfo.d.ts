// Created by uoto on 16/4/22.
/**
 * 元素节点的信息
 * 用来在ipc通信接口中传递
 * 这里只取部分即可,毕竟用来判断的信息,这些足够了
 *
 * @prop {string} id
 * @prop {string} localName 小写节点名称
 * @prop {string} tagName 大写节点名称
 * @prop {string} nodeName 大写节点名称
 * @prop {number} nodeType 节点类型,一般为1
 * @prop {string} type 表单元素的类型
 * @prop {string} href 链接地址
 * @prop {string} value 表单元素的值
 * @prop {string} innerText
 * @prop {string} innerHTML
 * @prop {string} outerHTML
 * @prop {TagAttr[]} attributes 元素的属性列表
 * @prop {path[]} path 事件触发路径
 * @prop {string} selector 元素的属性列表
 */
declare interface TagInfo {
    id?: string
    localName: string
    tagName: string
    nodeName: string
    nodeType: number
    type?: string
    value?: string
    parentIsLink?: boolean
    innerText: string
    innerHTML: string
    outerHTML: string
    href?: string
    attributes: TagAttr[]
    selector?: string
}

/**
 * 属性节点
 * @prop {string} name
 * @prop {string} value
 */
declare interface TagAttr {
    name: string
    value: string
    type: 'attr'
}