# bat 表示条件

```bat
EQU - 等于
NEQ - 不等于
LSS - 小于
LEQ - 小于或等于
GTR - 大于
GEQ - 大于或等于

下边我们举个简单的例子：

程序代码
@echo off

set /a a=1,b=2
if %a% equ %b% (echo yes) else (echo no)
if %a% neq %b% (echo yes) else (echo no)
if %a% lss %b% (echo yes) else (echo no)
```

Echo 删除计划任务 testssss
schtasks /delete /tn testssss /f

Echo 添加计划任务 testssss
schtasks /create /tn testssss /tr D:/1SVUSERFILES/Software/hack_script/Force-kill-process.vbs /sc DAILY /st 20:01

# 不允许执行脚本，以管理员身份运行power shell
set-executionpolicy remotesigned