git https 一次输入用户名密码，下次无须输入
git config --global credential.helper store --file ~/.my-credentials
create ~/.git-credentials 文件
虚拟环境需要退出再进入才会生效

# keep remote files
git merge --strategy-option theirs
# keep local files
git merge --strategy-option ours
