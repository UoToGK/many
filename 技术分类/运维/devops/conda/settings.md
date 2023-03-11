- 有时候我们希望命令行启动的 python 是自定义的，而不是 base 或者 root 的，linux 设置如下
  在 linux 下，通过修改~/.bashrc 或~/.bash_profile，最后面添加

```
export PATH="~/anaconda/envs/your_env_name/bin:$PATH" # your_env_name 是你自定义的环境名
```

- 还有的时候，你希望命令行默认激活你想要的环境，linux 设置如下
  修改~/.bashrc，添加<powershell 在 WindowsPowerShell\profile.ps1 中修改>

```powershell
conda activate your_env_name # "your_env_name"就是你的环境名
```

- 还有的时候，你安装的 anaconda 环境默认启动 base 环境，想要关闭，linux 设置如下

```powershell
conda config --set auto_activate_base false # 设置非自动启动
```
