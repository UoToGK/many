let entryUrl =
  "https://www.wanyiwang.com/search/%E5%B9%B3%E5%AE%89%E7%A6%8F19/0/1.html";
let userName = "margin";
let password = "pingan";
const request = require("request");

var officegen = require("officegen"); //安装office插件，支持导出word、excel、ppt [参考](http://www.myexception.cn/javascript/1898036.html)
const fs = require("fs");
const download = require("download");
var fileUrl =
  "http://download.wanyiwang.com/2019/07/08/fk平安福19Ⅱ组合理念特色36页.pptx";
// console.log(encodeURI(fileUrl))
// download(encodeURI(fileUrl)).then(data => {
//     // fs.writeFileSync('dist/foo.pptx', data);
//     console.log()
// });

let pptx = officegen("pptx");

// Officegen calling this function after finishing to generate the pptx document:
pptx.on("finalize", function (written) {
  console.log("Finish to create a Microsoft PowerPoint document.");
});

// Officegen calling this function to report errors:
pptx.on("error", function (err) {
  console.log(err);
});

// Let's add a title slide:

let slide = pptx.makeTitleSlide(
  "Officegen",
  "Example to a PowerPoint document"
);

// Pie chart slide example:

slide = pptx.makeNewSlide();
slide.name = "Pie Chart slide";
slide.back = "ffff00";
slide.addChart({
  title: "My production",
  renderType: "pie",
  data: [
    {
      name: "Oil",
      labels: [
        "Czech Republic",
        "Ireland",
        "Germany",
        "Australia",
        "Austria",
        "UK",
        "Belgium",
      ],
      values: [301, 201, 165, 139, 128, 99, 60],
      colors: [
        "ff0000",
        "00ff00",
        "0000ff",
        "ffff00",
        "ff00ff",
        "00ffff",
        "000000",
      ],
    },
  ],
});

// Let's generate the PowerPoint document into a file:
/**
 * [saveFileWithStream description]
 * @param {String} filePath [文件路径]
 * @param {Buffer} readData [Buffer 数据]
 */
function saveFile(filePath, fileData) {
  return new Promise((resolve, reject) => {
    // 块方式写入文件
    const wstream = fs.createWriteStream(filePath);

    wstream.on("open", () => {
      const blockSize = 128;
      const nbBlocks = Math.ceil(fileData.length / blockSize);
      for (let i = 0; i < nbBlocks; i += 1) {
        const currentBlock = fileData.slice(
          blockSize * i,
          Math.min(blockSize * (i + 1), fileData.length)
        );
        wstream.write(currentBlock);
      }

      wstream.end();
    });
    wstream.on("error", (err) => {
      reject(err);
    });
    wstream.on("finish", () => {
      resolve(true);
    });
  });
}
var path = __dirname + "example.pptx";
// if (!fs.existsSync(path)) {
//     fs.mkdirSync(path);
// }
let out = fs.createWriteStream(path, {
  encoding: "utf-8",
});

out.on("error", function (err) {
  console.log(err);
});

// Async call to generate the output file:
pptx.generate(out);
