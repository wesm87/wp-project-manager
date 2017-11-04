
import project from '../include/project'

export default function configCreate(commander) {
  commander
    .command('config create')
    .description('create a new project.yml file with the default settings')
    .option('-f, --force')
    .action((options) => {
      project.createConfigFile(options.force)
    })
}
