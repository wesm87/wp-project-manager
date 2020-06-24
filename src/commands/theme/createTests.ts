import scaffold from '../../include/scaffold';

export default {
  command: 'theme create-tests',
  describe: 'create theme unit tests',
  builder: {},
  async handler() {
    await scaffold.init();
    await scaffold.createThemeTests();
  },
};
