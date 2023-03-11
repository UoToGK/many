<!--
 * @Author: UoToGK
 * @LastEditors: DyTheme
 * @Date: 2022-03-14 14:36:51
 * @LastEditTime: 2022-03-17 08:00:12
 * @description:
 * @Copyright(c): DyTheme
-->

windows 系统下 vscode 更改默认终端为 bash 之后，关于无法自动激活 anaconda 环境的记录

只需要更改 bash。bashrc 这个配置文件，在文件最后加入一句 source activate 即可解决
