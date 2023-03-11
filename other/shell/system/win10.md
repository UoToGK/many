+ 开启上帝模式：cmd 输入 shell:::{ED7BA470-8E54-465E-825C-99712043E01C}；
####### 开启卓越性能：
<tr>如果你已经升级到Win10 1803（2018年4月更新），那么只需运行下面的命令即可导入“卓越性能”电源计划：</tr>

以管理员身份运行 Windows Powershell ，运行命令：

+ powercfg -duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61

如果不是需要下早。pow文件导入电源方案，在百度win10文件夹下
删除win10自带应用  win + x 进入管理员power shell界面 1。Get-AppxPackage -AllUsers
                                                                                    2.Get-AppxPackage -AllUsers | Remove-AppxPackage 

开启/关闭 windows Defender     cmd-->regedit-->\HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Windows Defender   修改DisableAntiSpyware
--->值为0 close ||  值为1   open
###########################################################################
##   添加右键获取管理员权限
Windows Registry Editor Version 5.00

;取得文件修改权限 

[HKEY_CLASSES_ROOT\*\shell\runas] 

@="管理员权限"

"Icon"="C:\\Windows\\System32\\imageres.dll,102"

"NoWorkingDirectory"=""

[HKEY_CLASSES_ROOT\*\shell\runas\command] 

@="cmd.exe /c takeown /f \"%1\" && icacls \"%1\" /grant administrators:F"

"IsolatedCommand"="cmd.exe /c takeown /f \"%1\" && icacls \"%1\" /grant administrators:F"

[HKEY_CLASSES_ROOT\exefile\shell\runas2] 

@="管理员权限"

"Icon"="C:\\Windows\\System32\\imageres.dll,102"

"NoWorkingDirectory"=""

[HKEY_CLASSES_ROOT\exefile\shell\runas2\command] 

@="cmd.exe /c takeown /f \"%1\" && icacls \"%1\" /grant administrators:F"

"IsolatedCommand"="cmd.exe /c takeown /f \"%1\" && icacls \"%1\" /grant administrators:F"

[HKEY_CLASSES_ROOT\Directory\shell\runas] 

@="管理员权限"

"Icon"="C:\\Windows\\System32\\imageres.dll,102"

"NoWorkingDirectory"=""

[HKEY_CLASSES_ROOT\Directory\shell\runas\command] 

@="cmd.exe /c takeown /f \"%1\" /r /d y && icacls \"%1\" /grant administrators:F /t"

"IsolatedCommand"="cmd.exe /c takeown /f \"%1\" /r /d y && icacls \"%1\" /grant administrators:F /t"
takeown /f * /a /r /d y

rem #强制将当前目录下的所有文件及文件夹、子文件夹下的所有者更改为管理员组(administrators)命令：

rem cacls d:documents*.* /T /G administrators:F

rem #将所有d:documents目录下的文件、子文件夹的NTFS权限修改为仅管理员组(administrators)完全控制(删除原有所有NTFS权限设置)：

rem cacls d:documents*.* /T /E /G administrators:F

rem #在原有d:documents目录下的文件、子文件夹的NTFS权限上添加管理员组(administrators)完全控制权限(并不删除原有所有NTFS权限设置)：

rem cacls ServerDocuments%username%我的文档 /t /e /r "mddqdomain admins"

rem cacls ServerDocuments%username%桌面 /t /e /r "mddqdomain admins"

rem #取消管理员组(administrators)完全控制权限(并不删除原有所有NTFS权限设置)：
#####
