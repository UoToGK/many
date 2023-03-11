# [Directive1](https://blog.csdn.net/evankaka/article/details/51232895#)

#[Directive2](https://blog.csdn.net/ywl570717586/article/details/78551319)

#Anguar的指令编译过程

```js
首先加载angularjs库，查找到ng-app指令，从而找到应用的边界，

根据ng-app划定的作用域来调用$compile服务进行编译，angularjs会遍历整个HTML文档，并根据js中指令的定义来处理在页面上声明的各个指令按照指令的优先级(priority)排列，根据指令中的配置参数(template，place，transclude等)转换DOM并同时发现需要监控的表达式加入$watch队列然后就开始按顺序执行各指令的compile函数（如果指令上有定义compile函数）对模板自身进行转换

注意：此处的compile函数是我们指令中配置的，跟上面说的$compile服务不一样。每个compile函数执行完后都会返回一个link函数，所有的link函数会合成一个大的link函数

然后这个大的link函数就会被执行，主要做数据绑定，通过在DOM上注册监听器来动态修改scope中的数据，或者是使用$watchs监听 scope中的变量来修改DOM，从而建立双向绑定等等。若我们的指令中没有配置compile函数，那我们配置的link函数就会运行，她做的事情大致跟上面complie返回之后所有的link函数合成的的大的link函数差不多。

所以：在指令中compile与link选项是互斥的，如果同时设置了这两个选项，那么就会把compile所返回的函数当做是链接函数，而link选项本身就会被忽略掉
```


## [深入理解angularjs  compaire pre-link post-link](https://www.cnblogs.com/baobaodada/p/6005802.html)

## [源码解析](https://www.cnblogs.com/web2-developer/category/751303.html)