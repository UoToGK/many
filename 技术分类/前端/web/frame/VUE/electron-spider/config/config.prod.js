'use strict';

module.exports = merge(prodEnv, {
  NODE_ENV: '"production"',
  IMG_URL: '"http://localhost:8899"' //静态资源请求地址
});
