const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
module.exports = {
  entry: {
    app: "./app/scripts/boot.ts"
  },
  //   devtool: "inline-source-map",
  target: "electron-renderer",
  output: {
    filename: "[name].bundle.js",
    chunkFilename: "[name].chunk.js",
    publicPath: __dirname + "/renderer/", // js引用路径或者CDN地址
    path: path.resolve(__dirname, "renderer") // 打包文件的输出目录
  },
  resolve: {
    // 先尝试以ts为后缀的TypeScript源码文件
    extensions: [".ts", ".js"]
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: ["file-loader"]
      },
      {
        test: /\.tsx?$/,
        use: ["babel-loader", "ts-loader"]
      }
    ]
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        // 注意: priority属性
        // 其次: 打包业务中公共代码
        common: {
          name: "common",
          chunks: "all",
          minChunks: 1,
          priority: 0
        },
        // 首先: 打包node_modules中的文件
        vendor: {
          name: "vendor",
          test: /[\\/]node_modules[\\/]/,
          chunks: "all",
          priority: 10
          // enforce: true
        }
      }
    }
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new HtmlWebpackPlugin({ template: "./app/index.html" }),
    new CleanWebpackPlugin({
      // Simulate the removal of files
      //
      // default: false
      dry: true,

      // Write Logs to Console
      // (Always enabled when dry is true)
      //
      // default: false
      verbose: true,

      // Automatically remove all unused webpack assets on rebuild
      //
      // default: true
      cleanStaleWebpackAssets: false,

      // Do not allow removal of current webpack assets
      //
      // default: true
      protectWebpackAssets: false,

      // **WARNING**
      //
      // Notes for the below options:
      //
      // They are unsafe...so test initially with dry: true.
      //
      // Relative to webpack's output.path directory.
      // If outside of webpack's output.path directory,
      //    use full path. path.join(process.cwd(), 'build/**/*')
      //
      // These options extend del's pattern matching API.
      // See https://github.com/sindresorhus/del#patterns
      //    for pattern matching documentation

      // Removes files once prior to Webpack compilation
      //   Not included in rebuilds (watch mode)
      //
      // Use !negative patterns to exclude files
      //
      // default: ['**/*']
      cleanOnceBeforeBuildPatterns: ["**/*", "!static-files*"],
      cleanOnceBeforeBuildPatterns: [], // disables cleanOnceBeforeBuildPatterns

      // Removes files after every build (including watch mode) that match this pattern.
      // Used for files that are not created directly by Webpack.
      //
      // Use !negative patterns to exclude files
      //
      // default: disabled
      cleanAfterEveryBuildPatterns: ["static*.*", "!static1.js"],

      // Allow clean patterns outside of process.cwd()
      //
      // requires dry option to be explicitly set
      //
      // default: false
      dangerouslyAllowCleanPatternsOutsideProject: true
    })
  ]
};
