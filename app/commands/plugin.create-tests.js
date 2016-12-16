
import scaffold from '../include/scaffold';

export default {
  command: 'plugin create-tests',
  describe: 'create plugin unit tests',
  builder: {},
  handler() {
    scaffold.init();
    scaffold.createPluginTests();
  },
};
