import { createConfigFile } from '../include/project';

type Args = {
  force: boolean;
};

export default {
  command: 'config create',
  describe: 'create a new project.yml file with the default settings',
  builder: {},
  handler(argv: Args) {
    createConfigFile(argv.force);
  },
};
