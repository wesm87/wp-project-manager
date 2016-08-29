
import _        from 'lodash';
import fs       from 'fs-extra';
import path     from 'path';
import yargs    from 'yargs';
import upsearch from 'utils-upsearch';

import { mock } from 'mocktail';

import helpers  from './helpers';

if ( ! _.upperSnakeCase ) {
	_.upperSnakeCase = string => (
		_.startCase( string ).replace( / /g, '_' )
	);
}

/**
 * The number of characters to use when generating a database prefix.
 *
 * @type {Number}
 */
const DB_PREFIX_LENGTH = 8;

/**
 * The number of characters to use when generating a secret key.
 *
 * @type {Number}
 */
const SECRET_KEY_LENGTH = 64;

/**
 * The number of characters to use when generating a secret salt.
 *
 * @type {Number}
 */
const SECRET_SALT_LENGTH = 64;

/**
 * Project config settings and helper methods.
 */
class Project {

	/**
	 * Gets project paths.
	 *
	 * @since 0.3.0
	 *
	 * @return {Object}
	 */
	static get paths() {

		if ( ! this._paths ) {

			const appPath  = global.__appPath;
			const rootPath = path.join( appPath, '..' );

			this._paths = {
				app:       appPath,
				root:      rootPath,
				cwd:       process.cwd(),
				project:   process.cwd(),
				includes:  path.join( appPath, 'include' ),
				assets:    path.join( rootPath, 'project-files', 'assets' ),
				templates: path.join( rootPath, 'project-files', 'templates' ),
				plugins:   path.join( rootPath, 'project-files', 'plugin-zips' ),
				test:      path.join( rootPath, 'test' ),
				config:    upsearch.sync( 'project.yml' ),
			};

			if ( this._paths.root === this._paths.project ) {
				this._paths.project = path.join( this._paths.root, '_test-project' );
			}

			if ( ! this._paths.config ) {
				this._paths.config = path.join( this._paths.project, 'project.yml' );
			}
		}

		return this._paths;
	}

	/**
	 * Gets config.
	 *
	 * @since 0.1.0
	 *
	 * @return {Object}
	 */
	static get config() {

		if ( ! this._config ) {
			this._config = this.loadConfig();
		}

		return this._config;
	}

	/**
	 * Sets config.
	 *
	 * @since 0.1.0
	 *
	 * @param {Object} config The new config settings.
	 */
	static set config( config ) {
		this._config = this.parseConfig( config );
	}

	/**
	 * Gets default config settings.
	 *
	 * @since 0.1.0
	 *
	 * @return {Object}
	 */
	static get defaultConfig() {
		return {
			vvv:    true,
			debug:  false,
			token:  '',
			author: {
				name:    'Your Name',
				email:   'your-email@example.com',
				website: 'http://your-website.example.com',
			},
			project: {
				multisite: false,
				title:     '',
				slug:      '',
				url:       '',
			},
			repo: {
				create: false,
				url:    '',
			},
			plugin: {
				scaffold:    true,
				name:        '',
				slug:        '',
				description: '',
			},
			theme: {
				scaffold:    true,
				name:        '',
				slug:        '',
				description: '',
			},
			admin: {
				user:  'admin',
				pass:  'admin_password',
				email: 'admin@localhost.dev',
			},
			db: {
				name:      '',
				user:      'external',
				pass:      'external',
				host:      'vvv.dev:3306',
				root_user: 'root',
				root_pass: 'root',
				prefix:    '',
			},
			secret: {
				auth_key:         '',
				auth_salt:        '',
				secure_auth_key:  '',
				secure_auth_salt: '',
				logged_in_key:    '',
				logged_in_salt:   '',
				nonce_key:        '',
				nonce_salt:       '',
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
	 * @param  {String} file The path to the config file.
	 * @return {Object}      The resulting config object.
	 */
	static loadConfig( file = null ) {

		let config;

		// Try to load the config file if one was passed and it exists.
		if ( file && helpers.fileExists( file ) ) {
			config = helpers.loadYAML( file );
		}

		// If we don't have a config object (or the config object is empty)
		// fall back to the default config file.
		if ( _.isEmpty( config ) && helpers.fileExists( this.paths.config ) ) {
			config = helpers.loadYAML( this.paths.config );
		}

		config = _.merge( config, yargs.argv );

		return this.parseConfig( config );
	}

	/**
	 * Parses the project config. Missing values are filled in from the default
	 * config object.
	 *
	 * @since 0.1.0
	 *
	 * @param  {Object} config The config object to parse.
	 * @return {Object}        The parsed config object.
	 */
	static parseConfig( config ) {

		// Merge config with defaults.
		config = _.pickBy(
			_.defaultsDeep( config, this.defaultConfig ),
			( value, key ) => _.has( this.defaultConfig, key )
		);

		// Fill in any config values that aren't set.
		config = this.ensureProjectConfig( config );
		config = this.ensurePluginConfig( config );
		config = this.ensureThemeConfig( config );
		config = this.ensureDatabaseConfig( config );
		config = this.ensureSecretConfig( config );

		// Set internal config values.
		config.project.folder    = path.basename( this.paths.project );
		config.project.namespace = _.upperSnakeCase( config.project.title );

		config.plugin.id        = _.snakeCase( config.plugin.name );
		config.plugin.class     = _.upperSnakeCase( config.plugin.name );
		config.plugin.namespace = config.project.namespace || config.plugin.class;
		config.plugin.namespace = `${ config.plugin.namespace }\\Plugin`;

		config.theme.id         = _.snakeCase( config.theme.name );
		config.theme.class      = _.upperSnakeCase( config.theme.name );
		config.theme.namespace  = config.project.namespace || config.theme.class;
		config.theme.namespace  = `${ config.theme.namespace }\\Theme`;

		// Return the updated config settings.
		return config;
	}

	/**
	 * Fills in any missing project settings with their default values.
	 *
	 * @since 0.5.0
	 *
	 * @param  {Object} config The current config object.
	 * @return {Object}        The updated config object.
	 */
	static ensureProjectConfig( config ) {

		if ( ! config.project.title && config.project.slug ) {
			config.project.title = _.startCase( config.project.slug );
		}

		if ( ! config.project.slug && config.project.title ) {
			config.project.slug = _.kebabCase( config.project.title );
		}

		if ( ! config.project.url ) {
			config.project.url = `${ config.project.slug }.dev`;
		}

		return config;
	}

	/**
	 * Fills in any missing plugin settings with their default values.
	 *
	 * @since 0.5.0
	 *
	 * @param  {Object} config The current config object.
	 * @return {Object}        The updated config object.
	 */
	static ensurePluginConfig( config ) {

		if ( ! config.plugin.name ) {
			if ( config.plugin.slug ) {
				config.plugin.name = _.startCase( config.plugin.slug );
			} else {
				config.plugin.name = config.project.title;
			}
		}

		if ( ! config.plugin.slug ) {
			config.plugin.slug = _.kebabCase( config.plugin.name );
		}

		return config;
	}

	/**
	 * Fills in any missing theme settings with their default values.
	 *
	 * @since 0.5.0
	 *
	 * @param  {Object} config The current config object.
	 * @return {Object}        The updated config object.
	 */
	static ensureThemeConfig( config ) {

		if ( ! config.theme.name ) {
			if ( config.theme.slug ) {
				config.theme.name = _.startCase( config.theme.slug );
			} else {
				config.theme.name = config.project.title;
			}
		}

		if ( ! config.theme.slug ) {
			config.theme.slug = _.kebabCase( config.theme.name );
		}

		return config;
	}

	/**
	 * Fills in any missing database settings with their default values.
	 *
	 * @since 0.5.0
	 *
	 * @param  {Object} config The current config object.
	 * @return {Object}        The updated config object.
	 */
	static ensureDatabaseConfig( config ) {

		if ( ! config.db.name ) {
			config.db.name = config.project.slug;
		}

		if ( ! config.db.prefix ) {
			config.db.prefix = `${ helpers.randomString( DB_PREFIX_LENGTH ) }_`;
		}

		return config;
	}

	/**
	 * Fills in any missing secret key / salts with their default values.
	 *
	 * @since 0.5.0
	 *
	 * @param  {Object} config The current config object.
	 * @return {Object}        The updated config object.
	 */
	static ensureSecretConfig( config ) {

		const types = [ 'auth', 'secure_auth', 'logged_in', 'nonce' ];

		types.forEach( type => {
			if ( ! config.secret[ `${ type }_key` ] ) {
				config.secret[ `${ type }_key` ] = helpers.randomString(
					SECRET_KEY_LENGTH,
					'base64'
				);
			}
			if ( ! config.secret[ `${ type }_salt` ] ) {
				config.secret[ `${ type }_salt` ] = helpers.randomString(
					SECRET_SALT_LENGTH,
					'base64'
				);
			}
		} );

		return config;
	}

	/**
	 * Creates a new `project.yml` file with the default settings.
	 *
	 * @since 0.3.0
	 *
	 * @param {bool} [force] If true and a config file already exists, it will
	 *                       be deleted and a new file will be created.
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

export default mock( Project );
