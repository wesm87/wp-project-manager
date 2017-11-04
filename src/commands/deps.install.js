
import deps from '../include/deps'

// const collect = (val, memo) => [...memo, val]

/**
 * @TODO Allow type values to collect for more fine-grained control over which
 * dependencies are installed (e.g. --type=npm --type=composer).
 */
export default (commander) => {
  commander
    .command('deps install')
    .option('--type [type]', 'Which dependencies to install', /^(all|npm|bower|composer)$/i, 'all')
    .description('install project, theme, and plugin dependencies')
    .action((options) => {
      deps.install(options.type)
    })
}
