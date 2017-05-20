
import scaffold from '../include/scaffold';

export default {
  command: 'plugin create',
  describe: 'scaffold new plugin',
  builder: {},
  handler() {
    scaffold.init();
    scaffold.initPlugin();
  },
};
