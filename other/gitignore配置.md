<font color="#20B2AA">

- # 表示此为注释,将被 Git 忽略
- \*.a 表示忽略所有 .a 结尾的文件
- !lib.a 表示但 lib.a 除外
- /TODO 表示仅仅忽略项目根目录下的 TODO 文件，不包括 subdir/TODO
- build/ 表示忽略 build/目录下的所有文件，过滤整个 build 文件夹；
- doc/\*.txt 表示会忽略 doc/notes.txt 但不包括 doc/server/arch.txt
-
- bin/: 表示忽略当前路径下的 bin 文件夹，该文件夹下的所有内容都会被忽略，不忽略 bin 文件
- /bin: 表示忽略根目录下的 bin 文件
- /\*.c: 表示忽略 cat.c，不忽略 build/cat.c
- debug/\*.obj: 表示忽略 debug/io.obj，不忽略 debug/common/io.obj 和 tools/debug/io.obj
- \*\*/foo: 表示忽略/foo,a/foo,a/b/foo 等
- a/\*\*/b: 表示忽略 a/b, a/x/b,a/x/y/b 等
- !/bin/run.sh 表示不忽略 bin 目录下的 run.sh 文件
- \*.log: 表示忽略所有 .log 文件
- config.php: 表示忽略当前路径的 config.php 文件
-
- /mtk/ 表示过滤整个文件夹
- \*.zip 表示过滤所有.zip 文件
- /mtk/do.c 表示过滤某个具体文件
-
- 被过滤掉的文件就不会出现在 git 仓库中（gitlab 或 github）了，当然本地库中还有，只是 push 的时候不会上传。
-
- 需要注意的是，gitignore 还可以指定要将哪些文件添加到版本管理中，如下：
- !\*.zip
- !/mtk/one.txt
-
- 唯一的区别就是规则开头多了一个感叹号，Git 会将满足这类规则的文件添加到版本管理中。为什么要有两种规则呢？
- 想象一个场景：假如我们只需要管理/mtk/目录中的 one.txt 文件，这个目录中的其他文件都不需要管理，那么.gitignore 规则应写为：：
- /mtk/\*
- !/mtk/one.txt
-
- 假设我们只有过滤规则，而没有添加规则，那么我们就需要把/mtk/目录下除了 one.txt 以外的所有文件都写出来！
- 注意上面的/mtk/\*不能写为/mtk/，否则父目录被前面的规则排除掉了，one.txt 文件虽然加了!过滤规则，也不会生效！
-
- ***
- 还有一些规则如下：
- fd1/\*
- 说明：忽略目录 fd1 下的全部内容；注意，不管是根目录下的 /fd1/ 目录，还是某个子目录 /child/fd1/ 目录，都会被忽略；
-
- /fd1/\*
- 说明：忽略根目录下的 /fd1/ 目录的全部内容；
-
- /\*
- !.gitignore
- !/fw/
- /fw/\*
- !/fw/bin/
- !/fw/sf/
- 说明：忽略全部内容，但是不忽略 .gitignore 文件、根目录下的 /fw/bin/ 和 /fw/sf/ 目录；注意要先对 bin/的父目录使用!规则，使其不被排除。
  </font>

## git add 显示中文乱码

```bash
 git config --global core.quotepath false
```

## 自带的 bash 中，使用 ls 命令查看中文文件名乱码

- 使用 ls --show-control-chars 命令来强制使用控制台字符编码显示文件名，即可查看中文文件名。

- 为了方便使用，可以编辑 /etc/git-completion.bash ，新增一行 alias ls=”ls –show-control-chars”

## git log 显示提交的中文 log 乱码

- 设置 git gui 的界面编码 git config --global gui.encoding utf-8

- 设置 commit log 提交时使用 utf-8 编码，可避免服务器上乱码，同时与 linux 上的提交保持一致！git config --global i18n.commitencoding utf-8

- 使得在 \$ git log 时将 utf-8 编码转换成 gbk 编码，解决 Msys bash 中 git log 乱码。git config --global i18n.logoutputencoding gbk

- 使得 git log 可以正常显示中文（配合 i18n.logoutputencoding = gbk)，在 /etc/profile 中添加：export LESSCHARSET=utf-8
