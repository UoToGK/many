/**
ajax的xhr对象有7个事件

onloadstart 开始send触发

onprogress 从服务器上下载数据每50ms触发一次

onload 得到响应

onerror 服务器异常

onloadend 请求结束，无论成功失败

onreadystatechange xhr.readyState改变使触发

onabort 调用xhr.abort时触发
*/
// ajax函数的默认参数
interface IAjax {
  url: string;
  method: string;
  async?: boolean;
  timeout?: number;
  data?: any;
  dataType: string;
  headers: Object;
  onprogress?: Function;
  on_upload_progress?: Function;
  xhr: XMLHttpRequest;
}
let default_ajax_options = {
  url: "#",
  method: "GET",
  async: true,
  timeout: 0,
  data: null,
  dataType: "text",
  headers: {},
  onprogress: function () { },
  on_upload_progress: function () { },
  xhr: null
};
/**
 * ajax函数，返回一个promise对象
 * @param {Object} optionsOverride 参数设置，支持的参数如下
 * url: url地址，默认"#"
 * method: 请求方法，仅支持GET,POST,默认GET
 * async: 是否异步，默认true
 * timeout: 请求时限，超时将在 Promise 中调用reject函数
 * data: 发送的数据，该函数不支持处理数据，将会直接发送
 * dataType: 接受的数据的类型，默认为text
 * headers: 一个对象，包含请求头信息
 * onprogress: 处理onprogress的函数
 * on_upload_progress: 处理.upload.onprogress的函数
 * xhr: 允许在函数外部创建xhr对象传入，但必须不能是使用过的
 * @return {Promise}
 * 该函数注册xhr.onloadend回调函数，判断xhr.status是否属于 [200,300)&&304 ，
 * 如果属于则 Promise 引发resolve状态，允许拿到xhr对象
 * 如果不属于，或已经引发了ontimeout,onabort,则引发reject状态，允许拿到xhr对象
 *
 * 关于reject
 * 返回一个对象，包含
 * errorType:错误类型，
 * abort_error: xhr 对象调用 abort函数
 * timeout_error: 请求超时
 * onerror: xhr 对象触发了onerror事件
 * send_error: 发送请求出现错误
 * status_error: 响应状态不属于 [200,300)&&304
 */
function ajax(optionsOverride: IAjax): Promise<any> {
  // 将传入的参数与默认设置合并
  //如果目标对象与源对象有同名属性，或多个源对象有同名属性，则后面的属性会覆盖前面的属性
  let options = Object.assign({}, default_ajax_options, optionsOverride);
  options.async = options.async === true ? true : false;
  let xhr: XMLHttpRequest = options.xhr || new XMLHttpRequest();
  return new Promise(function (resolve, reject) {
    xhr.open(options.method, options.url, options.async);
    xhr.timeout = options.timeout;
    //设置请求头
    for (var k in options.headers) {
      xhr.setRequestHeader(k, options.headers[k]);
    }
    xhr.onprogress = options.onprogress;
    xhr.upload.onprogress = options.on_upload_progress;
    xhr.responseType = <any>options.dataType;

    xhr.onabort = function () {
      reject({
        errorType: "onabort_error",
        xhr: xhr
      });
    };
    xhr.ontimeout = function () {
      reject({
        errorType: "timeout_error",
        xhr: xhr
      });
    };
    xhr.onerror = function () {
      reject({
        errorType: "onerror",
        xhr: xhr
      });
    };
    xhr.onloadend = function () {
      if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304)
        resolve(xhr);
      else
        reject({
          errorType: "status_error",
          xhr: xhr
        });
    };
    try {
      xhr.send(options.data);
    } catch (e) {
      reject({
        errorType: "send_error",
        error: e
      });
    }
  });
}
