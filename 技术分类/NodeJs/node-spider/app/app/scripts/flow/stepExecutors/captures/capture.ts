// Created by baihuibo on 16/4/15.
import { ipcRenderer } from "electron";
import { getElementByPaths, setParentLocals } from "../../tools/dom";
import { nodeCapture } from "./node-capture";
import { sysCapture } from "./sys-variable";
import { REGEXP } from "../../properties";
import { CtoH } from "../../../base/util";
import * as _ from "lodash"; //4月6日修改bug electron升级
import moment = require("moment");
import * as dateUtils from "../../tools/DateUtils";

export async function captures(step: ICaptureStep, locals, resolve, reject) {
  var result = {};

  await setParentLocals(locals);

  for (let i = 0; i < step.captures.length; i++) {
    try {
      let capture: ICapture = step.captures[i];
      let el, exec: Function;
      //李广彬：新加入固定值的功能
      locals.capture = capture;

      if (/page/.test(capture.behavior)) {
        el = document;
      } else if (capture.selector) {
        el = await getElementByPaths(
          capture.paths,
          locals,
          capture.selector,
          true
        );

        if (el && el.length === 1) {
          el = el[0];
        }
      } else {
        el = null;
      }
      exec = nodeCapture[capture.behavior] || sysCapture[capture.behavior];
      if (exec) {
        let value = await exec(el, capture, result, locals)
        if (capture.match && capture.match.type != "3") {
          if (!matchValid(value, capture, result)) {
            return callback(false, resolve);
          }
        }
        if (capture.isTransitionGprs) {
          locals.val = value;
          let jsonValue: KvObj = await nodeCapture.getGprs(
            el,
            capture,
            result,
            locals
          );
          if (jsonValue.status == 0) {
            result[capture.columnName + "_lat"] = jsonValue.result.location.lat;
            result[capture.columnName + "_lng"] = jsonValue.result.location.lng;
            result[capture.columnName + "_level"] = jsonValue.result.level;
          }
        }

        if (result[capture.columnName]) {
          if (_.isArray(value)) {
            //合并数组
            result[capture.columnName] = _.concat(
              result[capture.columnName],
              value
            );
          } else {
            //字符串合并
            result[capture.columnName] = result[capture.columnName] + value;
          }
        } else {
          result[capture.columnName] = value;
        }

        //console.debug('[capture] result', result);
      }
    } catch (e) {
      console.debug("[capture] error", String(e.stack || e));
    }
  }

  callback(result, resolve);
}

function matchValid(value, capture: ICapture, data) {
  let { match, columnName } = capture;
  let type = +match.type;
  switch (type) {
    case 0: // 时间匹配
      value = String(CtoH(value))
        .trim()
        .replace(/\s+/g, " ");
      let val = getDate(dateMatch(/(\d+)\s?天前/, value), value);
      if (val.isValid()) {
        let myDate = getMyDate(match);

        var ifMatch = function ifMatch() {
          if (!match.dateEq) {
            match.dateEq = "=";
          }
          switch (match.dateEq.trim()) {
            case "=":
              return myDate.isSame(val, "day"); // 等于同一天
            case "<": // 目标是选定日期前
              return val.isBefore(myDate, "mm");
            case ">": // 目标是选定日期之后
              return val.isAfter(myDate, "mm");
          }
        };

        if (!ifMatch()) {
          return false;
        }
        if (val["replace"] || match.dateReplace) {
          // 这里生成新处理后的字段
          if (val.hours() === 0 && val.minutes() === 1) {
            val.minutes(0);
          }
          data[columnName] = val.format("YYYY-MM-DD HH:mm");
        }
      } else {
        console.debug("[matchValid.date.invalid]", value);
      }
      break;
    case 1:
      let words, res;
      if (match.include) {
        words = String(match.include).split(REGEXP.words);
        res = [];
        words.forEach(word => {
          if (value.includes(word)) {
            res.push(word);
          }
        });
        if (!res.length) {
          return false;
        }
        data[`${columnName}_include_keys`] = res.join(",");
      }
      if (match.noInclude) {
        words = String(match.noInclude).split(REGEXP.words);
        res = words.some(word => !value.includes(word));
        if (!res) {
          return false;
        }
      }
      break;
    case 2:
      if (match.regexpText) {
        let reg = new RegExp(
          match.regexpText,
          (match.regexpMode || []).join("")
        );
        let test = reg.test(value);
        let match_new = value.match(reg);
        if (!test) {
          return false;
        }
        if (match_new && match_new.length) {
          if (match_new.length > 1) {
            match_new.slice(1).forEach((str, idx) => {
              data[`${columnName}_reg_match${idx}`] = str;
            });
          } else {
            data[`${columnName}_reg_match`] = match[0];
          }
        }
      }
      break;
  }
  return true;
}

// 处理设置的时间
function getMyDate(match) {
  let date = moment();
  if (match.dateLike && match.dateLike != "date") {
    if (match.dateLike != "today") {
      // 多少天前
      // 1_days , 1_weeks , 1_years ...
      let res = match.dateLike.match(/(\d+)_(\w+)/);
      date.subtract(+res[1], res[2]);
    }
  } else if (match.date) {
    // 指定日期
    date = moment(new Date(match.date));
  }

  date.minutes(0);
  date.hours(0);
  return date;
}

// 匹配目标时间
function getDate(date, value) {
  if (date) {
    date["replace"] = true;
    return date;
  }

  let m = moment();
  m = dateUtils.tryDateExtract(value, false);
  m["replace"] = true;
  if (!m.hours()) {
    m.minutes(1);
  }
  return m;
}

function dateMatch(reg, val) {
  var match = val.match(reg) || [];
  if (match[1]) {
    let m = moment();
    m.date(m.date() - match[1]);
    return m;
  }
  return false;
}

function callback(data, resolve) {
  ipcRenderer.sendToHost(resolve, data);
}
