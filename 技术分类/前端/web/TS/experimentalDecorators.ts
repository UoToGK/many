/** TypeScript的核心原则之一是对值所具有的结构进行类型检查 --接口
 * 装饰器（Decorators）为我们在类的声明及成员上通过元编程语法添加标注提供了一种方式。
 *
 *  target —— 当前对象的原型，也就是说，假设 Employee 是对象，那么 target 就是 Employee.prototype
propertyKey —— 方法的名称
descriptor —— 方法的属性描述符，即 Object.getOwnPropertyDescriptor(Employee.prototype, propertyKey)

 */
// 这是一个装饰器工厂——有助于将用户参数传给装饰器声明
function f() {
    console.log("f(): evaluated");
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        console.log("f(): called");
    }
}

function g() {
    console.log("g(): evaluated");
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        console.log("g(): called", target, propertyKey, descriptor);
    }
}

class C {
    @f()
    @g()
    method(a: string) {
        console.log(a)
    }
}

  // f(): evaluated
  // g(): evaluated
  // g(): called
  // f(): called
