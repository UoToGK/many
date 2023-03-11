/**
 * 惰性函数
 * 在这个惰性载入的createXHR()中，if 语句的每一个分支都会为createXHR 变量赋值，有效覆
盖了原有的函数。最后一步便是调用新赋的函数。下一次调用createXHR()的时候，就会直接调用被
分配的函数，这样就不用再次执行if 语句了。
第二种实现惰性载入的方式是在声明函数时就指定适当的函数。这样，第一次调用函数时就不会损
失性能了，而在代码首次加载时会损失一点性能
 */
function createXHR() {
  if (typeof XMLHttpRequest != "undefined") {
    createXHR = function () {
      return new XMLHttpRequest();
    };
  } else if (typeof ActiveXObject != "undefined") {
    createXHR = function () {
      if (typeof arguments.callee.activeXString != "string") {
        var versions = [
          "MSXML2.XMLHttp.6.0",
          "MSXML2.XMLHttp.3.0",
          "MSXML2.XMLHttp"
        ],
          i,
          len;
        for (i = 0, len = versions.length; i < len; i++) {
          try {
            new ActiveXObject(versions[i]);
            arguments.callee.activeXString = versions[i];
            break;
          } catch (ex) {
            //skip
          }
        }
      }
      return new ActiveXObject(arguments.callee.activeXString);
    };
  } else {
    createXHR = function () {
      throw new Error("No XHR object available.");
    };
  }
  return createXHR();
}
/**
 * ############# 2 ####################
 */
var createXHR = (function () {
  if (typeof XMLHttpRequest != "undefined") {
    return function () {
      return new XMLHttpRequest();
    };
  } else if (typeof ActiveXObject != "undefined") {
    return function () {
      if (typeof arguments.callee.activeXString != "string") {
        var versions = [
          "MSXML2.XMLHttp.6.0",
          "MSXML2.XMLHttp.3.0",
          "MSXML2.XMLHttp"
        ],
          i,
          len;
        for (i = 0, len = versions.length; i < len; i++) {
          try {
            new ActiveXObject(versions[i]);
            arguments.callee.activeXString = versions[i];
            break;
          } catch (ex) {
            //skip
          }
        }
      }
      return new ActiveXObject(arguments.callee.activeXString);
    };
  } else {
    return function () {
      throw new Error("No XHR object available.");
    };
  }
})();

// ################################ 函数绑定技巧 #######################
/**
 * 另一个日益流行的高级技巧叫做函数绑定。函数绑定要创建一个函数，可以在特定的this 环境中
以指定参数调用另一个函数。该技巧常常和回调函数与事件处理程序一起使用，以便在将函数作为变量
传递的同时保留代码执行环境。请看以下例子：

var handler = {
message: "Event handled",
handleClick: function(event){
alert(this.message);
}
};
var btn = document.getElementById("my-btn");
EventUtil.addHandler(btn, "click", handler.handleClick);

在上面这个例子中，创建了一个叫做handler 的对象。handler.handleClick()方法被分配为
一个DOM 按钮的事件处理程序。当按下该按钮时，就调用该函数，显示一个警告框。虽然貌似警告框
应该显示Event handled ， 然而实际上显示的是undefiend 。这个问题在于没有保存
handler.handleClick()的环境，所以this 对象最后是指向了DOM按钮而非handler（在IE8 中，
this 指向window。）可以如下面例子所示，使用一个闭包来修正这个问题。

var handler = {
message: "Event handled",
handleClick: function(event){
alert(this.message);
}
};
var btn = document.getElementById("my-btn");
EventUtil.addHandler(btn, "click", function(event){
handler.handleClick(event);
});

这个解决方案在onclick 事件处理程序内使用了一个闭包直接调用handler.handleClick()。
当然，这是特定于这段代码的解决方案。创建多个闭包可能会令代码变得难于理解和调试。因此，很多
JavaScript 库实现了一个可以将函数绑定到指定环境的函数。这个函数一般都叫bind()。
一个简单的bind()函数接受一个函数和一个环境，并返回一个在给定环境中调用给定函数的函数，
并且将所有参数原封不动传递过去。语法如下：

function bind(fn, context){
return function(){
return fn.apply(context, arguments);
};
}

这个函数似乎简单，但其功能是非常强大的。在bind()中创建了一个闭包，闭包使用apply()调
用传入的函数，并给apply()传递context 对象和参数。注意这里使用的arguments 对象是内部函
数的，而非bind()的。当调用返回的函数时，它会在给定环境中执行被传入的函数并给出所有参数。
 */


