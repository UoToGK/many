# onBeforeRequest（可以为同步）
当请求即将发出时产生。这一事件在 TCP 连接建立前发送，可以用来取消或重定向请求。
# onBeforeSendHeaders（可以为同步）
当请求即将发出并且初始标头已经准备好时产生。这一事件是为了使应用能够添加、修改和删除请求标头（*）。onBeforeSendHeaders 事件将传递给所有订阅者，所以不同的订阅者都可以尝试修改请求。有关具体如何处理的细节，请参见实现细节部分。这一事件可以用来取消请求。
# onSendHeaders
当所有应用已经修改完请求标头并且展现最终（*）版本时产生。这一事件在标头发送至网络前触发，仅用于提供信息，并且以异步方式处理，不允许修改或取消请求。
# onHeadersReceived（可以为同步）
每当接收到 HTTP(S) 响应标头时产生。由于重定向以及认证请求，对于每次请求这一事件可以多次产生。这一事件是为了使应用能够添加、修改和删除响应标头，例如传入的 Set-Cookie 标头。缓存指示是在该事件触发前处理的，所以修改 Cache-Control 之类的标头不会影响浏览器的缓存。它还允许您重定向请求。
# onAuthRequired（可以为同步）
当请求需要用户认证时产生。这一事件可以同步处理，提供认证凭据。注意，应用提供的凭据可能无效，注意不要重复提供无效凭据，陷入无限循环。
# onBeforeRedirect
当重定向即将执行时产生，重定向可以由 HTTP 响应代码或应用触发。这一事件仅用于提供信息，并以异步方式处理，不允许修改或取消请求。
# onResponseStarted
当接收到响应正文的第一个字节时产生。对于 HTTP 请求，这意味着状态行和响应标头已经可用。这一事件仅用于提供信息，并以异步方式处理，不允许修改或取消请求。
# onCompleted
当请求成功处理后产生。
# onErrorOccurred
当请求不能成功处理时产生。
网络请求 API 保证对于每一个请求，onCompleted 或 onErrorOccurred 是最终产生的事件，除了如下例外：如果请求重定向至 data:// URL，onBeforeRedirect 将是最后报告的事件。
（*）注意网络请求 API 向应用展现的是网络栈的一种抽象。单个 URL 请求在内部可以分割为几个 HTTP 请求（例如从一个大文件获取单独的字节范围）或者可以不与网络通信就由网络栈处理。由于这一原因，这一 API 不会提供最终发送至网络的的 HTTP 标头。例如，所有与缓存相关的标头对应用都是不可见的。

如下是当前不提供给 onBeforeSendHeaders 事件的标头列表，这一列表不保证是完整的或者不会变化：

# Authorization
# Cache-Control
# Connection
# Content-Length
# Host
# If-Modified-Since
# If-None-Match
# If-Range
# Partial-Data
# Pragma
# Proxy-Authorization
# Proxy-Connection
# Transfer-Encoding
只有应用具有相应的主机权限时，网络请求 API 才会暴露相关的请求。此外，只能访问下列协议的请求：http://、https://、ftp://、file:// 或 chrome-extension://。 此外，某些请求的 URL 即使使用了以上某种协议也会被隐藏。例如，chrome-extension://other_extension_id，其中 other_extension_id不是处理该请求的应用标识符；还有 https://www.google.com/chrome 及其他（该列表并不完整）。此外来自您的应用的同步 XMLHttpRequest 将对阻塞的事件处理函数隐藏，以免产生死锁。注意，对于一些支持的协议，由于对应协议本身的性质，可以产生的事件会受到限制。例如，对于 file: 协议，只会产生 onBeforeRequest、onResponseStarted、onCompleted 和 onErrorOccurred 事件。