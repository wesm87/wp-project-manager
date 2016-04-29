
import _        from 'lodash';
import os       from 'os';
import fs       from 'fs-extra';
import cp       from 'child_process';
import path     from 'path';
import mustache from 'mustache';

import log      from './log';
import helpers  from './helpers';
import Project  from './project';

/**
 * Scaffolds out project files, plugins, themes, etc.
 *
 * @todo Figure out better names for functions.
 * @todo Document all the things! Maybe switch to rspec?
 * @todo Break this up into multiple classes.
 *       - Scaffold class should only handle project files and folders.
 *       - Move WordPress / database setup into separate class.
 *       - Move git commands into separate class?
 */
class Scaffold extends Project {

	/**
	 * Project files that need to be symlinked, removed, or any other special
	 * type of action that we can't determine automatically based on template
	 * files or project configuration.
	 *
	 * @return {Object}
	 */
	static get files() {
		return {
			project: {
				link: new Map( [
					[ 'dev-lib/pre-commit', '.git/hooks' ],
					[ 'dev-lib/.jshintrc',  '.'          ],
					[ 'dev-lib/.jscsrc',    '.'          ],
				] ),
			},

			bedrock: {
				remove: new Set( [
					'composer.*',
					'*.md',
					'phpcs.xml',
					'wp-cli.yml',
					'.gitignore',
					'.travis.yml',
					'.env.example',
					'.editorconfig',
				] ),
			},
		};
	}

	/**
	 * Sets initial values required for other class methods.
	 */
	static init() {

		this.templateData = this.config;

		fs.mkdirpSync( this.paths.project );

		if ( 'node-test' === this.config.env ) {
			fs.removeSync( this.paths.project );
			fs.mkdirpSync( this.paths.project );
		}
	}

	/**
	 * Creates a new project.
	 *
	 * @return {Boolean}
	 */
	static createProject() {

		if ( ! this.config.project.title ) {
			log.error(
				'You must specify a project title.'
				+ ' Check the README for usage information.'
			);

			return false;
		}

		this.initProjectFiles();
		this.initRepo();
		this.initDevLib();
		this.initProject();
		this.initPlugin();
		this.initTheme();

		return true;
	}

	/**
	 * Creates project files.
	 */
	static initProjectFiles() {

		this.maybeCreateAuthFiles();
		this.maybeCopyPluginZips();
		this.parseTemplateData();

		this.scaffoldFiles( 'scripts' );

		if ( this.config.vvv ) {
			this.scaffoldFiles( 'vvv' );
		}
	}

	/**
	 * Creates a Composer `auth.json` file if enabled in project config.
	 */
	static maybeCreateAuthFiles() {

		if ( ! this.config.token ) {
			return;
		}

		const filePath = path.join( os.homedir(), '.composer/auth.json' );
		const contents = JSON.stringify( {
			'github-oauth': {
				'github.com': `${ this.config.token }`,
			},
		} );

		if ( ! helpers.fileExists( filePath ) ) {
			fs.writeFileSync( filePath, contents );
		}
	}

	/**
	 * Copies plugin ZIP files.
	 */
	static maybeCopyPluginZips() {

		if ( ! helpers.directoryExists( this.paths.plugins ) ) {
			return;
		}

		log.message( 'Copying plugin ZIPs...' );

		const source = this.paths.plugins;
		const dest   = path.join( this.paths.project, 'plugin-zips' );

		fs.copySync( source, dest );

		log.ok( 'Plugin ZIPs copied.' );
	}

	/**
	 * Parses template data from project config.
	 */
	static parseTemplateData() {

		const pluginZipsDir = path.join( this.paths.project, 'plugin-zips' );

		if ( ! this.templateData.pluginZips ) {
			this.templateData.pluginZips = [];
		}

		helpers.readDir( pluginZipsDir ).forEach( val => {
			this.templateData.pluginZips.push( {
				name: path.basename( val, '.zip' ),
				file: val,
			} );
		} );
	}

	/**
	 * Initializes the Git repo if enabled in project config.
	 *
	 * @return {Boolean}
	 */
	static initRepo() {

		if ( ! this.config.repo.create ) {
			return false;
		}

		log.message( 'Checking for Git repo...' );

		const dirExists = helpers.directoryExists(
			path.join( this.paths.project, '.git' )
		);

		if ( dirExists ) {
			log.ok( 'Repo exists.' );

			return false;
		}

		// Initialize repo.
		if ( this.execSync( 'git init', 'project', false ) ) {
			log.ok( 'Repo initialized.' );
		}

		// If the repo URL is set, add it as a remote.
		if ( this.config.repo.url ) {
			const command = `git remote add origin ${ this.config.repo.url }`;

			if ( this.execSync( command, 'project', false ) ) {
				log.ok( 'Remote URL added.' );
			}
		}

		return true;
	}

	/**
	 * Adds the `wp-dev-lib` git submodule.
	 *
	 * @return {Boolean}
	 */
	static initDevLib() {

		log.message( 'Checking for wp-dev-lib submodule...' );

		const dirExists = helpers.directoryExists(
			path.join( this.paths.project, 'dev-lib' )
		);

		if ( dirExists ) {
			log.ok( 'Submodule exists.' );

			return false;
		}

		// Add the sub-module.
		const command = 'git submodule add -f -b master https://github.com/xwp/wp-dev-lib.git dev-lib';

		if ( this.execSync( command, 'project' ) ) {
			log.ok( 'Submodule added.' );
		}

		return true;
	}

	/**
	 * Creates project files and install project dependencies.
	 *
	 * @return {Boolean}
	 */
	static initProject() {

		log.message( 'Checking for Bedrock...' );

		const dirExists = helpers.directoryExists(
			path.join( this.paths.project, 'htdocs' )
		);

		if ( dirExists ) {
			log.ok( 'Bedrock exists' );

			return false;
		}

		// Install Bedrock.
		const command = 'composer create-project roots/bedrock htdocs --no-install';

		if ( this.execSync( command, 'project' ) ) {
			log.ok( 'Bedrock installed.' );
		}

		this.linkFiles( 'project' );
		this.scaffoldFiles( 'project' );
		this.scaffoldFiles( 'bedrock' );
		this.removeFiles( 'bedrock' );

		log.message( 'Installing project dependencies...' );

		if ( this.execSync( 'composer install', 'project' ) ) {
			log.ok( 'Dependencies installed.' );
		}

		return true;
	}

	/**
	 * Creates plugin files.
	 *
	 * @return {Boolean}
	 */
	static initPlugin() {

		if ( ! this.config.plugin.scaffold ) {
			return false;
		}

		if ( ! this.config.plugin.name ) {
			log.error(
				'You must specify a plugin name.'
				+ ' Check the README for usage information.'
			);

			return false;
		}

		log.message( 'Checking for plugin...' );

		const basePath = this.getBasePath( 'plugin' );

		if ( helpers.directoryExists( basePath ) ) {
			log.ok( 'Plugin exists.' );

			return false;
		}

		this.scaffoldFiles( 'plugin' );

		this.createPlaceholders( 'plugin' );

		log.ok( 'Plugin created.' );

		return true;
	}

	/**
	 * Creates plugin unit tests.
	 */
	static createPluginTests() {
		log.error( 'This feature is not ready' );
	}

	/**
	 * Creates a child theme.
	 *
	 * @since 0.1.0
	 *
	 * @return {Boolean} False if theme exists,
	 */
	static initTheme() {

		if ( ! this.config.theme.scaffold ) {
			return false;
		}

		if ( ! this.config.theme.name ) {
			log.error(
				'You must specify a theme name.'
				+ ' Check the README for usage information.'
			);

			return false;
		}

		log.message( 'Checking for child theme...' );

		const basePath = this.getBasePath( 'theme' );

		if ( helpers.directoryExists( basePath ) ) {
			log.ok( 'Child theme exists.' );

			return true;
		}

		this.scaffoldFiles( 'theme' );

		this.createPlaceholders( 'theme' );

		this.copyAssets( 'theme', 'css' );

		log.ok( 'Theme created.' );

		log.message( 'Installing theme dependencies...' );

		this.execSync( 'npm install', 'theme' );
		this.execSync( 'bower install', 'theme' );

		log.ok( 'Done' );

		return true;
	}

	/**
	 * Creates theme unit tests.
	 */
	static createThemeTests() {
		log.error( 'This feature is not ready' );
	}

	/**
	 * Executes a command.
	 *
	 * @param  {String}   command The command.
	 * @param  {String}   [type = 'project'] Type to use for the base path.
	 * @param  {Function} [callback = null]  A callback to call on success.
	 * @return {Boolean}
	 */
	static exec( command, type = 'project', callback = null ) {

		const options = {
			cwd: this.getBasePath( type ),
		};

		return cp.exec( command, options, ( error, stdout, stderr ) => {

			// Exit on error.
			if ( null !== error ) {
				log.error( error );

				return false;
			}

			// If a callback was provided, call it.
			if ( callback ) {
				callback( stdout, stderr );

				return true;
			}

			// Otherwise just return true.
			return true;
		} );
	}

	/**
	 * Synchronously executes a command.
	 *
	 * @param  {String} command             The command.
	 * @param  {String} [type = 'project']  Command runs in the type's base path.
	 * @param  {Boolean} [logError = false] Whether to log errors.
	 * @return {Boolean}
	 */
	static execSync( command, type = 'project', logError = false ) {

		const options = {
			cwd: this.getBasePath( type ),
		};

		try {
			cp.execSync( command, options );

			return true;

		} catch ( error ) {

			if ( logError && ! _.isEmpty( error ) ) {
				log.error( error );
			}

			return false;
		}
	}

	/**
	 * Gets base path to a specific type of file.
	 *
	 * @param  {String} [type = 'project'] [description]
	 * @return {String}
	 */
	static getBasePath( type = 'project' ) {

		const basePaths = {
			project:   '.',
			vvv:       'vvv',
			scripts:   'scripts',
			bedrock:   'htdocs',
			wordpress: 'htdocs/web/wp',
			plugin:    path.join( 'htdocs/web/app/plugins/', this.config.plugin.slug ),
			theme:     path.join( 'htdocs/web/app/themes/', this.config.theme.slug ),
		};

		// We convert the type to camel case so we don't run into issues if we
		// want to use a type like `type-name` or `type_name`.
		let base = basePaths[ _.camelCase( type ) ];

		if ( ! base ) {
			base = '';
		}

		return path.join( this.paths.project, base );
	}

	/**
	 * Gets path to plugin or theme assets.
	 *
	 * @param  {String} [type = 'theme'] [description]
	 * @return {String}
	 */
	static getAssetsPath( type = 'theme' ) {

		const assetsPaths = {
			plugin: 'assets/source',
			theme:  'assets/source',
		};

		let assetsPath = assetsPaths[ _.camelCase( type ) ];

		if ( ! assetsPath ) {
			assetsPath = '';
		}

		return path.join( this.getBasePath( type ), assetsPath );
	}

	/**
	 * Creates placeholder files and folders.
	 *
	 * @param  {String} [type = 'theme'] [description]
	 */
	static createPlaceholders( type = 'theme' ) {

		const base = this.getBasePath( type );

		const dirs = [
			'includes',
			'assets/source/css',
			'assets/source/js',
			'assets/source/images',
			'assets/source/fonts',
			'assets/dist/css',
			'assets/dist/js',
			'assets/dist/images',
			'assets/dist/fonts',
		];

		const files = [
			'assets/dist/css/.gitkeep',
			'assets/dist/js/.gitkeep',
			'assets/dist/images/.gitkeep',
			'assets/dist/fonts/.gitkeep',
		];

		dirs.forEach( dir => {
			try {
				fs.mkdirpSync( path.join( base, dir ) );
			} catch ( error ) {
				log.error( error );
			}
		} );

		files.forEach( file => {
			try {
				fs.ensureFileSync( path.join( base, file ) );
			} catch ( error ) {

				// Do nothing.
			}
		} );
	}

	/**
	 * Copy an included set of plugin or theme assets.
	 *
	 * @param  {String} [type = 'theme'] [description]
	 * @param  {String} [dir  = '']      [description]
	 * @return {Boolean}
	 */
	static copyAssets( type = 'theme', dir = '' ) {

		const source = path.join( this.paths.assets, type, dir );
		const dest   = path.join( this.getAssetsPath( type ), dir );

		if ( ! helpers.directoryExists( source ) ) {
			log.error( `${ source } is not a valid assets folder.` );

			return false;
		}

		try {
			fs.mkdirpSync( dest );
			fs.copySync( source, dest );

			log.ok( `${ _.startCase( type ) } assets created.` );
		} catch ( error ) {
			if ( ! _.isEmpty( error ) ) {
				log.error( error );
			}
		}

		return true;
	}

	/**
	 * Creates symlinks to a set of files.
	 *
	 * @param  {String} type = 'project' [description]
	 */
	static linkFiles( type = 'project' ) {

		const base  = this.getBasePath( type );
		const files = this.files[ type ].link;

		if ( ! files ) {
			return;
		}

		for ( let [ source, dest ] of files ) {

			const destBase = path.join( dest, path.basename( source ) );

			source = path.join( base, source );
			dest   = path.join( base, destBase );

			log.message( `Checking for ${ destBase }...` );

			if ( helpers.symlinkExists( dest ) ) {
				log.ok( `${ dest } exists.` );
			} else {
				try {
					fs.ensureSymlinkSync( dest, source );
					log.ok( `${ dest } created.` );
				} catch ( error ) {
					if ( ! _.isEmpty( error ) ) {
						log.error( error );
					}
				}
			}
		}
	}

	/**
	 * Removes a set of files.
	 *
	 * @param  {String} type = 'project' [description]
	 */
	static removeFiles( type = 'project' ) {

		const base  = this.getBasePath( type );
		const files = this.files[ type ].remove;

		if ( ! files ) {
			return;
		}

		for ( let file of files ) {
			file = path.join( base, file );

			try {
				fs.removeSync( file );
			} catch ( error ) {
				if ( ! _.isEmpty( error ) ) {
					log.error( error );
				}
			}
		}
	}

	/**
	 * Renders a set of template files using the template data.
	 *
	 * @param  {String} type =             'project' [description]
	 * @return {Boolean}      [description]
	 */
	static scaffoldFiles( type = 'project' ) {

		const source = path.join( this.paths.templates, type );

		if ( ! helpers.directoryExists( source ) ) {
			log.error( `${ source } is not a valid template directory` );

			return false;
		}

		const dirs = helpers.readDir( source );

		if ( ! _.isEmpty( dirs ) ) {
			dirs.forEach( file => {
				this.scaffoldFile( path.join( source, file ), type );
			} );
		}

		return true;
	}

	/**
	 * Renders a specific template file.
	 *
	 * @param  {String} source [description]
	 * @param  {String} type   = 'project' [description]
	 * @return {Boolean}        [description]
	 */
	static scaffoldFile( source, type = 'project' ) {

		let file = path.basename( source, '.mustache' );

		// Templates for hidden files start with `_` instead of `.`
		if ( 0 === file.indexOf( '_' ) ) { // eslint-disable-line no-magic-numbers
			file = file.replace( '_', '.' );
		}

		log.message( `Checking for ${ file }...` );

		const base = this.getBasePath( type );
		const dest = path.join( base, file );

		if ( helpers.fileExists( dest ) ) {
			log.ok( `${ file } exists.` );

			return true;
		}

		fs.mkdirpSync( base );

		try {
			const templateContent = fs.readFileSync( source ).toString();
			const renderedContent = mustache.render( templateContent, this.templateData );

			fs.writeFileSync( dest, renderedContent );

			log.ok( `${ file } created.` );

		} catch ( error ) {

			if ( ! _.isEmpty( error ) ) {
				log.error( error );

				return false;
			}
		}

		return true;
	}
}

export default Scaffold;
