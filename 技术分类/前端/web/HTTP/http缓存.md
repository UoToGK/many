# [彻底弄懂 http 缓存](https://www.cnblogs.com/chenqf/p/6386163.html)

## 强制缓存

- 从上文我们得知，强制缓存，在缓存数据未失效的情况下，可以直接使用缓存数据，那么浏览器是如何判断缓存数据是否失效呢？
  我们知道，在没有缓存数据的时候，浏览器向服务器请求数据时，服务器会将数据和缓存规则一并返回，缓存规则信息包含在响应 header 中。

- 对于强制缓存来说，响应 header 中会有两个字段来标明失效规则（Expires/Cache-Control）
  使用 chrome 的开发者工具，可以很明显的看到对于强制缓存生效时，网络请求的情况

1. Expires

- Expires 的值为服务端返回的到期时间，即下一次请求时，请求时间小于服务端返回的到期时间，直接使用缓存数据。
  不过 Expires 是 HTTP 1.0 的东西，现在默认浏览器均默认使用 HTTP 1.1，所以它的作用基本忽略。
  另一个问题是，到期时间是由服务端生成的，但是客户端时间可能跟服务端时间有误差，这就会导致缓存命中的误差。
  所以 HTTP 1.1 的版本，使用 Cache-Control 替代。

2. Cache-Control

- Cache-Control 是最重要的规则。常见的取值有 private、public、no-cache、max-age，no-store，默认为 <strong>private。<strong>
- private: 客户端可以缓存
- public: 客户端和代理服务器都可缓存（前端的同学，可以认为 public 和 private 是一样的）
- max-age=xxx: 缓存的内容将在 xxx 秒后失效 86400==一天
- no-cache: 需要使用对比缓存来验证缓存数据（后面介绍）
- no-store: 所有内容都不会缓存，强制缓存，对比缓存都不会触发（对于前端开发来说，缓存越多越好，so...基本上和它说 886）

```js
举个板栗
access-control-allow-origin: https://www.cnblogs.com
age: 0
cache-control: public,max-age=60
content-length: 665
content-type: application/json; charset=utf-8
date: Wed, 08 May 2019 06:15:43 GMT
server: Tengine
status: 200

图中Cache-Control仅指定了max-age，所以默认为private，缓存时间为60秒
也就是说，在60s内再次请求这条数据，都会直接获取缓存数据库中的数据，直接使用。
```
