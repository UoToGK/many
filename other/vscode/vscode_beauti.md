### 给 vscode 增加水印以及二次元看板

## 修改 vscode 安装路径下\resources\app\out\vs\code\electron-sandbox\workbench\workbench.html 文件

代码如下：

```html
<!-- Copyright (C) Microsoft Corporation. All rights reserved. -->
<!-- workbench.html -->
<!-- 安装 Fix VSCode Checksums 插件进行vscode 文件修复，因为修改了内部代码
Ctrl + Shift + P 输入 Fix Checksums: Apply
-->
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta
      http-equiv="Content-Security-Policy"
      content="default-src 'none'; img-src 'self' https: data: blob: vscode-remote-resource:; media-src 'none'; frame-src 'self' vscode-webview: https://*.vscode-webview-test.com; object-src 'self'; script-src * 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' https:; font-src 'self' https: vscode-remote-resource:;"
    />
  </head>
  <style type="text/css">
    #live2dcanvas {
      border: 0 !important;
    }
  </style>

  <body aria-label="">
    <div id="live2d-widget">
      <canvas
        id="live2dcanvas"
        width="100"
        height="200"
        style="position: fixed;width:100px;height:200;opacity: 0.5;right: 0px;bottom: -20px;z-index: 99999;pointer-events: none;border:0;"
      ></canvas>
    </div>
  </body>

  <!-- Init Bootstrap Helpers -->
  <script src="../../../../bootstrap.js"></script>
  <script src="../../../../vs/loader.js"></script>
  <script src="../../../../bootstrap-window.js"></script>

  <!-- Startup via workbench.js -->
  <script src="workbench.js"></script>

  <script
    type="text/javascript"
    charset="utf-8"
    src="https://cdn.jsdelivr.net/npm/live2d-widget@3.0.4/lib/L2Dwidget.0.min.js"
  ></script>
  <script
    type="text/javascript"
    src="https://cdn.jsdelivr.net/npm/live2d-widget@3.0.4/lib/L2Dwidget.min.js?_=1557308476616"
  ></script>
  <script type="text/javascript">
    // L2Dwidget.init();
    /**
	初音：https://unpkg.com/live2d-widget-model-miku@1.0.5/assets/miku.model.json
	黑猫：https://unpkg.com/live2d-widget-model-hijiki@1.0.5/assets/hijiki.model.json
	萌娘：https://unpkg.com/live2d-widget-model-shizuku@1.0.5/assets/shizuku.model.json
	白猫：https://unpkg.com/live2d-widget-model-tororo@1.0.5/assets/tororo.model.json
	狗狗：https://unpkg.com/live2d-widget-model-wanko@1.0.5/assets/wanko.model.json
	小帅哥： https://unpkg.com/live2d-widget-model-chitose@1.0.5/assets/chitose.model.json
	小可爱（护）：https://unpkg.com/live2d-widget-model-z16@1.0.5/assets/z16.model.json
	小可爱（女）：https://unpkg.com/live2d-widget-model-koharu@1.0.5/assets/koharu.model.json
	小可爱（男）：https://unpkg.com/live2d-widget-model-haruto@1.0.5/assets/haruto.model.json
	*/
    L2Dwidget.init({
      model: {
        jsonPath:
          "https://unpkg.com/live2d-widget-model-shizuku@1.0.5/assets/shizuku.model.json",
        scale: 1,
      },
      display: {
        superSample: 2,
        width: 100,
        height: 200,
        position: "right",
        hOffset: 0,
        vOffset: 0,
      },
    });
  </script>
  <script type="text/javascript">
    function watermark(settings) {
      //默认设置
      var defaultSettings = {
        watermark_txt: "text",
        watermark_x: 440, //水印起始位置x轴坐标
        watermark_y: 682, //水印起始位置Y轴坐标
        watermark_rows: 20, //水印行数
        watermark_cols: 20, //水印列数
        watermark_x_space: 100, //水印x轴间隔
        watermark_y_space: 50, //水印y轴间隔
        watermark_color: "#aaa", //水印字体颜色
        watermark_alpha: 0.2, //水印透明度
        watermark_fontsize: "15px", //水印字体大小
        watermark_font: "Source Code Pro", //水印字体
        watermark_width: 210, //水印宽度
        watermark_height: 80, //水印长度
        watermark_angle: 20, //水印倾斜度数
      };
      if (arguments.length === 1 && typeof arguments[0] === "object") {
        var src = arguments[0] || {};
        for (key in src) {
          if (
            src[key] &&
            defaultSettings[key] &&
            src[key] === defaultSettings[key]
          )
            continue;
          else if (src[key]) defaultSettings[key] = src[key];
        }
      }
      var oTemp = document.createDocumentFragment();
      //获取页面最大宽度
      var page_width = Math.max(
        document.body.scrollWidth,
        document.body.clientWidth
      );
      var cutWidth = page_width * 0.015;
      var page_width = page_width - cutWidth;
      //获取页面最大高度
      var page_height =
        Math.max(document.body.scrollHeight, document.body.clientHeight) + 450;
      page_height = Math.max(page_height, window.innerHeight - 30);
      //如果将水印列数设置为0，或水印列数设置过大，超过页面最大宽度，则重新计算水印列数和水印x轴间隔
      if (
        defaultSettings.watermark_cols == 0 ||
        parseInt(
          defaultSettings.watermark_x +
            defaultSettings.watermark_width * defaultSettings.watermark_cols +
            defaultSettings.watermark_x_space *
              (defaultSettings.watermark_cols - 1)
        ) > page_width
      ) {
        defaultSettings.watermark_cols = parseInt(
          (page_width -
            defaultSettings.watermark_x +
            defaultSettings.watermark_x_space) /
            (defaultSettings.watermark_width +
              defaultSettings.watermark_x_space)
        );
        defaultSettings.watermark_x_space = parseInt(
          (page_width -
            defaultSettings.watermark_x -
            defaultSettings.watermark_width * defaultSettings.watermark_cols) /
            (defaultSettings.watermark_cols - 1)
        );
      }
      //如果将水印行数设置为0，或水印行数设置过大，超过页面最大长度，则重新计算水印行数和水印y轴间隔
      if (
        defaultSettings.watermark_rows == 0 ||
        parseInt(
          defaultSettings.watermark_y +
            defaultSettings.watermark_height * defaultSettings.watermark_rows +
            defaultSettings.watermark_y_space *
              (defaultSettings.watermark_rows - 1)
        ) > page_height
      ) {
        defaultSettings.watermark_rows = parseInt(
          (defaultSettings.watermark_y_space +
            page_height -
            defaultSettings.watermark_y) /
            (defaultSettings.watermark_height +
              defaultSettings.watermark_y_space)
        );
        defaultSettings.watermark_y_space = parseInt(
          (page_height -
            defaultSettings.watermark_y -
            defaultSettings.watermark_height * defaultSettings.watermark_rows) /
            (defaultSettings.watermark_rows - 1)
        );
      }
      var x;
      var y;
      for (var i = 0; i < defaultSettings.watermark_rows; i++) {
        y =
          defaultSettings.watermark_y +
          (defaultSettings.watermark_y_space +
            defaultSettings.watermark_height) *
            i;
        for (var j = 0; j < defaultSettings.watermark_cols; j++) {
          x =
            defaultSettings.watermark_x +
            (defaultSettings.watermark_width +
              defaultSettings.watermark_x_space) *
              j;
          var mask_div = document.createElement("div");
          mask_div.id = "mask_div" + i + j;
          mask_div.className = "mask_div";
          mask_div.appendChild(
            document.createTextNode(defaultSettings.watermark_txt)
          );
          //设置水印div倾斜显示
          mask_div.style.webkitTransform =
            "rotate(-" + defaultSettings.watermark_angle + "deg)";
          mask_div.style.MozTransform =
            "rotate(-" + defaultSettings.watermark_angle + "deg)";
          mask_div.style.msTransform =
            "rotate(-" + defaultSettings.watermark_angle + "deg)";
          mask_div.style.OTransform =
            "rotate(-" + defaultSettings.watermark_angle + "deg)";
          mask_div.style.transform =
            "rotate(-" + defaultSettings.watermark_angle + "deg)";
          mask_div.style.visibility = "";
          mask_div.style.position = "absolute";
          mask_div.style.left = x + "px";
          mask_div.style.top = y + "px";
          mask_div.style.overflow = "hidden";
          mask_div.style.zIndex = "9999";
          //让水印不遮挡页面的点击事件
          mask_div.style.pointerEvents = "none";
          mask_div.style.opacity = defaultSettings.watermark_alpha;
          mask_div.style.fontSize = defaultSettings.watermark_fontsize;
          mask_div.style.fontFamily = defaultSettings.watermark_font;
          mask_div.style.color = defaultSettings.watermark_color;
          mask_div.style.textAlign = "center";
          mask_div.style.width = defaultSettings.watermark_width + "px";
          mask_div.style.height = defaultSettings.watermark_height + "px";
          mask_div.style.display = "block";
          oTemp.appendChild(mask_div);
        }
      }
      document.body.appendChild(oTemp);
    }

    function getNow() {
      var d = new Date();
      var year = d.getFullYear();
      var month = change(d.getMonth() + 1);
      var day = change(d.getDate());
      var hour = change(d.getHours());
      var minute = change(d.getMinutes());
      var second = change(d.getSeconds());

      function change(t) {
        if (t < 10) {
          return "0" + t;
        } else {
          return t;
        }
      }
      var time =
        year +
        "年" +
        month +
        "月" +
        day +
        "日 " +
        hour +
        "时" +
        minute +
        "分" +
        second +
        "秒";
      return time;
    }
  </script>

  <script type="text/javascript">
    var now = getNow();
    watermark({ watermark_txt: "xiaobin.zhu" + now });
  </script>
</html>
```