'use strict';

import _       from 'lodash';
import path    from 'path';

import helpers from './helpers';

class Project {

	/**
	 * Class constructor. Sets default values for class properties.
	 *
	 * @since 0.1.0
	 */
	constructor() {

		if ( ! global.__config ) {
			global.__config = {};
		}

		_.upperSnakeCase = ( string ) => (
			_.startCase( string ).replace( / /g, '_' )
		);
	}

	/**
	 * Config getter.
	 *
	 * @since 0.1.0
	 *
	 * @return {object} The current config settings.
	 */
	get config() {
		return global.__config;
	}

	/**
	 * Config setter.
	 *
	 * @since 0.1.0
	 *
	 * @param  {object} config The new config settings.
	 */
	set config( config ) {
		global.__config = this.parseConfig( config );
	}

	/**
	 * Returns the default project config settings.
	 *
	 * @since 0.1.0
	 *
	 * @return {object} The default config settings.
	 */
	get defaultConfig() {
		return {
			env: 'development',
			vvv: true,
			project: {
				title: 'New WP Project',
				slug:  '',
				url:   '',
				repo:  '',
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
	loadConfig( file ) {

		let config;

		// Try to load the file if one was passed.
		if ( file ) {
			config = helpers.loadYAML( file );
		}

		// If we don't have a config object (or the config object is empty)
		// fall back to the default config file.
		if ( ! config || _.isEmpty( config ) ) {
			config = helpers.loadYAML( __path.config );
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
	parseConfig( config ) {

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
		config.project.folder = path.basename( __path.project );

		config.plugin.id      = _.snakeCase( config.plugin.name );
		config.plugin.class   = _.upperSnakeCase( config.plugin.name );
		config.plugin.package = _.upperSnakeCase( config.plugin.name );

		config.theme.id       = _.snakeCase( config.theme.name );
		config.theme.class    = _.upperSnakeCase( config.theme.name );
		config.theme.package  = _.upperSnakeCase( config.theme.name );

		// Update the global config settings.
		global.__config = config;

		// Return the updated config settings.
		return config;
	}
}

export default new Project();
