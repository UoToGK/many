var fs = require("fs");
var moment = require("moment");
export function writeLog2File(msg: string, title = "日志", ...args) {
  msg = JSON.stringify(msg);
  if (!title) title = "日志";
  console.info(
    `${title}: ${moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")}:${msg}`,
    JSON.stringify(args)
  );
  // fs.appendFile(
  //   `${__dirname}\\log\\${moment(Date.now()).format("YYYY-MM-DD")}.log`,
  //   `${title}: ${moment(Date.now()).format(
  //     "YYYY-MM-DD HH:mm:ss"
  //   )}:${JSON.stringify(msg)}---args:${JSON.stringify(args)}` + "\r\n",
  //   function(err) {
  //     if (err) throw err;
  //     console.warn(
  //       `${title}: ${moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")}:${msg}`,
  //       JSON.stringify(args)
  //     );
  //   }
  // );
}
