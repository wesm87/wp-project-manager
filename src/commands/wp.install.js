
import log from '../include/log'

export default (commander) => {
  commander
    .command('wp install')
    .description('install WordPress')
    .action(() => {
      log.error('This feature is not ready')
    })
}
