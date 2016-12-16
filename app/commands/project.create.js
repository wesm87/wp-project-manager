
import scaffold from '../include/scaffold';

export default {
  command: 'project create',
  describe: 'scaffold new project',
  builder: {},
  handler() {
    scaffold.init();
    scaffold.createProject();
  },
};
