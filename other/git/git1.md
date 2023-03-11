- 解决 git 中文乱码
- git config --global core.quotepath false
  - core.quotepath 的作用是控制路径是否编码显示的选项。当路径中的字符大于 0x80 的时候，如果设置为 true，转义显示；设置为 false，不转义。

# windows 平台显示乱码

- 右键 gitbash 选中“Options(选项)"-"text".设置下面的 locale 为 zh_CN，Character Set 为 UTF-8。
- 强烈推荐全部选用 UTF-8,少用 GBK。
