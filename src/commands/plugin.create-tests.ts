import scaffold from '../include/scaffold';

export default {
  command: 'plugin create-tests',
  describe: 'create plugin unit tests',
  builder: {},
  async handler() {
    await scaffold.init();
    await scaffold.createPluginTests();
  },
};
