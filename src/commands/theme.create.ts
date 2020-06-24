import scaffold from '../include/scaffold';

export default {
  command: 'theme create',
  describe: 'scaffold new child theme',
  builder: {},
  async handler() {
    await scaffold.init();
    await scaffold.initTheme();
  },
};
