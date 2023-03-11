# 序言 
+ 之前没怎么注意去写这个就从现在这个开始吧

# Electron开发的一款爬虫工具
+ 主要总结一下踩过的坑
+ 总结一下自己对这个软件的优化

## 踩过的坑
- 这个之前总结过了，[点此跳转](https://github.com/UoToGK/myblog/blob/master/software%26app%26plug-in/Electron/electron%E8%B8%A9%E5%9D%91.md)

### 软件的优化

- 首先是 AngularJs方面
  - 首先要明白这两个阶段（compile-》 pre-link-》 post-link 执行的顺序）
    - 在编译阶段中，每一个指令可能有会有另外一个指令，AngularJS遍历他们形成了模板树，之后会返回一个模板函数，而在模板函数返回之前DOM都是没有形成的，所以此时ng-repeat指令就会生效。
    而在编译完成之后，会返回一个编译函数，这个编译函数会返回一个总的将所有子指令模板合并在一起的模板函数，并且交给链接阶段。

    - 在链接阶段中，我们可以将作用域scope和DOM进行链接，并且对每一个函数的模板的实例进行链接或者监听器的注册。
    bug：
    提出 a=extend(locals, _locals),引发bug

消除ctrl+r刷新，报错问题
wc.session.webRequest.onHeadersReceived(null);
wc.session.webRequest.onBeforeSendHeaders(null);
wc.session.webRequest.onCompleted(null)
wc.session.webRequest.onBeforeRequest(null)