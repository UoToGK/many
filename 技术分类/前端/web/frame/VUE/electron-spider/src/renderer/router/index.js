
import NProgress from 'nprogress';
import 'nprogress/nprogress.css'; // 这个样式必须引入
import router from './router'
import './nprogress.scss';

// NProgress.inc(0.1)
NProgress.configure({ easing: 'ease', speed: 500, showSpinner: false });

router.beforeEach((to, from, next) => {
  NProgress.start();
  next();
});

router.afterEach(() => {
  NProgress.done();
});

export default router;