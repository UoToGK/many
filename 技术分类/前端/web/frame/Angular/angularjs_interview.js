/**
 * [作用域问题的思考](http://huangtengfei.com/2015/09/scope-in-angularjs/)
 * [angularJs Interview](https://segmentfault.com/a/1190000005836443)
 *
 * 1、 = or =attr “Isolate”作用域的属性与父作用域的属性进行双向绑定，任何一方的修改均影响到对方，这是最常用的方式；
2、 @ or @attr “Isolate”作用域的属性与父作用域的属性进行单向绑定，即“Isolate”作用域只能读取父作用域的值，并且该值永远的String类型；
3、 & or &attr “Isolate”作用域把父作用域的属性包装成一个函数，从而以函数的方式读写父作用域的属性，包装方法是$parse

@ 绑定一个局部 scope 属性到当前 dom 节点的属性值。结果总是一个字符串，因为 dom 属性是字符串。
& 提供一种方式执行一个表达式在父 scope 的上下文中。如果没有指定 attr 名称，则属性名称为相同的本地名称。
= 通过 directive 的 attr 属性的值在局部 scope 的属性和父 scope 属性名之间建立双向绑定。
 */