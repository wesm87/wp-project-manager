/**
 * Performs all of the following:
 *   - Create project folder.
 *   - Create vvv-hosts, vvv-nginx.conf, and vvv-init.sh.
 *   - When vvv-init.sh runs: update Node to 5.x, install Gulp & Bower.
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
 * @todo Finish separating script out into individual command modules.
 * @todo Add argument validation and sanitization.
 * @todo Add description, usage, example, and copyright messages.
 * @todo Add functions to validate, sanitize, and/or format Git repo URLs.
 * @todo Add the ability to install VVV using WP Project Manager.
 * @todo Switch to using `async` / `await` and convert all the `*Sync()` methods
 *       we're currently using to their async counterparts.
 */

import yargs from 'yargs';

global.__appPath = __dirname;

// eslint-disable-next-line no-unused-expressions
yargs.help()
	.completion()
	.command( require( './commands/config.create' ) )
	.command( require( './commands/project.create' ) )
	.command( require( './commands/plugin.create' ) )
	.command( require( './commands/theme.create' ) )
	.argv;
