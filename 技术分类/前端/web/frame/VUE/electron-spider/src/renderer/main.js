import Vue from 'vue';
import axios from 'axios';

import App from './App';
import router from './router/index';
import store from './store';
import 'babel-polyfill';
import elementUI from 'element-ui';
import VueLazyload from 'vue-lazyload';

if (!process.env.IS_WEB) Vue.use(require('vue-electron'));
Vue.http = Vue.prototype.$http = axios;
Vue.config.productionTip = false;
Vue.use(elementUI);
Vue.use(VueLazyload, {
  preLoad: 1 //预加载的宽高
  //解释一下为什么是require('.....url'):因为vue自带webpack打包工具，如果是图片路径就会把他当成模块解析，所以直接引入就好了。
  // error: require('./assets/img/zwsj5.png'),//img的加载中的显示的图片的路径
  // loading: require('./assets/img/zwsj5.png'),//img加载失败时现实的图片的路径
  // attempt: 3,//尝试加载的次数
  // listenEvents:['scroll','wheel','mousewheel','resize','animationend','transitionend','touchmove'], //你想让vue监听的事件
});
/**
 * 在app.vue的template里写一个
<img v-lazy="img.src"/>
 */
/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app');
