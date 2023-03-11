/**
 * JavaScript(ES5)中实现继承的几种方法
 */

// 定义基类Person
function Person(name, age) {
    this.name = name;
    this.age = age;
}

// 共享数据
Person.prototype.LEGS_NUM = 2;

// 共享方法
Person.prototype.info = function () {
    console.log('My name is ' + this.name + ' .I\'m ' + this.age + ' years old now');
};

Person.prototype.walk = function () {
    console.log(this.name + ' is walking...');
};

// Student子类
function Student(name, age, className) {
    // 调用父类
    Person.call(this, name, age);
    this.className = className;
}

// 1⃣️ 方法一：Person.prototype直接赋值给Student.prototype
// Student.prototype = Person.prototype;

// 2⃣️ 方法二：Student.prototype为Person的实例
// Student.prototype = new Person();

// 3⃣️ 方法三：创建一个空对象，对象的原型指向Person.prototype，赋值给Student.prototype
Student.prototype = Object.create(Person.prototype);

Student.prototype.constructor = Student;

// 覆盖父类的info方法
Student.prototype.info = function () {
    console.log('My name is ' + this.name + ',I\'m ' + this.age + ' years old now, and from class ' + this.className + '.');
};

// Student类的共享方法
Student.prototype.learn = function (subject) {
    console.log(this.name + ' is learning ' + subject + '.');
};

// 测试,创建一个Student的实例
var microzz = new Student('Microzz', 22, 5);
microzz.info(); // My name is Microzz,I'm 22 years old now, and from class 5.
console.log(microzz.LEGS_NUM); // 2
microzz.walk(); // Microzz is walking...
microzz.learn('JavaScript'); // Microzz is learning JavaScript.
console.log(microzz.__proto__.__proto__ === Person.prototype); // true
console.log(microzz.__proto__ === Student.prototype); // true
console.log(microzz.__proto__.constructor === Student); // true

/**
 * 上面代码中有三种方法实现继承，现在我们可以来分析一下这几种方法。
1⃣️这种方法中，Person.prototype直接赋值给Student.prototype，但是有一个很严重的问题，如果子类prototype添加新的东西的话也会改写父类。
所以这种方法不推荐。
2⃣️第二种方法Student.prototype为Person的实例，这也是可以实现的。但是Person构造函数有参数应该传什么呢？传任何一个都是很奇怪的。所以也不推荐。
3⃣️第三种方法是比较理想的，创建一个空对象，对象的原型指向Person.prototype，赋值给Student.prototype。但是Object.create也有一点小瑕疵，
因为它是ES5之后才支持的，不过我们可以通过模拟实现Object.create方法。代码如下：
if (!Object.create) {
  Object.prototype.create = function (proto) {
    function F() {}
    F.prototype = proto;
    return new F;
  }
}
 */