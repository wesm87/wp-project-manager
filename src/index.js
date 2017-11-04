
import commander from 'commander'

const VERSION = '0.8.0'

// import configDisplay from './commands/config.display'
// import configCreate from './commands/config.create'
import depsInstall from './commands/deps.install'
// import pluginCreate from './commands/plugin.create'
// import pluginCreateTests from './commands/plugin.create-tests'
// import themeCreate from './commands/theme.create'
// import themeCreateTests from './commands/theme.create-tests'
// import projectCreate from './commands/project.create'
import wpInstall from './commands/wp.install'

const commandFactories = [
  // configDisplay,
  // configCreate,
  depsInstall,
  // pluginCreate,
  // pluginCreateTests,
  // themeCreate,
  // themeCreateTests,
  // projectCreate,
  wpInstall,
]

const invokeCommandFactory = (commandFactory) => {
  commandFactory(commander)
}

/**
 * Performs all of the following:
 *   - Create project folder.
 *   - Create vvv-hosts, vvv-nginx.conf, and vvv-init.sh.
 *   - When vvv-init.sh runs: update Node to 6.x, install Gulp & Bower globally.
 *   - Initialize the Git repo.
 *   - Scaffold out a new project and install dependencies.
 *   - Install and configure wp-dev-lib.
 *   - Install and configure Bedrock.
 *   - Install and configure WordPress.
 *   - Create a custom plugin and activate it.
 *   - Create parent and child themes and activate them.
 *   - Install theme dependencies and compile assets.
 *
 * Default settings can be configured in `project.yml` or `package.json`.
 * Default settings can be overridden via command arguments.
 *
 * If no `project.yml` file is found in the project folder, but one is found
 * in a parent folder, that one will be used instead. This can be useful for
 * setting a default configuration that will apply to multiple projects.
 *
 * You can also specify the path using the `--config` argument. For example:
 *     `node wp-manager --config=/path/to/config.yml`.
 *
 * @TODO Add argument validation and sanitization.
 * @TODO Add description, usage, example, and copyright messages.
 * @TODO Switch to using `async` / `await` instead of `*Sync()` methods.
 * @TODO Add `deps` module to handle npm / Bower / Composer dependencies.
 * @TODO Add `install-deps` command to install project, plugin, and theme deps.
 * @TODO Replace `yargs` with a CLI framework that supports sub-commands.
 */

commander.version(VERSION)

commandFactories.forEach(invokeCommandFactory)

commander.parse(process.argv)
