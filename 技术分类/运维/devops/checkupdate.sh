#!/bin/sh
echo "--------------------------------"
echo "----------开始执行脚本------------"
date
pwd;
# BRANCH=release
branch_arr=("release" "develop")
need_check_dir=(
"/d/company_project/project_policy_last_priority"
# "/d/company_project/project_policy_suboptimal"
# "/d/company_project/project_page_post"
# "/d/company_project/project_information"
# "/d/company_project/project_page_bak"
)
for BRANCH in ${branch_arr[*]}
do
        for var in ${need_check_dir[@]}
        do
        echo "切换到git目录"
        cd $var;
        path=`pwd`
        echo $path
        if [ "$path" == "$var" ]
        then
                echo "目录:$path 切换成功，检查BRANCH:$BRANCH 是否需要更新"
                LOCAL=$(git log $BRANCH -n 1 --pretty=format:"%H")
                echo $LOCAL
                REMOTE=$(git log remotes/origin/$BRANCH -n 1 --pretty=format:"%H")
                echo $REMOTE
                if [ $LOCAL = $REMOTE ]
                then
                        echo "Up-to-date"
                else
                        echo "Need update"
                        git checkout $BRANCH;
                        git pull;
                fi
        else
                echo "目录切换失败，退出程序"
                exit 0;
        fi
        done
done
echo "----------结束执行脚本------------"
echo "--------------------------------"