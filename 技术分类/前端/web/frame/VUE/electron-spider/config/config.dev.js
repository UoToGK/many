'use strict';
const merge = require('webpack-merge');
const prodEnv = require('./config.prod');

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  IMG_URL: '"http://localhost:9988"' //静态资源请求地址
});
