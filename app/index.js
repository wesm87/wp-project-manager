
import yargs from 'yargs'

import configDisplayCommand from './commands/config.display'
import configCreateCommand from './commands/config.create'
import depsInstallCommand from './commands/deps.install'
import pluginCreateTestsCommand from './commands/plugin.create-tests'
import pluginCreateCommand from './commands/plugin.create'
import themeCreateTestsCommand from './commands/theme.create-tests'
import themeCreateCommand from './commands/theme.create'
import projectCreateCommand from './commands/project.create'
import wpInstallCommand from './commands/wp.install'

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
export default yargs.help()
  .completion()
  .command(configDisplayCommand)
  .command(configCreateCommand)
  .command(depsInstallCommand)
  .command(pluginCreateTestsCommand)
  .command(pluginCreateCommand)
  .command(themeCreateTestsCommand)
  .command(themeCreateCommand)
  .command(projectCreateCommand)
  .command(wpInstallCommand)
  .argv
