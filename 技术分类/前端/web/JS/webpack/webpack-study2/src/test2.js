var a = process.argv.slice(2)[0] === "test" ? true : false;
a = true;
require("ejs");
console.log(process.argv.slice(2)[0]);
if (a) {
  require("./test1");
} else {
  console.log("bu jia d zai a");
}
console.log("aa a");
