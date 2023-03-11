```js
function changeStuff(a, b, c) {
				a = a * 10;
				b.item = 'changed';
				c = { item: 'changed' };
			}

			var num = 10;
			var obj1 = { item: 'unchanged' };
			var obj2 = { item: 'unchanged' };

			changeStuff(num, obj1, obj2);

			console.log(num);//10
			console.log(obj1.item);//changed
            console.log(obj2.item);//unchanged
```
#### explain
- 如果它是纯传递值，那么更改obj1.item对函数外部的obj1没有影响。
- 如果它是纯引用传递的，那么一切都会发生变化。num为100，obj2.item为“changed”。
- 相反，情况是传入的项是按值传递的。但通过值传递的项本身就是一个引用。从技术上讲，这叫做共享引用。
- 实际上，这意味着，如果更改参数本身（如num和obj2），则不会影响输入参数的项。但是，如果您更改了参数的内部结构，这将传播回原来的状态（就像obj1一样）。

```js
var a = 2;
var b = a; // `b` is always a copy of the value in `a`
b++;
a; // 2
b; // 3

var c = [1,2,3];
var d = c; // `d` is a reference to the shared `[1,2,3]` value
d.push( 4 );
c; // [1,2,3,4]
d; // [1,2,3,4]
```

```js
var a = [1,2,3];
var b = a;
a; // [1,2,3]
b; // [1,2,3]

// later
b = [4,5,6];
a; // [1,2,3]
b; // [4,5,6]
```