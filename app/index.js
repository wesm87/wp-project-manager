/**
 * Performs all of the following:
 *   - Create vvv-hosts file
 *   - Create nginx config file and restart nginx
 *   - Initialize the Git repo
 *   - Install wp-dev-lib as a git submodule
 *   - Create wp-dev-lib config files
 *   - Install and configure Bedrock
 *   - Create database
 *   - Install and configure WordPress
 *   - Install project dependencies
 *   - Create theme and activate it
 *   - Delete the ruleset.xml and .editorconfig files provided by Sage
 *   - Update npm (VVV ships with 0.10.37 but Sage requires at least 0.12.x)
 *   - Install theme dependencies
 *   - Compile theme assets
 *
 * Default project settings can be configured in `project.yml`.
 *
 * @TODO: Map each config value to an optional argument.
 * @TODO: Add function to validate / format Git repo URLs
 * @TODO: Add custom WP-CLI command to call this script.
 */

'use strict';

import fs       from 'fs';
import path     from 'path';
import yargs    from 'yargs';
import crypto   from 'crypto';
import mustache from 'mustache';

import helpers  from './include/helpers';
import project  from './include/project';
import scaffold from './include/scaffold';

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
		'wpScaffoldConfig',
		__path.cwd
	);

const argv   = yargs.argv;
const config = project.parseConfig( argv );

scaffold.init();
