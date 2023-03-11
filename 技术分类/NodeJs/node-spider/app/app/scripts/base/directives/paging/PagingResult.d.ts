// Created by uoto on 16/3/30.
/**
 * @prop total 数据总数
 * @prop totalPage 总页数
 * @prop current 当前页数
 * @prop limit 限制数据大小
 * @prop data 当前页数据
 */
interface PagingResult {
    total:number
    totalPage:number
    current:number
    limit:number
    data:any[]
}