/**
 * Created by zhuxiaobin
 */
var packager = require("electron-packager");
var os = require("os");
var args = process.argv.slice(2)[0];
var platform = args || os.platform();
let packObj = {
  arch: "x64", //ia32 , x64 , all
  platform: platform, //linux , win32 , darwin , all
  dir: ".",
  asar: false,
  icon: "",
  ignore: /(\.idea|output|examples|tests|\.svn|\.git|\.DS_Store|\.iml|\.mthml)/i,
  name: "iris-v3",
  out: "E:\\zxb\\iris-v3",
  overwrite: true,
  version: "1.3.1"
};

packager(packObj, function done(err, appPaths) {
  if (err) {
    if (err.message) console.error(err.message);
    else console.error(err, err.stack);
    process.exit(1);
  }

  if (appPaths.length > 1)
    console.error("Wrote new apps to:\n" + appPaths.join("\n"));
  else if (appPaths.length === 1)
    console.error("Wrote new app to", appPaths[0]);
  console.log("appPath : ", appPaths);
});
