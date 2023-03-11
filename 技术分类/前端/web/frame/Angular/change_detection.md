### [关于 angular 的 change detection](https://zhuanlan.zhihu.com/p/44571699)

<h4>每个 Angular 应用都是以组件树的形态呈现的。在变化监测阶段会每个组件执行以下操作（ Digest Cycle 1 ）：</h4>
<ul>
    <li>更新所有绑定在子 component/directive 上的属性</li>
    <li>调用所有子component/directive的 ngOnInit , ngOnChanges , ngDoCheck 生命周期函数</li>
    <li>解析、更新当前组件 DOM 的状态</li>
    <li>运行子 component 的变化监测流程（ Digest Cycle 1 ）</li>
    <li>调用所有子 component/directive 上的 ngAfterViewInit 生命周期</li>
    <li>还有一些其他的操作在变化监测阶段被执行，我在这篇文章中详细列出了这些流程：Everything you need to know about change detection in Angular</li>
</ul>

<p>每一步操作后， Angular 会保存所有与这次操作有关的属性的值，这些值被存在组件 view 的 oldValues 属性中。（开发模式下）所有组件完成变化监测之后 Angular 会开始下一个变化监测流程，第二次监测流程并不会再次执行上面列出的变化监测流程，而会比较之前变化监测循环保存的值（存在 oldValues 中的）与当前监测流程的值是否一致（ Digest Cycle 2 ）：</p>

<p>检查被传递到子组件的 values（ oldValues ）与当前组件的 values（ instance.value ）是否一致
检查被用于更新 DOM 元素的 values（ oldValues ）与当前组件的 values（ instance.value ）是否一致
对所有子 component 执行相同的检查</p>
<p>注意：这些额外的检查（ Digest Cycle 2 ）只发生在开发模式下，我会在后面的章节中解释其中原因</p>

## [更具体的](https://zhuanlan.zhihu.com/p/93242237)

Angular 实现依赖注入的基本思路是这样的:

首先有个用于存依赖项和依赖值的映射表
有个专门获取函数参数的方法 annotate
统一处理依赖注入的多种方式
从函数的参数中提取依赖项 function MyController($scope, $route){}
通过 $inject 注入 MyController.$inject = ['$scope', '$route'];
数组内联注入式 ['$scope', '$route', function($scope, $route){}]
最后进行依赖注入，同时改了函数的 this 指向 fn.apply(self, args);
核心方法
createInjector
有两个映射表
providerCache 主要用于缓存原始服务对象 名字结尾默认会加 Provide
instanceCache 主要用于缓存服务实例对象
核心方法 createInternalInjector
getService 用于获取服务实例对象
invoke 调用执行函数并进行依赖项注入
annotate 获取依赖项
instantiate 实例化服务对象
从函数的参数中提取依赖项
这种依赖注入方式，是通过 annotate 方法直接获取依赖注入项
该方式只能用在演示不能用代码压缩混淆

通过 $inject 注入
这种方式比较直观，将依赖注入单独分开处理
该方式不能使用匿名函数

数组内联注入式
这种依赖注入方式将依赖注入项和执行函数写在了同一数组中，操作便捷，可直接使用匿名函数
这种方式也是 Angular 官方推荐的
