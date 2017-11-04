module.exports = {
  root: true,
  env: {
    browser: true,
  },
  parser: 'babel-eslint',
  extends: [
    '@wes-moberly/base',
  ],
  rules: {
    'no-console': 'off',
    'no-underscore-dangle': 'off',
    'padded-blocks': 'off',
    'class-methods-use-this': 'off',
    'no-restricted-syntax': 'off',
  },
}
