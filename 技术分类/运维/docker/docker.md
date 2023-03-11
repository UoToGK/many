windows 改变 docker desktop 占用内存

在用户目录下建立.wslconfig 文件，写入
[wsl2]
memory=4GB
swap=0
localhostForwarding=true
在打开服务重启 LxssManager 服务

docker 镜像和容器区别：
容器就是镜像的一个实例，容器=镜像+可读写的层
镜像类似于模板，可以创建多个容器实例

# docker 常用命令

1. 删除容器：docker rm -f 容器 id
2. docker 创建容器： docker run -itd 容器 name<如果是自己命名的镜像，加上：tag 即可，否则会去仓库查找>
