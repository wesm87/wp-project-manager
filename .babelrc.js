const { BABEL_ENV } = process.env

const isProd = BABEL_ENV === 'production'
const isDev = !isProd

module.exports = {
  presets: [
    ['@babel/env', {
      modules: isDev,
      targets: {
        node: '6.10',
      },
    }],
  ],
  plugins: [
    'lodash',
    '@babel/transform-regenerator',
    '@babel/transform-flow-comments',
    '@babel/proposal-object-rest-spread',
    '@babel/proposal-decorators',
    ['@babel/proposal-class-properties', {
      loose: true,
    }],
  ],
}
