import log from '../../include/log';
import { getConfig } from '../../include/project';

export default {
  command: 'config display',
  describe: 'parse and display project settings',
  builder: {},
  async handler() {
    const config = await getConfig();
    log.message(config);
  },
};
