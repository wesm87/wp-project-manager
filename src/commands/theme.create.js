
import scaffold from '../include/scaffold'

export default (commander) => {
  commander
    .command('theme create')
    .description('scaffold new child theme')
    .action(async () => {
      await scaffold.init()
      scaffold.initTheme()
    })
}
