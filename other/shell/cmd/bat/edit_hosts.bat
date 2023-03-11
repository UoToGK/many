@REM echo "请注意你的杀毒软件提示，一定要允许" 右键以管理员身份运行
@echo  ########################################
@xcopy C:\Windows\system32\drivers\etc\hosts C:\Windows\system32\drivers\etc\hosts.bak\ /d /c /i /y 
@echo  ########################################
@echo  hosts文件备份完毕，开始修改hosts文件
@echo 0.0.0.0 www.bilibili.com >>C:\Windows\System32\drivers\etc\hosts
echo   "hosts文件修改完成"
@ipconfig /flushdns
@echo   "刷新DNS完成"