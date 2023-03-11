Windows Registry Editor Version 5.00

; 删除 3D Objects
[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\FolderDescriptions\{31C0DD25-9439-4F12-BF41-7FF4EDA38722}\PropertyBag]
"ThisPCPolicy"="Hide"

[HKEY_LOCAL_MACHINE\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Explorer\FolderDescriptions\{31C0DD25-9439-4F12-BF41-7FF4EDA38722}\PropertyBag]
"ThisPCPolicy"="Hide"

; 删除 右键菜单 固定到“快速访问” 选项
[HKEY_CLASSES_ROOT\Folder\shell\pintohome]
"Extended"=""

; 删除 右键菜单中 用 3D 画图编辑 选项
[-HKEY_LOCAL_MACHINE\SOFTWARE\Classes\SystemFileAssociations\.jpg\Shell\3D Edit]

[-HKEY_LOCAL_MACHINE\SOFTWARE\Classes\SystemFileAssociations\.jpeg\Shell\3D Edit]

[-HKEY_LOCAL_MACHINE\SOFTWARE\Classes\SystemFileAssociations\.png\Shell\3D Edit]

[-HKEY_LOCAL_MACHINE\SOFTWARE\Classes\SystemFileAssociations\.gif\Shell\3D Edit]

[-HKEY_LOCAL_MACHINE\SOFTWARE\Classes\SystemFileAssociations\.bmp\Shell\3D Edit]

; 删除右键 Modern 共享
[-HKEY_CLASSES_ROOT\*\shellex\ContextMenuHandlers\ModernSharing]

; 删除文件夹\驱动器右键共享
[-HKEY_CLASSES_ROOT\Directory\shellex\ContextMenuHandlers\Sharing]

[-HKEY_CLASSES_ROOT\Directory\background\shellex\ContextMenuHandlers\Sharing]

[-HKEY_CLASSES_ROOT\Drive\shellex\ContextMenuHandlers\Sharing]

; 删除右键包含到库
[-HKEY_CLASSES_ROOT\Folder\shellex\ContextMenuHandlers\Library Location]

; 删除 导航栏中的 OneDrive 最新版 1803 中，直接卸载掉 OneDrive 即可，会自动删除该条注册表
; [HKEY_CLASSES_ROOT\CLSID\{018D5C66-4533-4307-9B53-224DE2ED1FE6}\ShellFolder]

; 删除右键菜单 兼容性疑难解答
[-HKEY_CLASSES_ROOT\exefile\shellex\ContextMenuHandlers\Compatibility]

; Win10 启用 Windows 照片查看器
[HKEY_CURRENT_USER\Software\Classes\.jpg]
@="PhotoViewer.FileAssoc.Tiff"

[HKEY_CURRENT_USER\Software\Classes\.jpeg]
@="PhotoViewer.FileAssoc.Tiff"

[HKEY_CURRENT_USER\Software\Classes\.gif]
@="PhotoViewer.FileAssoc.Tiff"

[HKEY_CURRENT_USER\Software\Classes\.png]
@="PhotoViewer.FileAssoc.Tiff"

[HKEY_CURRENT_USER\Software\Classes\.bmp]
@="PhotoViewer.FileAssoc.Tiff"

[HKEY_CURRENT_USER\Software\Classes\.tiff]
@="PhotoViewer.FileAssoc.Tiff"

[HKEY_CURRENT_USER\Software\Classes\.ico]
@="PhotoViewer.FileAssoc.Tiff"

步骤：

一、点击左下角“开始”菜单

二、点击“运行”打开运行窗口

三、输入“regedit”后点击“确定”按钮打开注册表

四、依次展开 HKEY_CLASSES_ROOT\*\shellex\ContextMenuHandlers

       在Context MenuHandlers展开项中找到要删除的无用项，然后右键点击该项删除，即可清除右键菜单中的对应选项。

五、依次展开 HKEY_CLASSES_ROOT\Folder\shell

       在shell展开项中找到要删除的无用项，然后右键点击该项删除，即可清除右键菜单中的对应选项。

六、依次展开 HKEY_CLASSES_ROOT\Folder\shellex\ContextMenuHandlers

       在ContextMenuHandlers展开项中找到要删除的无用项，然后右键点击该项删除，即可清除右键菜单中的对应选项。

七、依次展开 HKEY_CLASSES_ROOT\Directory\shell

       在shell展开项中找到要删除的无用项，然后右键点击该项删除，即可清除右键菜单中的对应选项。

八、依次展开 HKEY_CLASSES_ROOT\Directory\shellex\ContextMenuHandlers

       并在ContextMenuHandlers展开项中找到要删除的无用项，然后右键点击该项删除，即可清除右键菜单中的对应选项。

# 自定义右键菜单选项

通过快捷键“win+r”，弹出运行框，输入 regedit 。如下图所示：
在这里插入图片描述
在打开的注册表编辑器中，找到 HKEY_CLASSES_ROOT\Directory\Background\shell。如下图所示：在这里插入图片描述
编辑新菜单
编辑自定义菜单名称。选中“shell”，右键-新建-项，然后自定义新建的项的名称，例如，自定义为 Cmder。如下图所示：在这里插入图片描述
编辑自定义菜单图标。以上面新建的项 Cmder 为例。选中“Cmder”，右键-新建-字符串值。然后重命名新建的字符串值为 icon，并设置 icon 的数据为图标的路径，这里设置为：D:\devTools\cmder\icons\cmder.ico。如下图所示：在这里插入图片描述
编辑自定义菜单启动路径。以上面新建的项 Cmder 为例。选中“Cmder”，右键-新建-项，然后把新建的项重命名为 command，并设置 command 的默认字符串值为 Cmder 的启动路径。这里设置为：“D:\devTools\cmder\Cmder.exe”。如下图所示：
