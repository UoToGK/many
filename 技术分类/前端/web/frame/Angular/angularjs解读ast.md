- Lexer = >把字符串解析成 tokens 数组，如"a+b" =>[a,+,b]
- AST Builder 把这个 tokens 变成 AST 语法树
- AST Compiler 把这个语法树变成一个 JavaScript Function 执行
- Parser 就是合并这些步骤，在这个 function 上面添加 prototype

```js
var fn = new Function(
  "$filter", //生成一个匿名函数
  "ensureSafeMemberName",
  "ensureSafeObject",
  "ensureSafeFunction",
  "getStringValue",
  "ensureSafeAssignContext",
  "ifDefined",
  "plus",
  "text",
  fnString
)(
  //fn为函数体
  this.$filter,
  ensureSafeMemberName,
  ensureSafeObject,
  ensureSafeFunction,
  getStringValue,
  ensureSafeAssignContext,
  ifDefined,
  plusFn,
  expression
);
```
