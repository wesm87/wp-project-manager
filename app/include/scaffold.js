'use strict';

import _        from 'lodash';
import fs       from 'fs-extra';
import cp       from 'child_process';
import path     from 'path';
import mustache from 'mustache';

import log      from './log';
import helpers  from './helpers';
import project  from './project';

class Scaffold {

	/**
	 * Class constructor. Sets default values for class properties.
	 *
	 * @since 0.1.0
	 *
	 * @todo Figure out better names for functions.
	 * @todo DOCUMENT ALL THE THINGS! Maybe switch to rspec?
	 * @todo Break this up into multiple classes.
	 *           Scaffold should only handle project files and folders.
	 *           Move WordPress / database setup into separate class.
	 *           Move git commands into separate class.
	 *
	 */
	constructor() {

		this._files = {
			bedrock: {
				remove: new Set([
					'composer.*',
					'*.md',
					'ruleset.xml',
					'wp-cli.yml',
					'.gitignore',
					'.travis.yml',
					'.env.example',
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

	init() {

		this._data      = __config;
		this._data.path = __path;

		fs.mkdirpSync( __path.project );

		if ( ! __config.project.title ) {
			log.error( 'You must specify a project title. Check the README for usage information.' );
			return;
		}

		this.createProject();
	}

	createProject() {
		this.initProjectFiles();
		this.initRepo();
		this.initDevLib();
		this.initProject();
		this.initPlugin();
		this.initTheme();
	}

	createInitScript() {
		this.initWordPress();
		this.maybeInstallPackages();
	}

	initProjectFiles() {

		this.scaffoldFiles( 'scripts' );

		if ( __config.vvv ) {
			this.scaffoldFiles( 'vvv' );
		}
	}

	initRepo() {

		if ( ! __config.repo.create ) {
			return;
		}

		log.info( 'Checking for Git repo...' );

		const dirExists = helpers.directoryExists(
			path.join( __path.project, '.git' )
		);

		if ( dirExists ) {
			return log.ok( 'Repo exists.' );
		}

		// Initialize repo.
		if ( this.execSync( 'git init' ) ) {
			log.ok( 'Repo initialized.' );
		}

		// If the repo URL is set, add it as a remote.
		if ( __config.repo.url ) {
			let command = `git remote add origin ${ __config.repo.url }`;

			if ( this.execSync( command ) ) {
				log.ok( 'Remote URL added.' );
			}
		}
	}

	initDevLib() {

		log.info( 'Checking for wp-dev-lib submodule...' );

		const dirExists = helpers.directoryExists(
			path.join( __path.project, 'dev-lib' )
		);

		if ( dirExists ) {
			return log.ok( 'Submodule exists.' );
		}

		// Add the sub-module.
		let command = 'git submodule add -b master https://github.com/xwp/wp-dev-lib.git dev-lib';

		if ( this.execSync( command ) ) {
			log.ok( 'Submodule added.' );
		}
	}

	initProject() {

		log.info( 'Checking for Bedrock...' );

		const dirExists = helpers.directoryExists(
			path.join( __path.project, 'htdocs' )
		);

		if ( dirExists ) {
			return log.ok( 'Bedrock exists' );
		}

		// Install Bedrock.
		let command = 'composer create-project roots/bedrock htdocs --no-install';

		if ( this.execSync( command ) ) {
			log.ok( 'Bedrock installed.' );
		}

		this.scaffoldFiles( 'project' );
		this.scaffoldFiles( 'bedrock' );

		this.removeFiles( 'bedrock' );

		log.info( 'Installing project dependencies...' );

		if ( this.execSync( 'composer install' ) ) {
			log.ok( 'Dependencies installed.' );
		}
	}

	initWordPress() {

		log.info( 'Checking for database...' );

		if ( this.execSync( 'wp db tables' ) ) {
			return log.ok( 'Database exists.' );
		}

		if ( this.execSync( 'wp db create' ) ) {
			log.ok( 'Database created.' );
		}

		log.info( 'Checking for WordPress database tables...' );

		if ( this.execSync( 'wp core is-installed' ) ) {
			return log.ok( 'Tables exist.' );
		}

		let command = 'wp core install' +
			` --url="${ __config.project.url }"` +
			` --title="${ __config.project.title }"` +
			` --admin_user="${ __config.admin.user }"` +
			` --admin_password="${ __config.admin.pass }"` +
			` --admin_email="${ __config.admin.email }"` +
			` --path="${ this.getBasePath( 'wordpress' ) }"`;

		if ( this.execSync( command ) ) {
			log.ok( 'Tables created.' );
		}
	}

	initPlugin() {

		if ( ! __config.plugin.scaffold ) {
			return;
		}

		log.info( 'Checking for plugin...' );

		const basePath = this.getBasePath( 'plugin' );

		if ( helpers.directoryExists( basePath ) ) {
			return log.ok( 'Plugin exists.' );
		}

		this.scaffoldFiles( 'plugin' );

		[
			'includes',
			'assets/source/css',
			'assets/source/js',
			'assets/dist/css',
			'assets/dist/js',
		].forEach( ( dir ) => {
			try {
				fs.mkdirpSync( path.join( basePath, dir ) );
			} catch ( error ) {
				log.error( error );
			}
		});

		log.ok( 'Plugin created.' );
	}

	initTheme() {

		if ( ! __config.theme.scaffold ) {
			return;
		}

		log.info( 'Checking for child theme...' );

		const basePath = this.getBasePath( 'theme' );

		if ( helpers.directoryExists( basePath ) ) {
			return log.ok( 'Child theme exists.' );
		}

		this.scaffoldFiles( 'theme' );

		[
			'includes',
			'assets/source/css',
			'assets/source/js',
			'assets/dist/css',
			'assets/dist/js',
		].forEach( ( dir ) => {
			try {
				fs.mkdirpSync( path.join( basePath, dir ) );
			} catch ( error ) {
				log.error( error );
			}
		});

		this.copyAssets( 'theme', 'css' );

		log.ok( 'Theme created.' );

		log.info( 'Installing theme dependencies...' );

		this.execSync( 'npm install', 'theme' );
		this.execSync( 'bower install', 'theme' );

		log.ok( 'Done' );
	}

	exec( command, type = 'project', callback = null ) {

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

	execSync( command, type = 'project' ) {

		const options = {
			cwd: this.getBasePath( type ),
		};

		try {
			cp.execSync( command, options );
			return true;
		} catch( error ) {
			log.error( error );
			return false;
		}
	}

	getBasePath( type = 'project' ) {

		const basePaths = {
			project:     '.',
			vvv:         'vvv',
			scripts:     'scripts',
			bedrock:     'htdocs',
			wordpress:   'htdocs/web/wp',
			plugin:      path.join( 'htdocs/web/app/plugins/', __config.plugin.slug ),
			theme:       path.join( 'htdocs/web/app/themes/', __config.theme.slug ),
		};

		// We convert the type to camel case so we don't run into issues if we
		// want to use a type like `type-name` or `type_name`.
		let base = basePaths[ _.camelCase( type ) ];

		if ( ! base ) {
			base = '';
		}

		return path.join( __path.project, base );
	}

	getAssetsPath( type = 'theme' ) {

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

	copyAssets( type = 'theme', dir = '' ) {

		const source = path.join( __path.assets, type, dir );
		const dest   = path.join( this.getAssetsPath( type ), dir );

		if ( ! helpers.directoryExists( source ) ) {
			return log.error( `${ source } is not a valid assets folder.` );
		}

		try {
			fs.mkdirpSync( dest );
			fs.copySync( source, dest );

			log.ok( `${ _.startCase( type ) } assets created.` );
		} catch ( error ) {
			log.error( error );
		}
	}

	linkFiles( type = 'project' ) {

		const base  = this.getBasePath( type );
		const files = this._files[ type ].remove;

		if ( ! files ) {
			return;
		}

		for ( let [ source, dest ] of files ) {

			dest = path.join( dest, path.basename( source ) );

			let destPath   = path.join( __path.project, dest );
			let sourcePath = path.join( __path.project, source );

			log.info( `Checking for ${ dest }...` );

			if ( helpers.symlinkExists( destPath ) ) {
				return log.ok( `${ dest } exists.` );
			}

			try {
				fs.ensureSymlinkSync( destPath, sourcePath );
				log.ok( `${ dest } created.` );
			} catch ( error ) {
				log.error( error );
			}
		}
	}

	removeFiles( type = 'project' ) {

		const base  = this.getBasePath( type );
		const files = this._files[ type ].remove;

		if ( ! files ) {
			return;
		}

		for ( let file of files ) {
			let filePath = path.join( base, file );

			try {
				fs.removeSync( filePath );
			} catch( error ) {

			}
		}
	}

	scaffoldFiles( type = 'project' ) {

		const source = path.join( __path.templates, type );

		if ( ! helpers.directoryExists( source ) ) {
			return log.error( `${ source } is not a valid template directory` );
		}

		try {
			const dirs = fs.readdirSync( source );

			dirs.forEach( ( file ) => {

				let filePath = path.join( source, file );

				if ( helpers.fileExists( filePath ) ) {
					this.scaffoldFile( filePath, type );
				}
			});
		} catch ( error ) {
			log.error( error );
		}
	}

	scaffoldFile( source, type = 'project' ) {

		let file = path.basename( source, '.mustache' );

		// Templates for hidden files start with `_` instead of `.`
		if ( 0 === file.indexOf( '_' ) ) {
			file = file.replace( '_', '.' );
		}

		log.info( `Checking for ${ file }...` );

		const base = this.getBasePath( type );
		const dest = path.join( base, file );

		if ( helpers.fileExists( dest ) ) {
			return log.ok( `${ file } exists.` );
		}

		fs.mkdirpSync( base );

		try {
			const templateContent = fs.readFileSync( source ).toString();
			const renderedContent = mustache.render( templateContent, this._data );

			fs.writeFileSync( dest, renderedContent );

			log.ok( `${ file } created.` );
		} catch ( error ) {
			log.error( error );
		}
	}
}

export default new Scaffold();
