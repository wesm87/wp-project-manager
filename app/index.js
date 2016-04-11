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
 * @todo Separate script out into individual command modules.
 *       @todo Add argument validation and sanitization.
 *       @todo Add description, usage, example, and copyright messages.
 * @todo Add functions to validate, sanitize, and/or format Git repo URLs.
 * @todo Add the ability to install VVV using WP Project Manager.
 */

'use strict';

import path     from 'path';
import yargs    from 'yargs';
import rimraf   from 'rimraf';
import mkdirp   from 'mkdirp';
import upsearch from 'utils-upsearch';

import helpers  from './include/helpers';
import project  from './include/project';
import scaffold from './include/scaffold';

const appPath  = __dirname;
const rootPath = path.join( __dirname, '..' );
const cwd      = process.cwd();

global.__path = {
	app:       appPath,
	root:      rootPath,
	cwd:       cwd,
	project:   cwd,
	includes:  path.join( appPath, 'include' ),
	templates: path.join( rootPath, 'templates' ),
	test:      path.join( rootPath, 'test' ),
	config:    upsearch.sync( 'project.yml' ),
};

if ( ! __path.config ) {
	__path.config = path.join( rootPath, 'project.yml' );
}

yargs.options({
		'config': {
			default: __path.config,
		}
	})
	.config(
		'config',
		( configPath ) => helpers.loadYAML( configPath )
	)
	.pkgConf(
		'wpProjectManager',
		__path.cwd
	)
	.help()
	.completion();

const argv = yargs.argv;

if ( 'node-test' === argv.env ) {
	__path.project = path.join( __path.root, '_test-project' );
	rimraf.sync( __path.project );
	mkdirp.sync( __path.project );
}

project.parseConfig( argv );
scaffold.init();
