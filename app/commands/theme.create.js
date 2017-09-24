
import scaffold from '../include/scaffold'

export default {
  command: 'theme create',
  describe: 'scaffold new child theme',
  builder: {},
  handler() {
    scaffold.init()
    scaffold.initTheme()
  },
}
