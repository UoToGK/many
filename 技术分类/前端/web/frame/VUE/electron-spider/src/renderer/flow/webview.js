let EventEmitter = require('events');
//在默认情况下，同一个指定的事件，最多可以绑定10个事件处理函数。
const MaxListener = 10;
/**
 * 拦截document事件
 * 并且将该dom下的所有iframe事件也做封装
 * 使事件通过 `events.EventEmitter` 来代理发送
 * 除非dom上绑定属性 `allowed = true`的事件,其它都不允许触发任何事件
 * @param document
 * @param css
 * @returns {"events".EventEmitter}
 */
export function wrapper(document, css) {
  //可以通过下面的方法修改事件处理函数
  var eventEmitter = new EventEmitter().setMaxListeners(MaxListener);

  var select;
  eventEmitter.on('mousedown', function(e) {
    select = e.target;
    if (REGEXP.igTag.test(select.localName)) {
      select = null;
    }
  });
  eventEmitter.on('mouseup', function(e) {
    if (select && select === e.target) {
      eventEmitter.emit(EVENTS.elementSelect, e);
    }
    select = void 0;
  });

  interceptor(document, eventEmitter, css);

  return eventEmitter;
}
