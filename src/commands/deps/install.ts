import { install } from '../../include/deps';

type Args = {
  type: string;
};

export default {
  command: 'deps install [--type=all|npm|bower|composer]',
  describe: 'install project, theme, and plugin dependencies',
  builder: {},
  handler(argv: Args) {
    install(argv.type);
  },
};
