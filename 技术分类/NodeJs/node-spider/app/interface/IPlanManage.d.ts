//Created by uoto on 16/6/6.

/**
 * 计划
 * @prop id
 * @prop name
 * @prop owner
 * @prop type 定时器类型 (一次:0, 每天:1, 每周:2 , 每月:3)
 * @prop timer 定时器
 * @prop state 当前状态值 (普通状态:0, 正在运行中: 1)
 * @prop startDate 计划开始时间
 * @prop endDate 计划结束时间
 */
export declare interface IPlan {
  id: string;
  name: string;
  userId: string;
  frequencyType: number;
  timer?: Timer;
  state?: number;
  startTime?: any;
  endTime?: any;
  taskIds: string[];
}

/**
 * 定时器
 * @prop bootTime {string[]} 启动时间
 * @prop bootTimeMinute {string} 启动分钟，可选，默认0
 * @prop days {string[]} 天,数组
 * @prop interval {number} 间隔
 * @prop months {string[]} 月份
 * @prop weeks {string[]} 周
 * @prop type {number} 月份类型时,用来表示俩个条件之一( 天:0 , 在:1)
 */
export declare interface Timer {
  bootTime: string[];
  bootTimeMinute: number;
  days: string[];
  interval: number;
  months: string[];
  weeks: string[];
  weekDays: string[];
  type: number;
}
