
import scaffold from '../include/scaffold'

export default (commander) => {
  commander
    .command('project create')
    .description('scaffold new project')
    .action(async () => {
      await scaffold.init()
      scaffold.createProject()
    })
}
