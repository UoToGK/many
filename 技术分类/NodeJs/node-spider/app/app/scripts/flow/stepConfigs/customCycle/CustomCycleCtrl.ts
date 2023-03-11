//Created by uoto on 16/5/31.
import { Controller } from "../../../base/annotations";
import { batchLinkDialog } from "./component/batchLinkDialog";
import moment = require("moment");
import * as _ from "lodash";
@Controller
export class StepCustomCycleCtrl {
  public step: ICustomCycleStep;

  constructor(
    public flow: IFlow,
    public $timeout,
    public $mdDialog,
    $mdConstant
  ) {
    this.step = <ICustomCycleStep>flow.currentStep;

    if (this.step.data) {
      this.step.data = _.uniq(this.step.data);
      this.change();
    }
  }

  paste(e) {
    this.$timeout(() => {
      if (e.target.value && e.target.value.trim()) {
        let words = e.target.value.trim().split(";");
        words.forEach(word => {
          if (word && !this.step.data.includes(word)) {
            this.step.data.push(word);
          }
        });
        e.target.value = "";
      }
      this.change();
    }, 1);
  }

  add(chip) {
    if (!chip) {
      this.step.data.pop();
    }
  }

  change() {
    this.flow.locals["$0"] = this.step.data[0] || "";
  }

  bLink = {
    linkName: "",
    datas: []
  };
  async batchLink() {
    try {
      let res = await batchLinkDialog({
        $mdDialog: this.$mdDialog,
        batchLink: this.bLink
      });

      if (res === false) {
        return;
      } else {
        let link = res.linkName;
        let exceptLetter = [91, 92, 93, 94, 95, 96];
        if (res.datas.length > 0) {
          let urls_tem = [];
          res.datas.forEach((item, index) => {
            let _index = index + 1;
            let str = "[地址参数" + _index + "]";
            let urls_map = [];
            switch (item.type) {
              case 0:
                let numData = item.numData;
                let endNum =
                  parseInt(numData.startNum) +
                  (parseInt(numData.increment) * parseInt(numData.count) - 1);

                if (urls_tem.length == 0) {
                  for (let i = 0; i < numData.count; i++) {
                    if (item.numData.addZero) {
                      urls_tem.push(
                        link.replace(
                          str,
                          this.addPreZero(
                            parseInt(numData.startNum) +
                            i * parseInt(numData.increment),
                            endNum
                          )
                        )
                      );
                    } else {
                      urls_tem.push(
                        link.replace(
                          str,
                          parseInt(numData.startNum) +
                          i * parseInt(numData.increment)
                        )
                      );
                    }
                  }
                } else {
                  urls_tem.forEach(url => {
                    for (let i = 0; i < numData.count; i++) {
                      let nd =
                        parseInt(numData.startNum) +
                        i * parseInt(numData.increment);
                      if (item.numData.addZero) {
                        urls_map.push(
                          url.replace(
                            str,
                            this.addPreZero(numData.startNum, endNum)
                          )
                        );
                      } else {
                        urls_map.push(url.replace(str, nd));
                      }
                    }
                  });
                  urls_tem = [];
                  urls_tem = urls_map.map(url => url);
                }
                break;
              case 1:
                let startLetter = item.letterData.startLetter.charCodeAt();
                let endLetter = item.letterData.endLetter.charCodeAt();
                if (urls_tem.length == 0) {
                  if (startLetter > endLetter) {
                    for (let i = startLetter; i >= endLetter; i--) {
                      if ((i >= 65 && i <= 90) || (i >= 97 && i <= 122)) {
                        urls_tem.push(
                          link.replace(str, String.fromCharCode(i))
                        );
                      }
                    }
                  } else {
                    for (let i = startLetter; i <= endLetter; i++) {
                      if ((i >= 65 && i <= 90) || (i >= 97 && i <= 122)) {
                        urls_tem.push(
                          link.replace(str, String.fromCharCode(i))
                        );
                      }
                    }
                  }
                } else {
                  urls_tem.forEach(url => {
                    if (startLetter > endLetter) {
                      for (let i = startLetter; i >= endLetter; i--) {
                        if ((i >= 65 && i <= 90) || (i >= 97 && i <= 122)) {
                          urls_map.push(
                            url.replace(str, String.fromCharCode(i))
                          );
                        }
                      }
                    } else {
                      for (let i = startLetter; i <= endLetter; i++) {
                        if ((i >= 65 && i <= 90) || (i >= 97 && i <= 122)) {
                          urls_map.push(
                            url.replace(str, String.fromCharCode(i))
                          );
                        }
                      }
                    }
                  });
                  urls_tem = [];
                  urls_tem = urls_map.map(url => url);
                }
                break;
              case 2:
                let startTime = moment(item.timeData.startTime);
                let endTime = moment(item.timeData.endTime);
                let du = moment.duration(Number(endTime) - Number(startTime), "ms").days();
                if (urls_tem.length == 0) {
                  for (let i = 0; i <= du / item.timeData.increment; i++) {
                    let t = "";
                    if (i == 0) {
                      t = startTime.format(item.timeData.formatStr);
                    } else {
                      t = startTime
                        .add(item.timeData.increment, "days")
                        .format(item.timeData.formatStr);
                    }
                    urls_tem.push(link.replace(str, t));
                  }
                } else {
                  urls_tem.forEach(url => {
                    let st = moment(item.timeData.startTime);
                    for (let i = 0; i <= du / item.timeData.increment; i++) {
                      let t = "";
                      if (i == 0) {
                        t = st.format(item.timeData.formatStr);
                      } else {
                        t = st
                          .add(item.timeData.increment, "days")
                          .format(item.timeData.formatStr);
                      }
                      urls_map.push(url.replace(str, t));
                    }
                  });
                  urls_tem = [];
                  urls_tem = urls_map.map(url => url);
                }
                break;
            }
          });
          this.$timeout(() => {
            this.step.data = urls_tem.map(url => url);
            this.change();
          }, 1);
        }
      }
    } catch (e) {
      console.error("[batchLink]", e);
    }
  }
  clearBatchLink() {
    this.step.data.length = 0;
    this.change();
  }

  addPreZero(num, endNum) {
    let t = endNum.toString().length;
    let s = num.toString().length;
    let str = "";
    for (var i = 0; i < t - s; i++) {
      str += "0";
    }

    return str + num;
  }
  // readPath(path) {
  //   var fs = require("fs");
  //   fs.readFile(
  //     "C:\\Users\\ex-zhuxiaobin001\\Downloads\\今日头条_20190416161152",
  //     (err, res) => {
  //       err && console.error(err);
  //       console.log(res);
  //     }
  //   );
  // }
}
