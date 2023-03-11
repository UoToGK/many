@echo  ########################################
@xcopy C:\Windows\system32\drivers\etc\hosts C:\Windows\system32\drivers\etc\hosts.bak\ /d /c /i /y
@echo  ########################################
@echo  hosts文件备份完毕,开始修改hosts文件
@echo 0.0.0.0 account.jetbrains.com >>C:\Windows\System32\drivers\etc\hosts
@echo 0.0.0.0 oauth.account.jetbrains.com >>C:\Windows\System32\drivers\etc\hosts
@echo 0.0.0.0 jrebel.npegeek.com >>C:\Windows\System32\drivers\etc\hosts
@echo 增加禁止bilibili,douyin,4399
@echo 0.0.0.0 www.bilibili.com >>C:\Windows\System32\drivers\etc\hosts
@echo 0.0.0.0 www.4399.com >>C:\Windows\System32\drivers\etc\hosts
@echo 0.0.0.0 www.douyin.com >>C:\Windows\System32\drivers\etc\hosts
echo   "hosts文件修改完成"
@ipconfig /flushdns
@echo   "刷新DNS完成"