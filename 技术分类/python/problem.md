(解决python3 UnicodeEncodeError: 'gbk' codec can't encode character '\xXX' in position XX)[https://blog.csdn.net/jim7424994/article/details/22675759]
忽略python   import 顺序自动调整
"python.formatting.autopep8Args": ["--ignore", "E402"]


我们知道，if 语句是判断语句，当==条件为true时，才会 执行if语句。否者它不执行。

so ，这没什么用，它到底是干什么的，让我们分开来讲：

__name__是一个变量。前后加了双下划线是因为是因为这是系统定义的名字。普通变量不要使用此方式命名变量。
Python有很多模块，而这些模块是可以独立运行的！这点不像C++和C的头文件。
import的时候是要执行所import的模块的。
__name__就是标识模块的名字的一个系统变量。这里分两种情况：假如当前模块是主模块（也就是调用其他模块的模块），那么此模块名字就是__main__，通过if判断这样就可以执行“__mian__:”后面的主函数内容；假如此模块是被import的，则此模块名字为文件名字（不加后面的.py），通过if判断这样就会跳过“__mian__:”后面的内容。