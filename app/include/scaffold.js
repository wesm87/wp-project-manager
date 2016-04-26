'use strict';

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

	static get files() {
		return {
			bedrock: {
				remove: new Set([
					'composer.*',
					'*.md',
					'phpcs.xml',
					'wp-cli.yml',
					'.gitignore',
					'.travis.yml',
					'.env.example',
					'.editorconfig',
				]),
			},

			project: {
				link: new Map([
					[ 'dev-lib/pre-commit', '.git/hooks' ],
					[ 'dev-lib/.jshintrc' , '.'          ],
					[ 'dev-lib/.jscsrc'   , '.'          ],
				]),
			},
		};
	}

	static init() {

		fs.mkdirpSync( this.paths.project );

		if ( ! this.config.project.title ) {
			log.error( 'You must specify a project title. Check the README for usage information.' );
			return;
		}

		if ( 'node-test' === this.config.env ) {
			fs.removeSync( this.paths.project );
			fs.mkdirpSync( this.paths.project );
		}

		this.createProject();
	}

	static createProject() {
		this.initProjectFiles();
		this.initRepo();
		this.initDevLib();
		this.initProject();
		this.initPlugin();
		this.initTheme();
	}

	static createInitScript() {
		this.initWordPress();
		this.maybeInstallPackages();
	}

	static initProjectFiles() {

		this.maybeCreateAuthFiles();
		this.maybeCopyPluginZips();
		this.parseTemplateData();

		this.scaffoldFiles( 'scripts' );

		if ( this.config.vvv ) {
			this.scaffoldFiles( 'vvv' );
		}
	}

	static maybeCreateAuthFiles() {

		if ( ! this.config.token ) {
			return;
		}

		const filePath = path.join( os.homedir(), '.composer/auth.json' );
		const contents = JSON.stringify({
			'github-oauth': {
				'github.com': `${ this.config.token }`
			}
		});

		if ( ! helpers.fileExists( filePath ) ) {
			fs.writeFileSync( filePath, contents );
		}
	}

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

	static parseTemplateData() {

		const pluginZipsDir = path.join( this.paths.project, 'plugin-zips' );

		this.templateData = this.config;

		if ( ! this.templateData.pluginZips ) {
			this.templateData.pluginZips = [];
		}

		helpers.readDir( pluginZipsDir ).forEach( val => {
			this.templateData.pluginZips.push({
				name: path.basename( val, '.zip' ),
				file: val,
			});
		});
	}

	static initRepo() {

		if ( ! this.config.repo.create ) {
			return;
		}

		log.message( 'Checking for Git repo...' );

		const dirExists = helpers.directoryExists(
			path.join( this.paths.project, '.git' )
		);

		if ( dirExists ) {
			return log.ok( 'Repo exists.' );
		}

		// Initialize repo.
		if ( this.execSync( 'git init', 'project', false ) ) {
			log.ok( 'Repo initialized.' );
		}

		// If the repo URL is set, add it as a remote.
		if ( this.config.repo.url ) {
			let command = `git remote add origin ${ this.config.repo.url }`;

			if ( this.execSync( command, 'project', false ) ) {
				log.ok( 'Remote URL added.' );
			}
		}
	}

	static initDevLib() {

		log.message( 'Checking for wp-dev-lib submodule...' );

		const dirExists = helpers.directoryExists(
			path.join( this.paths.project, 'dev-lib' )
		);

		if ( dirExists ) {
			return log.ok( 'Submodule exists.' );
		}

		// Add the sub-module.
		let command = 'git submodule add -f -b master https://github.com/xwp/wp-dev-lib.git dev-lib';

		if ( this.execSync( command, 'project', false ) ) {
			log.ok( 'Submodule added.' );
		}
	}

	static initProject() {

		log.message( 'Checking for Bedrock...' );

		const dirExists = helpers.directoryExists(
			path.join( this.paths.project, 'htdocs' )
		);

		if ( dirExists ) {
			return log.ok( 'Bedrock exists' );
		}

		// Install Bedrock.
		let command = 'composer create-project roots/bedrock htdocs --no-install';

		if ( this.execSync( command, 'project', false ) ) {
			log.ok( 'Bedrock installed.' );
		}

		this.linkFiles( 'project' );
		this.scaffoldFiles( 'project' );
		this.scaffoldFiles( 'bedrock' );
		this.removeFiles( 'bedrock' );

		log.message( 'Installing project dependencies...' );

		if ( this.execSync( 'composer install', 'project', false ) ) {
			log.ok( 'Dependencies installed.' );
		}
	}

	static initWordPress() {

		log.message( 'Checking for database...' );

		if ( this.execSync( 'wp db tables' ) ) {
			return log.ok( 'Database exists.' );
		}

		if ( this.execSync( 'wp db create' ) ) {
			log.ok( 'Database created.' );
		}

		log.message( 'Checking for WordPress database tables...' );

		if ( this.execSync( 'wp core is-installed' ) ) {
			return log.ok( 'Tables exist.' );
		}

		let command = 'wp core install' +
			` --url="${ this.config.project.url }"` +
			` --title="${ this.config.project.title }"` +
			` --admin_user="${ this.config.admin.user }"` +
			` --admin_password="${ this.config.admin.pass }"` +
			` --admin_email="${ this.config.admin.email }"` +
			` --path="${ this.getBasePath( 'wordpress' ) }"`;

		if ( this.execSync( command ) ) {
			log.ok( 'Tables created.' );
		}
	}

	static initPlugin() {

		if ( ! this.config.plugin.scaffold ) {
			return;
		}

		log.message( 'Checking for plugin...' );

		const basePath = this.getBasePath( 'plugin' );

		if ( helpers.directoryExists( basePath ) ) {
			return log.ok( 'Plugin exists.' );
		}

		this.scaffoldFiles( 'plugin' );

		const pluginDirs = [
			'includes',
			'assets/source/css',
			'assets/source/js',
			'assets/source/fonts',
			'assets/dist/css',
			'assets/dist/js',
			'assets/dist/fonts',
		];

		pluginDirs.forEach( dir => {
			try {
				fs.mkdirpSync( path.join( basePath, dir ) );
			} catch ( error ) {
				log.error( error );
			}
		});

		const pluginFiles = [
			'assets/dist/css/.gitkeep',
			'assets/dist/js/.gitkeep',
			'assets/dist/fonts/.gitkeep',
		];

		pluginFiles.forEach( file => {
			try {
				fs.ensureFileSync( file );
			} catch ( error ) {

			}
		});

		log.ok( 'Plugin created.' );
	}

	static createPluginTests() {
		log.error( 'This feature is not ready' );
	}

	static initTheme() {

		if ( ! this.config.theme.scaffold ) {
			return;
		}

		log.message( 'Checking for child theme...' );

		const basePath = this.getBasePath( 'theme' );

		if ( helpers.directoryExists( basePath ) ) {
			return log.ok( 'Child theme exists.' );
		}

		this.scaffoldFiles( 'theme' );

		const themeDirs = [
			'includes',
			'assets/source/css',
			'assets/source/js',
			'assets/source/fonts',
			'assets/dist/css',
			'assets/dist/js',
			'assets/dist/fonts',
		];

		themeDirs.forEach( ( dir ) => {
			try {
				fs.mkdirpSync( path.join( basePath, dir ) );
			} catch ( error ) {
				log.error( error );
			}
		});

		const themeFiles = [
			'assets/dist/css/.gitkeep',
			'assets/dist/js/.gitkeep',
			'assets/dist/fonts/.gitkeep',
		];

		themeFiles.forEach( file => {
			try {
				fs.ensureFileSync( file );
			} catch ( error ) {

			}
		});

		this.copyAssets( 'theme', 'css' );

		log.ok( 'Theme created.' );

		log.message( 'Installing theme dependencies...' );

		this.execSync( 'npm install', 'theme' );
		this.execSync( 'bower install', 'theme' );

		log.ok( 'Done' );
	}

	static createThemeTests() {
		log.error( 'This feature is not ready' );
	}

	static exec( command, type = 'project', callback = null ) {

		const options = {
			cwd: this.getBasePath( type ),
		};

		return cp.exec( command, options, ( error, stdout, stderr ) => {

			// Exit on error.
			if ( null !== error ) {
				return log.error( error );
			}

			// If a callback was provided, call it.
			if ( callback ) {
				return callback( stdout, stderr );
			}

			// Otherwise just return true.
			return true;
		});
	}

	static execSync( command, type = 'project', logError = true ) {

		const options = {
			cwd: this.getBasePath( type ),
		};

		try {
			cp.execSync( command, options );
			return true;
		} catch( error ) {
			if ( logError && ! _.isEmpty( error ) ) {
				log.error( error );
			}
			return false;
		}
	}

	static getBasePath( type = 'project' ) {

		const basePaths = {
			project:     '.',
			vvv:         'vvv',
			scripts:     'scripts',
			bedrock:     'htdocs',
			wordpress:   'htdocs/web/wp',
			plugin:      path.join( 'htdocs/web/app/plugins/', this.config.plugin.slug ),
			theme:       path.join( 'htdocs/web/app/themes/', this.config.theme.slug ),
		};

		// We convert the type to camel case so we don't run into issues if we
		// want to use a type like `type-name` or `type_name`.
		let base = basePaths[ _.camelCase( type ) ];

		if ( ! base ) {
			base = '';
		}

		return path.join( this.paths.project, base );
	}

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

	static copyAssets( type = 'theme', dir = '' ) {

		const source = path.join( this.paths.assets, type, dir );
		const dest   = path.join( this.getAssetsPath( type ), dir );

		if ( ! helpers.directoryExists( source ) ) {
			return log.error( `${ source } is not a valid assets folder.` );
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
	}

	static linkFiles( type = 'project' ) {

		const base  = this.getBasePath( type );
		const files = this.files[ type ].link;

		if ( ! files ) {
			return;
		}

		for ( let [ source, dest ] of files ) {

			dest = path.join( dest, path.basename( source ) );

			let destPath   = path.join( base, dest );
			let sourcePath = path.join( base, source );

			log.message( `Checking for ${ dest }...` );

			if ( helpers.symlinkExists( destPath ) ) {
				return log.ok( `${ dest } exists.` );
			}

			try {
				fs.ensureSymlinkSync( destPath, sourcePath );
				log.ok( `${ dest } created.` );
			} catch ( error ) {
				if ( ! _.isEmpty( error ) ) {
					log.error( error );
				}
			}
		}
	}

	static removeFiles( type = 'project' ) {

		const base  = this.getBasePath( type );
		const files = this.files[ type ].remove;

		if ( ! files ) {
			return;
		}

		for ( let file of files ) {
			let filePath = path.join( base, file );

			try {
				fs.removeSync( filePath );
			} catch( error ) {
				if ( ! _.isEmpty( error ) ) {
					log.error( error );
				}
			}
		}
	}

	static scaffoldFiles( type = 'project' ) {

		const source = path.join( this.paths.templates, type );

		if ( ! helpers.directoryExists( source ) ) {
			return log.error( `${ source } is not a valid template directory` );
		}

		const dirs = helpers.readDir( source );

		if ( ! _.isEmpty( dirs ) ) {
			dirs.forEach( file => {
				this.scaffoldFile( path.join( source, file ), type );
			});
		}
	}

	static scaffoldFile( source, type = 'project' ) {

		let file = path.basename( source, '.mustache' );

		// Templates for hidden files start with `_` instead of `.`
		if ( 0 === file.indexOf( '_' ) ) {
			file = file.replace( '_', '.' );
		}

		log.message( `Checking for ${ file }...` );

		const base = this.getBasePath( type );
		const dest = path.join( base, file );

		if ( helpers.fileExists( dest ) ) {
			return log.ok( `${ file } exists.` );
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
			}
		}
	}
}

export default Scaffold;
