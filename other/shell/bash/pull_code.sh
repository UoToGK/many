# 注意：需要先配置好git账户密码  git config --global credential.helper store
echo "--------------------------------"
echo "----------开始执行脚本----------"
date
pwd;
echo "切换到git目录"
##切换到放置git代码的目录绝对路径
cd /home/ops/projects/project_information;
path=`pwd`
echo $path
if [ "$path" == "/home/ops/projects/project_information" ]
then
        echo "目录切换成功，准备拉取最新代码"
else
        echo "目录切换失败，退出程序"
        exit 0;
fi
git pull;
echo "切换到git第二个目录"
##切换到放置git代码的目录绝对路径
cd /home/ops/projects/project_policy_last_priority;
path=`pwd`
echo $path
if [ "$path" == "/home/ops/projects/project_policy_last_priority" ]
then
        echo "目录切换成功，准备拉取最新代码"
else
        echo "目录切换失败，退出程序"
        exit 0;
fi
git pull;
# echo "准备构建项目 docker restart  policy_last_priority"
# docker restart  policy_last_priority;
# ##切换到需要更新的项目目录
# cd /home/ops/projects/project_policy_last_priority;
# pwd
# path=`pwd`
# if [ "$path" == "/home/ops/projects/project_policy_last_priority" ]
# then
#         echo "目录切换成功，删除旧文件"
#         rm -rf *
#         ls;
# else
#         echo "目录切换失败，退出程序"
#         exit 0;
# fi
# echo "移动新文件"
# ##将最新代码打包的文件复制到项目目录
# cp -r /www/wwwroot/ip/myGiteeCode/myProject/dist/{index.html,js,css,favicon.ico,fonts,img} ./;
# echo "更新成功"
# ls;
# date
echo "----------结束执行脚本----------"
