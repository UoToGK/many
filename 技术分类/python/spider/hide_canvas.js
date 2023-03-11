

/*
 * @Author: xiaobin.zhu
 * @since: 2022-11-18 11:26:29
 * @LastAuthor: xiaobin.zhu
 * @LastEditTime: 2022-11-18 14:01:26
 * @Description: write something        
 * @FilePath: hide_canvas
 * @Copyright(c): 企知道-数据采集部
 */
// js文件头部注释之后的内容
function random(list) {
    let min = 0;
    let max = list.length
    return list[Math.floor(Math.random() * (max - min)) + min];
}
let ctxArr = [];
let ctxInf = [];

let rsalt = random([...Array(7).keys()].map(a => a - 3))
let gsalt = random([...Array(7).keys()].map(a => a - 3))
let bsalt = random([...Array(7).keys()].map(a => a - 3))
let asalt = random([...Array(7).keys()].map(a => a - 3))

const rawGetImageData = CanvasRenderingContext2D.prototype.getImageData;

let noisify = function (canvas, context) {
    let ctxIdx = ctxArr.indexOf(context);
    let info = ctxInf[ctxIdx];
    const width = canvas.width, height = canvas.height;
    const imageData = rawGetImageData.apply(context, [0, 0, width, height]);
    if (info.useArc || info.useFillText) {
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                const n = ((i * (width * 4)) + (j * 4));
                imageData.data[n + 0] = imageData.data[n + 0] + rsalt;
                imageData.data[n + 1] = imageData.data[n + 1] + gsalt;
                imageData.data[n + 2] = imageData.data[n + 2] + bsalt;
                imageData.data[n + 3] = imageData.data[n + 3] + asalt;
            }
        }
    }
    context.putImageData(imageData, 0, 0);
};



(function mockGetContext() {
    let rawGetContext = HTMLCanvasElement.prototype.getContext

    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
        "value": function () {
            let result = rawGetContext.apply(this, arguments);
            if (arguments[0] === '2d') {
                ctxArr.push(result)
                ctxInf.push({})
            }
            return result;
        }
    });

    Object.defineProperty(HTMLCanvasElement.prototype.getContext, "length", {
        "value": 1
    });

    Object.defineProperty(HTMLCanvasElement.prototype.getContext, "toString", {
        "value": () => "function getContext() { [native code] }"
    });

    Object.defineProperty(CanvasRenderingContext2D.prototype.getContext, "name", {
        "value": "getContext"
    });
})();

(function mockArc() {
    let rawArc = CanvasRenderingContext2D.prototype.arc
    Object.defineProperty(CanvasRenderingContext2D.prototype, "arc", {
        "value": function () {
            let ctxIdx = ctxArr.indexOf(this);
            ctxInf[ctxIdx].useArc = true;
            return rawArc.apply(this, arguments);
        }
    });

    Object.defineProperty(CanvasRenderingContext2D.prototype.arc, "length", {
        "value": 5
    });

    Object.defineProperty(CanvasRenderingContext2D.prototype.arc, "toString", {
        "value": () => "function arc() { [native code] }"
    });

    Object.defineProperty(CanvasRenderingContext2D.prototype.arc, "name", {
        "value": "arc"
    });
})();

(function mockFillText() {
    const rawFillText = CanvasRenderingContext2D.prototype.fillText;
    Object.defineProperty(CanvasRenderingContext2D.prototype, "fillText", {
        "value": function () {
            let ctxIdx = ctxArr.indexOf(this);
            ctxInf[ctxIdx].useFillText = true;
            return rawFillText.apply(this, arguments);
        }
    });

    Object.defineProperty(CanvasRenderingContext2D.prototype.fillText, "length", {
        "value": 4
    });

    Object.defineProperty(CanvasRenderingContext2D.prototype.fillText, "toString", {
        "value": () => "function fillText() { [native code] }"
    });

    Object.defineProperty(CanvasRenderingContext2D.prototype.fillText, "name", {
        "value": "fillText"
    });
})();


(function mockToBlob() {
    const toBlob = HTMLCanvasElement.prototype.toBlob;

    Object.defineProperty(HTMLCanvasElement.prototype, "toBlob", {
        "value": function () {
            noisify(this, this.getContext("2d"));
            return toBlob.apply(this, arguments);
        }
    });

    Object.defineProperty(HTMLCanvasElement.prototype.toBlob, "length", {
        "value": 1
    });

    Object.defineProperty(HTMLCanvasElement.prototype.toBlob, "toString", {
        "value": () => "function toBlob() { [native code] }"
    });

    Object.defineProperty(HTMLCanvasElement.prototype.toBlob, "name", {
        "value": "toBlob"
    });
})();

(function mockToDataURL() {
    const toDataURL = HTMLCanvasElement.prototype.toDataURL;
    Object.defineProperty(HTMLCanvasElement.prototype, "toDataURL", {
        "value": function () {
            noisify(this, this.getContext("2d"));
            return toDataURL.apply(this, arguments);
        }
    });

    Object.defineProperty(HTMLCanvasElement.prototype.toDataURL, "length", {
        "value": 0
    });

    Object.defineProperty(HTMLCanvasElement.prototype.toDataURL, "toString", {
        "value": () => "function toDataURL() { [native code] }"
    });

    Object.defineProperty(HTMLCanvasElement.prototype.toDataURL, "name", {
        "value": "toDataURL"
    });
})();


(function mockGetImageData() {
    Object.defineProperty(CanvasRenderingContext2D.prototype, "getImageData", {
        "value": function () {
            noisify(this.canvas, this);
            return rawGetImageData.apply(this, arguments);
        }
    });

    Object.defineProperty(CanvasRenderingContext2D.prototype.getImageData, "length", {
        "value": 4
    });

    Object.defineProperty(CanvasRenderingContext2D.prototype.getImageData, "toString", {
        "value": () => "function getImageData() { [native code] }"
    });

    Object.defineProperty(CanvasRenderingContext2D.prototype.getImageData, "name", {
        "value": "getImageData"
    });
})();

// 前端对应检测
CanvasRenderingContext2D.prototype.getImageData.length !== 4
    || !CanvasRenderingContext2D.prototype.getImageData.toString().match(/^\s*function getImageData\s*\(\)\s*\{\s*\[native code\]\s*\}\s*$/)
    || (CanvasRenderingContext2D.prototype.getImageData.name !== "getImageData" && !ie)


function cKnownPixels(size) {
    "use strict";
    /**
     * 输入一个已知的稳定像素图（由于不存在字体、复杂计算等，因此不同机器的渲染几乎不会有差异），如果输出的结果和已知输入不一样，那肯定是人为加了噪点。
     */
    var canvas = document.createElement("canvas");
    canvas.height = size;
    canvas.width = size;
    var context = canvas.getContext("2d");
    if (!context)
        return false;

    context.fillStyle = "rgba(0, 127, 255, 1)";
    var pixelValues = [0, 127, 255, 255];
    context.fillRect(0, 0, canvas.width, canvas.height);
    var p = context.getImageData(0, 0, canvas.width, canvas.height).data;
    for (var i = 0; i < p.length; i += 1) {
        if (p[i] !== pixelValues[i % 4]) {
            return false;
        }
    }
    return true;
}

function cReadOut() {

    "use strict";
    /**将同一份像素点连续输出两次，如果这两次的结果不一样，那肯定是加了某些随机的噪点。 */
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");

    if (!context)
        return false;

    var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imageData.data.length; i += 1) {
        if (i % 4 !== 3) {
            imageData.data[i] = Math.floor(256 * Math.random());
        } else {
            imageData.data[i] = 255;
        }
    }
    context.putImageData(imageData, 0, 0);

    var imageData1 = context.getImageData(0, 0, canvas.width, canvas.height);
    var imageData2 = context.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imageData2.data.length; i += 1) {
        if (imageData1.data[i] !== imageData2.data[i]) {
            return false;
        }
    }
    return true;
}


function cDoubleReadOut() {

    "use strict";
    /**
     * 和上面的检测挺像，但是检测出来的结果比较trick，没太搞懂这是检测的啥，不过实践中发现如果 a 通道随机到的噪点偏移值不太好，很容易检测不通过
     */
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");

    if (!context)
        return false;

    var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imageData.data.length; i += 1) {
        if (i % 4 !== 3) {
            imageData.data[i] = Math.floor(256 * Math.random());
        } else {
            imageData.data[i] = 255;
        }
    }

    var imageData1 = context.getImageData(0, 0, canvas.width, canvas.height);

    var canvas2 = document.createElement("canvas");
    var context2 = canvas2.getContext("2d");
    context2.putImageData(imageData1, 0, 0);
    var imageData2 = context2.getImageData(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < imageData2.data.length; i += 1) {
        if (imageData1.data[i] !== imageData2.data[i]) {
            return false;
        }
    }
    return true;
}
/**
 * 通过刷新页面的方式，比较两次生成的指纹是否相同来检测伪造。于是我尝试将随机性从 js 脚本中提取到 python 代码里，保证相同会话无论刷新多少次都是用的同一套随机数
 */
// inject
var inject = function () {
    const toBlob = HTMLCanvasElement.prototype.toBlob;
    const toDataURL = HTMLCanvasElement.prototype.toDataURL;
    const getImageData = CanvasRenderingContext2D.prototype.getImageData;
    //
    var noisify = function (canvas, context) {
        if (context) {
            const shift = {
                'r': Math.floor(Math.random() * 10) - 5,
                'g': Math.floor(Math.random() * 10) - 5,
                'b': Math.floor(Math.random() * 10) - 5,
                'a': Math.floor(Math.random() * 10) - 5
            };
            //
            const width = canvas.width;
            const height = canvas.height;
            if (width && height) {
                const imageData = getImageData.apply(context, [0, 0, width, height]);
                for (let i = 0; i < height; i++) {
                    for (let j = 0; j < width; j++) {
                        const n = ((i * (width * 4)) + (j * 4));
                        imageData.data[n + 0] = imageData.data[n + 0] + shift.r;
                        imageData.data[n + 1] = imageData.data[n + 1] + shift.g;
                        imageData.data[n + 2] = imageData.data[n + 2] + shift.b;
                        imageData.data[n + 3] = imageData.data[n + 3] + shift.a;
                    }
                }
                //
                window.top.postMessage("canvas-fingerprint-defender-alert", '*');
                context.putImageData(imageData, 0, 0);
            }
        }
    };
    //
    Object.defineProperty(HTMLCanvasElement.prototype, "toBlob", {
        "value": function () {
            noisify(this, this.getContext("2d"));
            return toBlob.apply(this, arguments);
        }
    });
    //
    Object.defineProperty(HTMLCanvasElement.prototype, "toDataURL", {
        "value": function () {
            noisify(this, this.getContext("2d"));
            return toDataURL.apply(this, arguments);
        }
    });
    //
    Object.defineProperty(CanvasRenderingContext2D.prototype, "getImageData", {
        "value": function () {
            noisify(this.canvas, this);
            return getImageData.apply(this, arguments);
        }
    });
    //
    document.documentElement.dataset.cbscriptallow = true;
};
inject();
