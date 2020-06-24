export default {
  presets: [
    '@babel/preset-typescript',
    ['@babel/preset-env', {
      targets: {
        node: '8.0.0'
      }
    }],
  ],
};
