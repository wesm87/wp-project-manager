
import scaffold from '../include/scaffold'

export default (commander) => {
  commander
    .command('plugin create')
    .description('scaffold new plugin')
    .action(async () => {
      await scaffold.init()
      scaffold.initPlugin()
    })
}
