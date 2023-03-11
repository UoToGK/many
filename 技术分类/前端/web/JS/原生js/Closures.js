/** https://segmentfault.com/a/1190000011504517
 * 词法作用域中使用的域，是变量在代码中声明的位置所决定的。嵌套的函数可以访问在其外部声明的变量。
 *
 * init() 创建了一个局部变量 name 和一个名为 displayName() 的函数。displayName() 是定义在 init() 里的内部函数，
 * 仅在该函数体内可用。displayName() 内没有自己的局部变量，然而它可以访问到外部函数的变量，所以 displayName() 可以使用父函数 init()
 * 中声明的变量 name 。但是，如果有同名变量 name 在 displayName() 中被定义，则会使用 displayName() 中定义的 name 。
 */
function init() {
  var name = 'Mozilla'; // name 是一个被 init 创建的局部变量
  function displayName() {
    // displayName() 是内部函数,一个闭包
    alert(name); // 使用了父函数中声明的变量
  }
  displayName();
}
init();

// ####################################################################################################
// ####################################################################################################

function makeFunc() {
  var name = "Mozilla";
  var age = 12;
  function displayName() {

    console.log(name, age + 1);
  }
  age = null;
  return displayName;//displayName就是闭包
}

var myFunc = makeFunc();
myFunc(); //这里的age能访问到吗，或者说age是被销毁了吗

// 能访问，也没有被销毁，因为有闭包的存在，闭包包涵了该函数以及该函数的词法环境，这个环境中包含了闭包创建时的所能访问的所有局部变量
// 只不过现在displayName没有去访问age而已，变量是存在的，也分配了内存，操作它仍然是直接在内存中（可以在displayNmae中加参数验证）
/**
 * 运行这段代码和之前的 init() 示例的效果完全一样。其中的不同 — 也是有意思的地方 — 在于内部函数 displayName() 在执行前，被外部函数返回。
第一眼看上去，也许不能直观的看出这段代码能够正常运行。在一些编程语言中，函数中的局部变量仅在函数的执行期间可用。一旦 makeFunc() 执行完毕，
我们会认为 name 变量将不能被访问。然而，因为代码运行得没问题，所以很显然在 JavaScript 中并不是这样的。
这个谜题的答案是，JavaScript中的函数会形成闭包。 闭包是由函数以及创建该函数的词法环境组合而成。
这个环境包含了这个闭包创建时所能访问的所有局部变量。在我们的例子中，myFunc 是执行 makeFunc 时创建的 displayName 函数实例的引用，
而 displayName 实例仍可访问其词法作用域中的变量，即可以访问到 name 。由此，当 myFunc 被调用时，name 仍可被访问，
其值 Mozilla 就被传递到alert中。
 */

function A(i) {
  console.log(i);

}

function B() {
  for (var i = 0; i < 4; i++) {
    // A(i)
    /**i am closures0
    i am closures1
    i am closures2
    i am closures3 */
    // 如果here是一个一部函数呢
    setTimeout(A, 1000, i)
  }
}
B()

global.k = 9
function F() {
  var i = 9;
  /**
   * 使用Function构造器生成的函数，并不会在创建它们的上下文中创建闭包；它们一般在全局作用域中被创建。当运行这些函数的时候，
   * 它们只能访问自己的本地变量和全局变量，不能访问Function构造器被调用生成的上下文的作用域。这和使用带有函数表达式代码的 eval 不同
   * 此时 k可以访问，但是i就不行
   */
  var sum = new Function('a', 'b', 'return a+b+k');
  return sum;
}
var sum = F();
console.log(sum(1, 2));

var b = 10;
(function b() {
  "use strict"
  var b = 20;
  console.log(b)// use strict TypeError :Assignment to constant variable.
  // not strict print Function b
}())

var a = 1;

function foo() {
  console.log(a);
}

foo();
//   foo 函数可以访问变量 a，但是 a 既不是 foo 函数的局部变量，也不是 foo 函数的参数，所以 a 就是自由变量。

//   那么，函数 foo + foo 函数访问的自由变量 a 不就是构成了一个闭包嘛……
/**
 * 从实践角度：以下函数才算是闭包：
    即使创建它的上下文已经销毁，它仍然存在（比如，内部函数从父函数中返回）
    在代码中引用了自由变量


    让我们先写个例子，例子依然是来自《JavaScript权威指南》，稍微做点改动：

var scope = "global scope";
function checkscope(){
    var scope = "local scope";
    function f(){
        return scope;
    }
    return f;
}

var foo = checkscope();
foo();
首先我们要分析一下这段代码中执行上下文栈和执行上下文的变化情况。

另一个与这段代码相似的例子，在《JavaScript深入之执行上下文》中有着非常详细的分析。如果看不懂以下的执行过程，建议先阅读这篇文章。

这里直接给出简要的执行过程：

进入全局代码，创建全局执行上下文，全局执行上下文压入执行上下文栈
全局执行上下文初始化
执行 checkscope 函数，创建 checkscope 函数执行上下文，checkscope 执行上下文被压入执行上下文栈
checkscope 执行上下文初始化，创建变量对象、作用域链、this等
checkscope 函数执行完毕，checkscope 执行上下文从执行上下文栈中弹出
执行 f 函数，创建 f 函数执行上下文，f 执行上下文被压入执行上下文栈
f 执行上下文初始化，创建变量对象、作用域链、this等
f 函数执行完毕，f 函数上下文从执行上下文栈中弹出
了解到这个过程，我们应该思考一个问题，那就是：

当 f 函数执行的时候，checkscope 函数上下文已经被销毁了啊(即从执行上下文栈中被弹出)，怎么还会读取到 checkscope 作用域下的 scope 值呢？

以上的代码，要是转换成 PHP，就会报错，因为在 PHP 中，f 函数只能读取到自己作用域和全局作用域里的值，所以读不到 checkscope 下的 scope 值。(这段我问的PHP同事……)

然而 JavaScript 却是可以的！

当我们了解了具体的执行过程后，我们知道 f 执行上下文维护了一个作用域链：

fContext = {
    Scope: [AO, checkscopeContext.AO, globalContext.VO],
}
对的，就是因为这个作用域链，f 函数依然可以读取到 checkscopeContext.AO 的值，说明当 f 函数引用了 checkscopeContext.AO 中的值的时候，即使 checkscopeContext 被销毁了，但是 JavaScript 依然会让 checkscopeContext.AO 活在内存中，f 函数依然可以通过 f 函数的作用域链找到它，正是因为 JavaScript 做到了这一点，从而实现了闭包这个概念。

所以，让我们再看一遍实践角度上闭包的定义：

即使创建它的上下文已经销毁，它仍然存在（比如，内部函数从父函数中返回）
在代码中引用了自由变量
 */
