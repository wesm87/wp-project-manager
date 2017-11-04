
import log from '../include/log'
import project from '../include/project'

export default (commander) => {
  commander
    .command('config display')
    .description('parse and display project settings')
    .action(() => {
      log.message(project.config)
    })
}
