module.exports = {
  plugins: {
    "postcss-pxtorem": {
      rootValue: 16, // 基准值，通常 1rem = 16px
      propList: ["*"], // 所有属性都转换
      minPixelValue: 2, // 小于 2px 的不转换
    },
  },
};
