## 使用Flex

+ 只需要在父盒子设置：display: flex; justify-content: center;align-items: center;

## 使用 CSS3 transform

+ 父盒子设置:display:relative
+ Div 设置: transform: translate(-50%，-50%);position: absolute;top: 50%;left: 50%;

## 使用 display:table-cell 方法

+ 父盒子设置:display:table-cell; text-align:center;vertical-align:middle;
+ Div 设置: display:inline-block;vertical-align:middle;

## position 几个属性的作用
2.1 relative，absolute，fixed，static
+ position 的常见四个属性值: relative，absolute，fixed，static。一般都要配合"left"、"top"、"right" 以及 "bottom" 属性使用。

+ static:默认位置。 在一般情况下，我们不需要特别的去声明它，但有时候遇到继承的情况，我们不愿意见到元素所继承的属性影响本身，从而可以用Position:static取消继承，即还原元素定位的默认值。设置为 static 的元素，它始终会处于页面流给予的位置(static 元素会忽略任何 top、 bottom、left 或 right 声明)。一般不常用。
+ relative:相对定位。 相对定位是相对于元素默认的位置的定位，它偏移的 top，right，bottom，left 的值都以它原来的位置为基准偏移，而不管其他元素会怎么 样。注意 relative 移动后的元素在原来的位置仍占据空间。
+ absolute:绝对定位。 设置为 absolute 的元素，如果它的 父容器设置了 position 属性，并且 position 的属性值为 absolute 或者 relative，那么就会依据父容器进行偏移。如果其父容器没有设置 position 属性，那么偏移是以 body 为依据。注意设置 absolute 属性的元素在标准流中不占位置。
+ fixed:固定定位。 位置被设置为 fixed 的元素，可定位于相对于浏览器窗口的指定坐标。不论窗口滚动与否，元素都会留在那个位置。它始终是以 body 为依据的。 注意设置 fixed 属性的元素在标准流中不占位置。

## 浮动元素的展示在不同情况下会有不同的规则：

<p>
浮动元素在浮动的时候，其margin不会超过包含块的padding。PS：如果想要元素超出，可以设置margin属性
如果两个元素一个向左浮动，一个向右浮动，左浮动元素的marginRight不会和右浮动元素的marginLeft相邻。
如果有多个浮动元素，浮动元素会按顺序排下来而不会发生重叠的现象。
如果有多个浮动元素，后面的元素高度不会超过前面的元素，并且不会超过包含块。
如果有非浮动元素和浮动元素同时存在，并且非浮动元素在前，则浮动元素不会高于非浮动元素
浮动元素会尽可能地向顶端对齐、向左或向右对齐
</p>

## 重叠问题

行内元素与浮动元素发生重叠，其边框，背景和内容都会显示在浮动元素之上
块级元素与浮动元素发生重叠时，边框和背景会显示在浮动元素之下，内容会显示在浮动元素之上

## clear属性
clear属性：确保当前元素的左右两侧不会有浮动元素。clear只对元素本身的布局起作用。
取值：left、right、both

 ## 清除浮动的方法
1. 方法1：给父级div定义 高度
+ 原理：给父级DIV定义固定高度（height），能解决父级DIV 无法获取高度得问题。
>优点：代码简洁
>缺点：高度被固定死了，是适合内容固定不变的模块。（不推荐使用）

2. 方法二：使用空元素，如<div class="clear"></div> (.clear{clear:both})
+ 原理：添加一对空的DIV标签，利用css的clear:both属性清除浮动，让父级DIV能够获取高度。
>优点：浏览器支持好
>缺点：多出了很多空的DIV标签，如果页面中浮动模块多的话，就会出现很多的空置DIV了，这样感觉视乎不是太令人满意。（不推荐使用）
3. 方法三：让父级div 也一并浮起来
>这样做可以初步解决当前的浮动问题。但是也让父级浮动起来了，又会产生新的浮动问题。 不推荐使用
4. 方法四：父级div定义 display:table
+ 原理：将div属性强制变成表格
>优点：不解
>缺点：会产生新的未知问题。（不推荐使用）
5. 方法五：父元素设置 overflow：hidden、auto；
+原理：这个方法的关键在于触发了BFC。在IE6中还需要触发 hasLayout（zoom：1）
>优点：代码简介，不存在结构和语义化问题
>缺点：无法显示需要溢出的元素（亦不太推荐使用）
6. 方法六：父级div定义 伪类:after 和 zoom
```css
.clearfix:after{
    content:'.';
    display:block;
    height:0;
    clear:both;
    visibility: hidden;
}
.clearfix {zoom:1;}
```
>>复制代码原理：IE8以上和非IE浏览器才支持:after，原理和方法2有点类似，zoom(IE转有属性)可解决ie6,ie7浮动问题
>>优点：结构和语义化完全正确,代码量也适中，可重复利用率（建议定义公共类）
>>缺点：代码不是非常简洁（极力推荐使用）

## CSS 引入的方式有哪些? link 和@import 的区别是?
有四种：内联(元素上的style属性)、内嵌(style标签)、外链(link)、导入(@import)
link和@import的区别：

+ link是XHTML标签，除了加载CSS外，还可以定义RSS等其他事务；@import属于CSS范畴，只能加载CSS。
+ link引用CSS时，在页面载入时同时加载；@import需要页面网页完全载入以后加载。
+ link是XHTML标签，无兼容问题；@import是在CSS2.1提出的，低版本的浏览器不支持。
+ link支持使用Javascript控制DOM去改变样式；而@import不支持。

## 消除图片底部间隙的方法

+ 图片块状化 - 无基线对齐：img { display: block; }
+ 图片底线对齐：img { vertical-align: bottom; }
+ 行高足够小 - 基线位置上移：.box { line-height: 0; }