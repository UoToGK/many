Set WshShell = WScript.CreateObject("WScript.Shell")
strDesktop = WshShell.SpecialFolders("Desktop")
set oShellLink = WshShell.CreateShortcut(strDesktop & "\BaiduNetdisk.lnk")
oShellLink.TargetPath = "E:\software\BaiduNetdisk\baidunetdisk.exe"
oShellLink.WindowStyle = 3
' oShellLink.Hotkey = "Ctrl+Alt+e"
oShellLink.IconLocation = "E:\software\BaiduNetdisk\baidunetdisk.exe,0"
oShellLink.Description = "快捷方式"
oShellLink.WorkingDirectory = "E:\software\BaiduNetdisk"
oShellLink.Save