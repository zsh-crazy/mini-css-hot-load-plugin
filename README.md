# 使用说明
### 本项目为了解决mini-css-extract-plugin 在xx上热更新无法实现，更改部分代码，对不能热更新的地方采用热加载，使用通mini-css-extract-plugin使用一致

```
const MiniCssHotLoadPlugin = require("mini-css-hot-load-plugin");

module.exports = {
  plugins: [new MiniCssHotLoadPlugin()],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssHotLoadPlugin.loader, "css-loader"],
      },
    ],
  },
};
```