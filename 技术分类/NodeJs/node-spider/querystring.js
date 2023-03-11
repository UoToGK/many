/**
 * querystring.parse(str,separator,eq,options)

parse这个方法是将一个字符串反序列化为一个对象。

参数：str指需要反序列化的字符串;

　　　separator（可省）指用于分割str这个字符串的字符或字符串，默认值为"&";

　　　eq（可省）指用于划分键和值的字符或字符串，默认值为"=";

　　　options（可省）该参数是一个对象，里面可设置maxKeys和decodeURIComponent这两个属性：

　　　　　　maxKeys：传入一个number类型，指定解析键值对的最大值，默认值为1000，如果设置为0时，则取消解析的数量限制;

　　　　　　decodeURIComponent:传入一个function，用于对含有%的字符串进行解码，默认值为querystring.unescape
 */

var querystring = require("querystring");

var a = querystring.parse("name=whitemu&sex=man&sex=women");

let b = querystring.parse("name=whitemu#sex=man#sex=women", "#", null, {
  maxKeys: 2,
});
console.log(a, b);

/**
 * uerystring.stringify(obj,separator,eq,options)

stringify这个方法是将一个对象序列化成一个字符串，与querystring.parse相对。
 */

console.log(querystring.stringify(a));

/**
 *  querystring.escape(str)

escape可使传入的字符串进行编码
 */
let c = querystring.escape("name=慕白");

console.log(c);

/**
 * querystring.unescape(str)

unescape方法可将含有%的字符串进行解码
 */
console.log(querystring.unescape(c));
