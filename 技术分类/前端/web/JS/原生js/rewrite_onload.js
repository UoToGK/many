// 添加window.onload事件
function addLoadEvent(func) {
  var oldonload = window.onload;
  if (typeof window.onload != "function") {
    window.onload = func;
  } else {
    window.onload = function() {
      if (oldonload) {
        oldonload();
      }
      func();
    };
  }
}
// 添加form.onsubmit提交事件
function addSubmitEvent(func) {
  //var oldSubmit;
  var forms = document.forms;
  for (var i = 0; i < forms.length; i++) {
    //备份submit函数
    var oldSubmit = forms[i].onsubmit;
    if (typeof forms[i].onsubmit != "function") {
      forms[i].onsubmit = func;
    } else {
      forms[i].onsubmit = function() {
        func();
        //掉原函数来提交
        if (oldSubmit) oldSubmit();
        return true;
      };
    }
  }
}

