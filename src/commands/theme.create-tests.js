
import scaffold from '../include/scaffold'

export default (commander) => {
  commander
    .command('theme create-tests')
    .description('create theme unit tests')
    .action(async () => {
      await scaffold.init()
      scaffold.createThemeTests()
    })
}
