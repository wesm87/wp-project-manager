
import scaffold from '../include/scaffold'

export default (commander) => {
  commander
    .command('plugin create-tests')
    .description('create plugin unit tests')
    .action(async () => {
      await scaffold.init()
      scaffold.createPluginTests()
    })
}
