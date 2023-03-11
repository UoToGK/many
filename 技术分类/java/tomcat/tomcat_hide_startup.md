```js
这时可以将tomcat设置为隐藏启动（服务正常启动，但下方不会出现cmd命令窗口）　
　　　实现方法：
　　　　　　　　　更改文件：TOMCAT_HOME\bin\setclasspath.bat
　　　　　　　　　　　　将set _RUNJAVA="%JRE_HOME%\bin\java.exe"  改为  set _RUNJAVA="%JRE_HOME%\bin\javaw.exe"   （在文件的末尾）
　　　　　　　　　更改后，重启服务即可
```