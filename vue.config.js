const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  transpileDependencies: true,
});
module.exports = {
  publicPath: process.env.NODE_ENV === "production" ? "./" : "/",
  css: {
    loaderOptions: {
      sass: {
        // 向全局sass样式传入共享的全局变量
        // additionalData: `@import "@/Scss/global.scss";`,
      },
      less: {
        lessOptions: {
          javascriptEnabled: true,
        },
      },
    },
  },
  devServer: {
    client: {
      overlay: false,
    },
    port: 8888,
    // https: true,
    proxy: {
      [process.env.VUE_APP_BASE_API]: {
        target: `http://10.2.13.150:8986`,
        changeOrigin: true,
        logLevel: "info",
        pathRewrite: {
          ["^" + process.env.VUE_APP_BASE_API]: "",
        },
      },
    },
  },
  chainWebpack: (config) => {
    config.plugins.delete("prefetch");
  },
};
