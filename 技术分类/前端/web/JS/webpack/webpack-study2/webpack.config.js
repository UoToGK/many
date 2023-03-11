const path = require("path");
const webpack = require("webpack");
const packagejson = require("./package.json");
const cleanWebpackPlugin = require("clean-webpack-plugin");
const htmlWebpackPlugin = require("html-webpack-plugin");
const firstPlugin = require("./plugin/firstPlugin");
const env = "development";
const config = {
  entry: {
    // first: "./src/first.js",//多入口文件配置
    // second: "./src/second.js",
    test: "./src/test2.js"
    // vendor: Object.keys(packagejson.dependencies).filter(v => v === "jquery") //获取生产环境依赖的库
  },
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "[name].js",
    publicPath: "/" //生成的html里的引用路径用 publicPath 以文件内容的MD5生成Hash名称的script来防止缓存,
    //异步加载的模块是要以文件形式加载，生成的文件名是以chunkFilename配置的
    //     chunkFilename: 'js/[name].[chunkhash:8].js'
  },
  optimization: {
    minimize: env === "production" ? true : false, //是否进行代码压缩
    splitChunks: {
      chunks:
        "all" /**配置一共有三个选项，initial、async、 all。
      默认为async，表示只会提取异步加载模块的公共代码，initial表示只会提取初始入口模块的公共代码，all表示同时提取前两者的代码。 */,
      minSize: 30000, //模块大于30k会被抽离到公共模块
      minChunks: 1, //模块出现1次就会被抽离到公共模块
      maxAsyncRequests: 5, //异步模块，一次最多只能被加载5个
      maxInitialRequests: 3, //入口模块最多只能加载3个
      name: true,
      cacheGroups: {
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        },
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        }
      }
    },
    runtimeChunk: {
      name: "runtime"
    }
  },
  plugins: [
    new cleanWebpackPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new firstPlugin(),
    new htmlWebpackPlugin({
      filename: "index.html", //如果修改需访问localhost:8080/修改后的.html
      template: "./src/template.ejs",
      inject: "body",
      hash: true,
      title: "按照ejs模板生成出来的页面",
      chunksSortMode: "none" //如果使用webpack4将该配置项设置为'none'
    })
  ],
  devServer: {
    hot: true, // Tell the dev-server we're using HMR
    contentBase: path.resolve(__dirname, "dist"),
    publicPath: "/" //这里访问的就是localhost:8080/index.html
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style", "css"]
      },
      {
        test: /\.html$/,
        use: "raw-loader" // loaders: ['raw-loader'] is also perfectly acceptable.
      },
      {
        test: /\.ejs$/,
        use: "ejs-loader"
      }
    ]
  }
};
/** webpack-dev-server
 * --quiet 控制台中不输出打包的信息
--compress 开启gzip压缩
--progress 显示打包的进度
 [webpack多页应用架构系列](https://segmentfault.com/a/1190000006843916)  TS https://www.jianshu.com/p/9e61598f024c
 angualr 翻译系列 https://segmentfault.com/blog/lx1036
 */
module.exports = config;



/***
 * new HtmlWebpackPlugin({
 82             filename:'view/index.html',    //生成的html存放路径，相对于 path
 83             template:'src/view/index.html',    //html模板路径
 84             inject:true,    //允许插件修改哪些内容，true/'head'/'body'/false,
 85             chunks:['vendors','app'],//加载指定模块中的文件，否则页面会加载所有文件
 86             hash:false,    //为静态资源生成hash值
 87             minify:{    //压缩HTML文件
 88                 removeComments:false,    //移除HTML中的注释
 89                 collapseWhitespace:false    //删除空白符与换行符
 90             }        
 91         }),
 92         new HtmlWebpackPlugin({
 93             filename:'view/mobile.html',    //生成的html存放路径，相对于 path
 94             template:'src/view/mobile.html',    //html模板路径
 95             inject:true,    //允许插件修改哪些内容，true/'head'/'body'/false,
 96             chunks:['vendors','mobile'],//加载指定模块中的文件，否则页面会加载所欲文件
 97             hash:false,    //为静态资源生成hash值
 98             minify:{    //压缩HTML文件
 99                 removeComments:false,    //移除HTML中的注释
100                 collapseWhitespace:false    //删除空白符与换行符
101             }
102         }),

103         /*作用：生成具有独立hash值的css和js文件，即css和js文件hash值解耦.
104          *缺点：webpack-md5-hash插件对chunk-hash钩子进行捕获并重新计算chunkhash，它的计算方法是只计算模块本身的当前内容（包括同步模块）
            。这种计算方式把异步模块的内容忽略掉了，会造成一个问题：异步模块的修改并未影响主文件的hash值。
106         //new WebpackMd5Hash()
107         new WebpackSplitHash()
 * 
 * 
 */