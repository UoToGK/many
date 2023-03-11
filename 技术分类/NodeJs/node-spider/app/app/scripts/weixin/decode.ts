// Created by uoto on 2017/1/10.
var config = require("../../resource/config.yaml");

//const uuwApi = 'http://115.29.147.233:8080/uuwise-web/uuwise/doVerify';

export function decodeBase64(
  base64: string,
  callback: JQueryPromiseCallback<any>
) {
  //   console.warn("config[uuwise_api]", config["uuwise_api"]);
  $["post"](
    config["uuwise_api"],
    <any>{ base64: base64, impl: "lianzhong" },
    "json"
  ).done(callback);
}
