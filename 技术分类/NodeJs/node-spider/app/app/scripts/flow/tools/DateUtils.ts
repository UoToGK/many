import * as _ from "lodash";//4月6日修改bug electron升级
const moment = require("moment");

/**
 * 计算相对时间的转换
 * @param dataString
 */
export function calcRelativeTime(dataString) {
    try {
        let m = moment();
        m['replace'] = true;
        if (dataString.includes('秒前')) {
            let match = dataString.match(/(\d+)\s?秒前/);
            if (match) {
                m.seconds(m.second() - match[1]);
                return m;
            }
        }
        if (dataString.includes('分钟前')) {
            let match = dataString.match(/(\d+)\s?分钟前/);
            if (match) {
                m.minutes(m.minutes() - match[1]);
                return m;
            }
        } else if (dataString.includes('小时前')) {
            let match = dataString.match(/(\d+)\s?小时前/);
            if (match) {
                m.hours(m.hours() - match[1]);
                return m;
            }
        } else if (dataString.includes('天前')) {
            let match = dataString.match(/(\d+)\s?天前/);
            if (match) {
                m.dayOfYear(m.dayOfYear() - match[1]);
                return m;
            }
        } else if (dataString.includes('今天') ||dataString.includes('今日')) {
            //不处理  今天 13:01，将有后续处理
            let match = dataString.match(/今天\s?(\d+)/)||dataString.match(/今日\s?(\d+)/);
            if (match) {
               return false;
            }
            return m;
        }
    } catch (e) {
        console.debug("时间转换出错", e);
    }
    return false;
}

/**
 * 按给定的时间格式进行转换 ，以下双占位符在非严格模式下与单占位符相同
 * @param dataString
 * @param strict
 */
export function transform(dataString, strict) {
    strict = strict || false;
    //计算相对时间（优先）
    let momentObj = calcRelativeTime(dataString);
    if (momentObj) return momentObj;
    //计算时间格式
    momentObj = moment(dataString, [
        "YYYY-MM-DD HH:mm:ss",
        "YYYY-MM-DD HH:mm",
        "YYYY-MM-DD",

        "YY-MM-DD HH:mm:ss",
        "YY-MM-DD HH:mm",
        "YY-MM-DD",

        "MM-DD HH:mm:ss",
        "MM-DD HH:mm",
        "MM-DD",

        "YYYY/MM/DD HH:mm:ss",
        "YYYY/MM/DD HH:mm",
        "YYYY/MM/DD",

        "YY/MM/DD HH:mm:ss",
        "YY/MM/DD HH:mm",
        "YY/MM/DD",

        "MM/DD HH:mm:ss",
        "MM/DD HH:mm",
        "MM/DD",

        "YYYY年MM月DD日 HH:mm:ss",
        "YYYY年MM月DD日 HH:mm",
        "YYYY年MM月DD日",

        "YY年MM月DD日 HH:mm:ss",
        "YY年MM月DD日 HH:mm",
        "YY年MM月DD日",

        "YYYY年MM月DD号 HH:mm:ss",
        "YYYY年MM月DD号 HH:mm",
        "YYYY年MM月DD号",

        "YY年MM月DD号 HH:mm:ss",
        "YY年MM月DD号 HH:mm",
        "YY年MM月DD号",

        "HH:mm:ss",
        "HH:mm",

        'L', /* 09/04/1986 */  'l', /* 9/4/1986 */
        'LTS' /* 8:30:25 PM */, 'LT'/* 8:39 PM */, 'HH:mm', 'H:m'
    ], strict);
    return momentObj;
}

/**
 * 测试日期格式是否可以下午正常转换
 * @param dataString
 * @param strict
 */
export function dateIsValid(dataString, strict) {
    let momentObj = transform(dataString, strict);
    return momentObj.isValid();
}

/**
 * 提取格式正确的日期，并转换为统一格式
 * @param dataString
 * @param strict
 */
export function dateExtract(dataString, strict) {
    let momentObj = transform(dataString, strict);
    return momentObj.format('YYYY-MM-DD HH:mm:ss');
}

/**
 * 尝试提取格式正确的日期，格式不正确返回原始的字符串
 * @param dataString
 * @param strict
 */
export function tryDateExtract(dataString, strict) {
    let momentObj = transform(dataString, strict);
    if(momentObj.isValid()){
        return momentObj.format('YYYY-MM-DD HH:mm:ss');
    }else{
        return dataString;
    }
}

