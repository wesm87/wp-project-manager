import scaffold from '../../include/scaffold';

export default {
  command: 'plugin create',
  describe: 'scaffold new plugin',
  builder: {},
  async handler() {
    await scaffold.init();
    await scaffold.initPlugin();
  },
};
