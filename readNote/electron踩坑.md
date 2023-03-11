# 从去年 6 月份进公司开始学习 Electron 和 AngularJs 开发的一款爬虫软件

## 我来总结一下踩过的坑吧，心酸

<font face="微软雅黑"  color=#0099ff size=3>

1. 由于采用的版本是 1.3.1 的，我发现用 vscode 无法调试 webview 加载页面代码，这对于我一个一开始没接触过的真的是很懵逼，于是我就各种 Google 和 StackOverflow 各种问，最终才找到，在主进程加上监听调试开关的端口即可。MMP，为什么 vscode 调试文件中声明了不行，不知道什么问题，没去深究。
   </font>
   <font face="微软雅黑"  color=#0099ff size=3>

2. 白色 loading 状态是属于浏览器行为
   没有什么比白色的 loading 更能代表 Electron app 只是个内嵌浏览器的本质了。不过我们可以通过两种手段来避免 loading 状态：
   </font>

#### 2.1 指定 BrowserWindow 背景颜色

如果你的应用没有白色背景，那么一定要在 BrowserWindow 选项中明确声明。这并不会阻止应用加载时的纯色方块，但至少它不会半路改变颜色：

```js
 mainWindow = new BrowserWindow({

     title: 'ElectronApp',

     *backgroundColor: '#002b36',*

   };
```

#### 2.2 在你应用加载完成前隐藏它:

因为应用实际上是在浏览器中运行的，我们可以选择在所有资源加载完成前隐藏窗口。在开始前，确保隐藏掉浏览器窗口：

```js
 var mainWindow = new BrowserWindow({

       title: 'ElectronApp',

       *show: false,*

   };
```

然后在所有东西都加载完成时，显示窗口并聚焦在上面提醒用户。这里推荐使用 BrowserWindow 的 "ready-to-show" 事件实现，或者用 webContents 的 'did-finish-load' 事件。

```js
mainWindow.on("ready-to-show", function () {
  mainWindow.show();

  mainWindow.focus();
});
```

这里记得要调用 foucs ，提醒用户你的应用已经加载完成了。

## 使用系统字体 San Francisco

用系统默认的字体意味着你的应用可以和操作系统看起来很和谐。为了避免给每个系统都单独设置字体，你可以用下面的 CSS 代码块速实现更随系统字体：

```css
body {
  font: caption;
}
```

"caption" 是 CSS 中关键字，它会连接到系统指定字体。

## 预编译方案

有 electron-window-state 和 electron-window-state-manager 两种预编译方案。两种都能用，好好读文档并且小心边界情况，比如最大化你的应用。如果你很想快一点编译完成并看到成品，你可以采用这两种方案

## 自定义标题栏

> - 这应该是每一个使用 electron 实现 web 客户端都会遇到的问题，使用原生的外边框，第一太丑，第二也不统一。
> - 解决方案：frame + css drag
> - frame: false: 主进程中设置窗体参数。去掉默认的标题栏
> - -webkit-app-region: drag: 渲染进程中设置 css。对应的组件可以进行拖动了

```js
mainWindow = new BrowserWindow({
  height: 350,
  width: 550,
  useContentSize: true,
  resizable: isDev, // 是否可调整大小
  alwaysOnTop: !isDev, // 应用是否始终在所有顶层之上
  transparent: true, // 透明边框
  frame: false, // 不使用默认边框
  center: true,
});
```

```css
.u-header {
  position: relative;
  width: 100%;
  height: 50px;
  line-height: 50px;
  -webkit-app-region: drag; /* as window header */
}
```

<font color="#20B2AA" size=3>

标题栏按钮无效 -- only windows

- 该 bug 只在 windows 平台上显示，mac 上正常。在 header 组件中设置为 drag，导致组件里的元素都无法点击。
- 解决方案：在需要点击的元素上添加 no-drag。-webkit-app-region: no-drag;
  </font>

> 文本不可选择
>
> > 既然作为客户端，就应该像个客户端程序，不能对展示型的文本进行用户选择。
> >
> > > 解决方案：使用 css -webkit-user-select: none;

```css
html {
  -webkit-tap-highlight-color: transparent;
  -webkit-text-size-adjust: 100%;
  height: 100%;
  -webkit-user-select: none; /* disable user select text */
}
```

## 不断创建 webview，再销毁，导致主进程的内存持续增大

- 可以查看是不是 webview。 [partision](http://electronjs.org/docs/api/webview-tag#partition) 是不是为每个页面开启了 session 缓存,可以注释
- 设置页面使用的会话。 如果 partition 以 persist:开头, 该页面将使用持续的 session，
  并在所有页面生效，且使用同一个 partition. 如果没有 persist: 前缀, 页面将使用 in-memory session. 通过分配相同的 partition, 多个页可以共享同一会话。 如果没有设置 partition，app 将会使用默认的 session。
  此值只能在第一次导航之前修改, 因为活动的渲染进程的会话无法更改。尝试修改该值将会失败, 并会出现一个 DOM 异常。

## 关于 webview

- <WebView>的 height、width 需要外面包裹一层

```html
<div style="{styleDiv" }>
  <webview src="{src}" style="{styleWeb" }> </webview>
</div>
```

```js
在前面创建基本应用中我们已经谈到了关于 preload 脚本用来引入 jQeury 的使用，事实上我们可以用 preload 做更多的事情。preload 脚本会在整个页面开始加载之前被执行，所以如果我们直接执行一些当整个 DOM 加载完成才能被执行的操作，是必定会失效的，因此这样的两个事件是非常有用的：DOMNodeInserted、DOMContentLoaded


// preload.js
// 不要再外面这么干
// ipcRenderer.send(...)

document.addEventListener('DOMContentLoaded', (event) => {
	// 页面内容加载之后需要引入的一些操作
	// ...
	// 正确的做法
	ipcRenderer.send(...)
})
```

#### 第三方 URL 检查

问题

```js
这时，为了解决这个问题，笔者实践的一个解决做法是对每次要跳转的 URL 和打开的窗口做 URL 检查，主要依赖下面两行代码：

win.webContents.on(‘will-navigate’, checker)
win.webContents.on(‘new-window’, checker)
```
