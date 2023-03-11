# [DOMContentLoaded&Load 区别](https://blog.csdn.net/four_lemmo/article/details/78217830)
我们在浏览器输入网址后，浏览器会向服务器发送请求，服务器将请求的HTML文档发送回浏览器，浏览器将文档下载下来后，便开始从上到下解析，解析完成之后，会生成DOM。如果页面中有css，会根据css的内容形成CSSOM，然后DOM和CSSOM会生成一个渲染树，最后浏览器会根据渲染树的内容计算出各个节点在页面中的确切大小和位置，并将其绘制在浏览器上。

　　在页面加载解析html的时候，会产生中断，这是因为JavaScript会阻塞dom解析，转而取处理脚本，如果脚本是内联的，将先执行此脚本；如果是外联的，则先加载脚本然后再执行。然后再进行html解析。

　　当文档中没有脚本时，浏览器解析完文档便能触发 DOMContentLoaded 事件；如果文档中包含脚本，则脚本会阻塞文档的解析，而脚本需要等位于脚本前面的css加载完才能执行。在任何情况下，DOMContentLoaded 的触发不需要等待图片等其他资源加载完成。

　　注意：js会受到css样式的限制，如果有css，先进行css加载解析之后再执行脚本文件。这是因为js需要知道对象的样式。

　　DOMContentLoad和Load不同点在于：

　　1.DOMContentLoaded是HTML文档（CSS、JS）被加载以及解析完成之后触发（即 HTML->DOM的过程完成 ）；

　　2.load需要在页面的图片、视频等加载完后被触发，而DOMContent不需要等待这些资源加载完成；

　　3.一般情况下，load在DOMContent解析完之后才被触发（有可能在其前面触发）；

　　针对页面的优化：

　　　　将js放到body标签底部，原因是因为浏览器生成Dom树的时候是逐行读取HTML代码，script标签放在最后面就不会影响前面的页面的渲染。那么问题来了，既然Dom树完全生成好后页面才能渲染出来，浏览器又必须读完全部HTML才能生成完整的Dom树，script标签不放在body底部是不是也一样，因为dom树的生成需要整个文档解析完毕。

　　　　在页面渲染过程中的，First Paint（第一渲染）的时间。页面的paint不是在渲染树生成之后吗？其实现代浏览器为了更好的用户体验,渲染引擎将尝试尽快在屏幕上显示的内容。它不会等到所有HTML解析之前开始构建和布局渲染树。部分的内容将被解析并显示。也就是说浏览器能够渲染不完整的dom树和cssom，尽快的减少白屏的时间。假如我们将js放在header，js将阻塞解析dom，dom的内容会影响到First Paint，导致First Paint延后。所以说我们会将js放在后面，以减少First Paint的时间，但是不会减少DOMContentLoaded被触发的时间。