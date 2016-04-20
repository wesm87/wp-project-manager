'use strict';

import _        from 'lodash';
import fs       from 'fs-extra';
import path     from 'path';
import yargs    from 'yargs';
import upsearch from 'utils-upsearch';

import log      from './log';
import helpers  from './helpers';

if ( ! _.upperSnakeCase ) {
	_.upperSnakeCase = ( string ) => (
		_.startCase( string ).replace( / /g, '_' )
	);
}

class Project {

	/**
	 * Project paths (getter).
	 *
	 * @since 0.3.0
	 *
	 * @return {object} Project paths.
	 */
	static get paths() {
		if ( ! this._paths ) {
			this._paths = {
				root:      __rootPath,
				app:       __appPath,
				cwd:       process.cwd(),
				project:   process.cwd(),
				includes:  path.join( __appPath, 'include' ),
				assets:    path.join( __rootPath, 'project-files', 'assets' ),
				templates: path.join( __rootPath, 'project-files', 'templates' ),
				plugins:   path.join( __rootPath, 'project-files', 'plugins' ),
				test:      path.join( __rootPath, 'test' ),
				config:    upsearch.sync( 'project.yml' ),
			};

			if ( 'node-test' === yargs.argv.env ) {
				this._paths.project = path.join( this._paths.root, '_test-project' );
			}

			if ( ! this._paths.config ) {
				this._paths.config = path.join( this._paths.project, 'project.yml' );
			}
		}

		return this._paths;
	}

	/**
	 * Project config (getter).
	 *
	 * @since 0.1.0
	 *
	 * @return {object} The current config settings.
	 */
	static get config() {

		if ( ! this._config ) {
			this._config = this.loadConfig();
		}

		return this._config;
	}

	/**
	 * Project config (setter).
	 *
	 * @since 0.1.0
	 *
	 * @param  {object} config The new config settings.
	 */
	static set config( config ) {
		this._config = this.parseConfig( config );
	}

	static get data() {

		if ( ! this._data ) {
			this._data = _.merge(
				{},
				this.config,
				{ paths: this.paths }
			);
		}

		return this._data;
	}

	/**
	 * Returns the default project config settings.
	 *
	 * @since 0.1.0
	 *
	 * @return {object} The default config settings.
	 */
	static get defaultConfig() {
		return {
			env: 'development',
			vvv: true,
			token: '',
			project: {
				title: '',
				slug:  '',
				url:   '',
			},
			repo: {
				create: false,
				url:    '',
			},
			plugin: {
				scaffold: true,
				name:     '',
				slug:     '',
			},
			theme: {
				scaffold: true,
				name:     '',
				slug:     '',
			},
			admin: {
				user:  'admin',
				pass:  'admin_password',
				email: 'admin@localhost.dev',
			},
			db: {
				name:     '',
				user:     'wp',
				pass:     'wp',
				rootUser: 'root',
				rootPass: 'root',
				host:     'localhost',
				prefix:   '',
			},
			secret: {
				authKey:        '',
				secureAuthKey:  '',
				loggedInKey:    '',
				nonceKey:       '',
				authSalt:       '',
				secureAuthSalt: '',
				loggedInSalt:   '',
				nonceSalt:      '',
			},
		};
	}

	/**
	 * Loads and parses a YAML config file. If no file is passed, or the
	 * specified file doesn't exist or is empty, the default config file path
	 * is used.
	 *
	 * @since 0.1.0
	 *
	 * @param  {string} file The path to the config file.
	 * @return {object}      The resulting config object.
	 */
	static loadConfig( file = null ) {

		let config;

		// Try to load the file if one was passed.
		if ( file ) {
			config = helpers.loadYAML( file );
		}

		// If we don't have a config object (or the config object is empty)
		// fall back to the default config file.
		if ( ! config || _.isEmpty( config ) ) {
			config = helpers.loadYAML( this.paths.config );
		}

		return this.parseConfig( config );
	}

	/**
	 * Parses the project config. Missing values are filled in from the default
	 * config object.
	 *
	 * @since 0.1.0
	 *
	 * @param  {object} config The config object to parse.
	 * @return {object}        The parsed config object.
	 */
	static parseConfig( config ) {

		// Merge config with defaults.
		config = _.pickBy(
			_.defaultsDeep( config, this.defaultConfig ),
			( value, key ) => _.has( this.defaultConfig, key )
		);

		// Fill in any dynamic config values that aren't set.
		if ( ! config.project.title && config.project.slug ) {
			config.project.title = _.startCase( config.project.slug );
		}

		if ( ! config.project.slug && config.project.title ) {
			config.project.slug = _.kebabCase( config.project.title );
		}

		if ( ! config.project.url ) {
			config.project.url = `${ config.project.slug }.dev`;
		}

		if ( ! config.plugin.name ) {
			if ( config.plugin.slug ) {
				config.plugin.name = _.startCase( config.plugin.slug );
			} else {
				config.plugin.name = config.project.title;
			}
		}

		if ( ! config.plugin.slug ) {
			config.plugin.slug = config.project.slug;
		}

		if ( ! config.theme.name ) {
			if ( config.theme.slug ) {
				config.theme.name = _.startCase( config.theme.slug );
			} else {
				config.theme.name = config.project.title;
			}
		}

		if ( ! config.theme.slug ) {
			config.theme.slug = config.project.slug;
		}

		if ( ! config.db.name ) {
			config.db.name = config.project.slug;
		}

		if ( ! config.db.prefix ) {
			config.db.prefix = helpers.randomString( 8 ) + '_';
		}

		[ 'auth', 'secureAuth', 'loggedIn', 'nonce' ].forEach(( type ) => {
			if ( ! config.secret[ `${type}Key` ] ) {
				config.secret[ `${type}Key` ] = helpers.randomString( 64, 'base64' );
			}
			if ( ! config.secret[ `${type}Salt` ] ) {
				config.secret[ `${type}Salt` ] = helpers.randomString( 64, 'base64' );
			}
		});

		// Set internal config values.
		config.project.folder = path.basename( this.paths.project );

		config.plugin.id      = _.snakeCase( config.plugin.name );
		config.plugin.class   = _.upperSnakeCase( config.plugin.name );
		config.plugin.package = _.upperSnakeCase( config.plugin.name );

		config.theme.id       = _.snakeCase( config.theme.name );
		config.theme.class    = _.upperSnakeCase( config.theme.name );
		config.theme.package  = _.upperSnakeCase( config.theme.name );

		// Return the updated config settings.
		return config;
	}

	/**
	 * Creates a new `project.yml` file with the default settings.
	 *
	 * @since 0.3.0
	 *
	 * @param {[bool]} force Optional. If true and a config file already exists,
	 *                       it will be deleted and a new file will be created.
	 */
	static createConfigFile( force = false ) {

		if ( force && helpers.fileExists( this.paths.config ) ) {
			fs.removeSync( this.paths.config );
		}

		if ( ! helpers.fileExists( this.paths.config ) ) {
			helpers.writeYAML( this.paths.config, this.defaultConfig );
		}
	}
}

export default Project;
