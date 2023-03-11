# 选择前几个元素
- /*【负方向范围】选择第1个到第6个 */
:nth-child(-n+6){}

从第几个开始选择
/*【正方向范围】选择从第6个开始的 */
:nth-child(n+6){}
 

两者结合使用，可以限制选择某一个范围

/*【限制范围】选择第6个到第9个，取两者的交集【感谢小伙伴的纠正~】 */
:nth-child(-n+9):nth-child(n+6){}
 

#Ulist li:nth-of-type(odd){ margin-left: 20px;}奇数行   
#Ulist li:nth-of-type(even){margin-left: 10px;}偶数行   

# [getDomPath()](./doc/getDomPath.js)