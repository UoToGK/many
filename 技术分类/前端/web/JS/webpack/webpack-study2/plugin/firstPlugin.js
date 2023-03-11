class FirstPlugin {
  constructor(options) {}
  apply(compiler) {
    // 当依赖的文件发生变化时会触发 watch-run 事件
    // console.log(this.hasExtractTextPlugin(compiler));
  }
  hasExtractTextPlugin(compiler) {
    // 当前配置所有使用的插件列表
    const plugins = compiler.options.plugins;
    // console.log(plugins);
    // 去 plugins 中寻找有没有 ExtractTextPlugin 的实例
    return (
      plugins.find(
        plugin => plugin.__proto__.constructor === "ExtractTextPlugin"
      ) != null
    );
  }
}
module.exports = FirstPlugin;
