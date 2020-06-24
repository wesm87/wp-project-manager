import scaffold from '../../include/scaffold';

export default {
  command: 'project create',
  describe: 'scaffold new project',
  builder: {},
  async handler() {
    await scaffold.init();
    await scaffold.createProject();
  },
};
