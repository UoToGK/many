@echo off
%1 mshta vbscript:CreateObject("Shell.Application").ShellExecute("cmd.exe","/c %~s0 ::","","runas",1)(window.close)&&exit
ping /n 1 127.0.0.1 >nul
chcp 936
For /f "tokens=2,*" %%i in ('reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Shell Folders" /v "Desktop"') do Set dt=%%j
mshta vbscript:msgbox("你好 请先关闭需要激活的软件 然后点击确定继续",6,"米酷网络科技")(window.close)
ECHO 正在配置ToolBox的启动文件...
del %LOCALAPPDATA%\JetBrains\Toolbox\*.vmoptions /s /f /q /aH
del %LOCALAPPDATA%\JetBrains\Toolbox\*.key /s /f /q /aH
ping /n 2 127.0.0.1 >nul
ECHO 开始放置激活所需文件...
echo f|xcopy /r /c /h /q /s /e /i /y "%~dp0"micool_config\_auto  %windir%
ping /n 2 127.0.0.1 >nul
ECHO 开始逐个激活...
ping /n 2 127.0.0.1 >nul
ECHO 正在激活所有2017版本...
ping /n 2 127.0.0.1 >nul
ECHO 正在激活所有2018版本...
ping /n 2 127.0.0.1 >nul
ECHO 正在激活所有2019版本...
call echo d|xcopy /r /c /h /q /s /e /y "%~dp0"micool_config\JetBrainsold %HOMEPATH% 2>nul
ping /n 2 127.0.0.1 >nul
ECHO 正在激活所有2020版本...
ping /n 2 127.0.0.1 >nul
ECHO 正在激活所有2021版本...
ping /n 2 127.0.0.1 >nul
ECHO 正在激活所有2022版本...
call echo d|xcopy /r /c /h /q /s /e /y "%~dp0"micool_config\JetBrains %appdata%\JetBrains 2>nul
ping /n 3 127.0.0.1 >nul
@echo off
echo "请注意你的杀毒软件提示，一定要允许"
@echo  ########################################
@xcopy C:\Windows\system32\drivers\etc\hosts C:\Windows\system32\drivers\etc\hosts.bak\ /d /c /i /y 
@echo  ########################################
@echo  hosts文件备份完毕，开始修改hosts文件
@echo 0.0.0.0 account.jetbrains.com >>C:\Windows\System32\drivers\etc\hosts
@echo 0.0.0.0 oauth.account.jetbrains.com >>C:\Windows\System32\drivers\etc\hosts
@echo 0.0.0.0 jrebel.npegeek.com >>C:\Windows\System32\drivers\etc\hosts
echo   "hosts文件修改完成"
@ipconfig /flushdns
@echo   "刷新DNS完成"
call echo d|xcopy /r /c /h /q /s /e /i /y "%~dp0"micool_config\JetBrainscode" c:\激活码_备用 正常情况无需使用 2>nul
ECHO 激活成功！       By：米酷网络科技 别家买的是盗版 尽快退款
set msg="恭喜已经成功激活！\n重启软件生效\n如果未激活成功的话\n请使用备用方案或者拍下远程帮装"
mshta vbscript:msgbox(Replace(%msg%,"\n",vbCrLf),6,"米酷网络科技")(window.close)
set msg1="By:米酷网络科技\n别家买的是盗版 尽快退款\n\n给个带图好评哈！！！！！"
mshta vbscript:msgbox(Replace(%msg1%,"\n",vbCrLf),6,"米酷网络科技")(window.close)
pauses