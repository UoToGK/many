

/*
 * @Author: xiaobin.zhu
 * @since: 2023-02-09 14:13:49
 * @LastAuthor: xiaobin.zhu
 * @LastEditTime: 2023-02-09 15:26:03
 * @Description: write something
 * 自己的代码调用get_env_script传入code与循环次数即可使用，普通的环境是没什么问题的，自动吐出 
 * @FilePath: auto_print_env
 * @Copyright(c): 企知道-数据采集部
 */
// js文件头部注释之后的内容
var eval_env_script = "";
var all_eval_env_script = "";
var base_script = "";
//常用的proxy_array(按照"_"规范填写,后面会进行解析)
var proxy_array = ["window", "window_document", "window_location", "window_navigator"];

function vmProxy(object) {
    return new Proxy(object, {

        set: function (target, property, value) {
            console.log("set", target, property, value);
            return Reflect.set(...arguments);
        },
        get: function (target, property, recelver) {
            console.log("get", target, property, target[property]);
            if (target[property] == undefined) {
                //拼接脚本
                eval_env_script = target.name.replaceAll("_", ".") + '.' + property;
            }
            return target[property];
        },

    });
}

for (var i = 0; i < proxy_array.length; i++) {
    var proxy_function = proxy_array[i].replaceAll("_", ".");
    base_script += proxy_function + ' = ' + '{};\r\n';
    eval(proxy_function + ' = ' + 'vmProxy(function ' + proxy_array[i] + '(){})');
}

function get_env_script(source_js_code, count) {

    //最多循环conut次，防止一直无法得到环境
    for (var i = 0; i < count; i++) {
        try {
            eval(source_js_code);//需要补环境的js
            break;//成功后退出循环
        } catch (err) {
            if (err.message.indexOf('Cannot read') != -1) {
                eval_env_script += ' = "";';
            } else if (err.message.indexOf('is not a function') != -1) {
                eval_env_script += ' = function() {return {};}';
            }
            eval(eval_env_script);
            all_eval_env_script += "\r\n" + eval_env_script;
        }
    }

    all_eval_env_script = base_script + all_eval_env_script;
    console.log("result: \r\n" + all_eval_env_script);

    return all_eval_env_script;

}