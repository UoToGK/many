/** 
run(fucArr)
// 实现一个run方法,使得run(fucArr)能顺序输出1、2、3.

var run = arr => {
    if (arr.length === 0) return;
    arr[0](() => run(arr.slice(1)));

}
// 2
var run = arr => {
	const trigger = () => {
		if (arr.length === 0) return;
		arr.shift()();
	}
}

// 3
var run = arr => {
	const trigger = () => {
		if (arr.length === 0) return;
		arr.shift()();
	}
	arr = arr.map(val => {
		return () => new Promise(resolve => {
			val(resolve)
		}).then(trigger);
	})
	trigger();
}


run(fucArr)
*/
const middleware1 = (req, res, next) => {
  console.log('middleware1 start')
  next()
}

const middleware2 = (req, res, next) => {
  console.log('middleware2 start')
  next()
}

const middleware3 = (req, res, next) => {
  console.log('middleware3 start')
  next()
}

// 中间件数组
const middlewares = [middleware1, middleware2, middleware3]

function run(req, res) {
  const next = () => {
    // 获取中间件数组中第一个中间件
    const middleware = middlewares.shift()
    if (middleware) {
      middleware(req, res, next)
    }
  }
  next()
}
run()
// ps 如果中间件中有异步操作，需要在异步操作的流程结束后再调用next()方法，否则中间件不能按顺序执行。
const middleware2 = (req, res, next) => {
  console.log('middleware2 start')
  new Promise(resolve => {
    setTimeout(() => resolve(), 1000)
  }).then(() => {
    next()
  })
}

/**
 * 有些中间件不止需要在业务处理前执行，还需要在业务处理后执行，
 * 比如统计时间的日志中间件。在方式一情况下，无法在next()为异步操作时再将当前中间件的其他代码作为回调执行。
 * 因此可以将next()方法的后续操作封装成一个Promise对象，中间件内部就可以使用next.then()形式完成业务处理结束后的回调。改写run()方法如下
 */

function run(req, res) {
  const next = () => {
    const middleware = middlewares.shift()
    if (middleware) {
      // 将middleware(req, res, next)包装为Promise对象
      return Promise.resolve(middleware(req, res, next))
    }
  }
  next()
}

//中间件的调用方式需改写为
const middleware1 = (req, res, next) => {
  console.log('middleware1 start')
  // 所有的中间件都应返回一个Promise对象
  // Promise.resolve()方法接收中间件返回的Promise对象，供下层中间件异步控制
  return next().then(() => {
    console.log('middleware1 end')
  })
}


var myString = 'aaabcdeeeghhhffiooo';

function maxRepeactString(str) {
  //定义一个对象，对象的每个属性是出现连续重复的字符，属性的属性值是该字符重复的个数
  var res = {};
  for (var i = 0, j = i + 1; i < str.length; i++) {
    while (str[i] == str[j]) {
      j++;
      res[str[i]] = j - i;
    }
  }
  return res;
}
console.log(maxRepeactString(myString));

var maxnum = 0,
  maxname;
var strmore = maxRepeactString(myString);
console.log(strmore);
//找出第一个最长重复字符的字符
for (var item in strmore) {
  if (strmore[item] > maxnum) {
    maxnum = strmore[item];
    maxname = item;
  }
}

//找出其他的重复出现maxnum次数的字符,存入nameStr中
var nameStr = [];
for (var i in strmore) {
  if (strmore[i] === maxnum) {
    var str = '';
    for (var k = 0; k < maxnum; k++) {
      str += i;
    }
    nameStr.push(str);
  }
}
console.log('存在最长的' + maxnum + '次重复的字符有' + nameStr);



/**
 *如果是一个不连续的字符又该如何？eg： aababdfkffddaaabbauyklbbbbbbbaaaaa
 统计字符
 */
var str = "aababdfkffddaaabbauyklbbbbbbbaaaaa";
var str = "aaabcdeeeghhhffiooo"
var obj = {};
var array = str.split('');


for (let index = 0; index < array.length; index++) {
  const element = array[index];

  if (obj.hasOwnProperty(array[index])) {
    obj[array[index]]++

  } else {
    obj[element] = 1;
  }

}
console.log(obj);

// 实现a==5&&a==8 https://github.com/Wscats/CV/issues/28
class A {
  constructor(value) {
    this.value = value;
  }
  valueOf() {
    return this.value = this.value + 3;
  }
  // toString() {
  //     return this.value = this.value + 3;
  // }
}
const a = new A(2);
if (a == 5 && a == 8) {
  console.log("Hi Eno!");
}
