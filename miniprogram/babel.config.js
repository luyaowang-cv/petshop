// babel-preset-taro 更多选项和默认值：
// https://docs.taro.zone/docs/next/babel-config
module.exports = {
  presets: [
    ['taro', {
      framework: 'react',
      ts: true,
      compiler: 'webpack5',
    }]
  ],
  // Taro 4 默认不降级 ES2020 语法，源码里的可选链 ?. 和空值合并 ?? 会原样进产物，
  // 微信基础库/预览会报 "Unexpected token ."，这里显式降级。
  plugins: [
    '@babel/plugin-transform-optional-chaining',
    '@babel/plugin-transform-nullish-coalescing-operator',
  ]
}
