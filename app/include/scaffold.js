'use strict';

import _        from 'lodash';
import fs       from 'fs';
import cp       from 'child_process';
import path     from 'path';
import mkdirp   from 'mkdirp';
import rimraf   from 'rimraf';
import mustache from 'mustache';

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
			vvv: {
				create: new Set([
					'vvv-hosts',
					'vvv-init.sh',
					'vvv-nginx.conf',
				]),
			},

			bedrock: {
				create: new Set([
					'.env',
				]),

				remove: new Set([
					'composer.*',
					'vendor',
					'*.md',
					'ruleset.xml',
					'wp-cli.yml',
					'.gitignore',
					'.travis.yml',
					'.env.example',
				]),
			},

			project: {
				create: new Set([
					'composer.json',
					'phpcs.ruleset.xml',
					'wp-cli.yml',
					'.gitignore',
					'.editorconfig',
					'.travis.yml',
					'.scss-lint.yml',
					'.jshintignore',
					'.babelrc',
					'.dev-lib',
				]),

				link: new Map([
					[ 'dev-lib/pre-commit', '.git/hooks' ],
					[ 'dev-lib/.jshintrc' , '.'          ],
					[ 'dev-lib/.jscsrc'   , '.'          ],
				]),
			},

			theme: {
				create: new Set([
					'bower.json',
					'package.json',
					'gulpfile.babel.js',
					'style.css',
				]),
			},
		};

		mkdirp.sync( __path.project );
	}

	init() {
		if ( __config.vvv ) {
			this.createInitScript();
		} else {

			if ( ! __config.project.title ) {
				helpers.logFailure( 'Error: you must specify a project title. Check the README for more information.' );
				return;
			}

			this.createProject();
		}
	}

	createProject() {
		this.initProjectFiles();
		this.initRepo();
		this.initDevLib();
		this.initProject();
	}

	createInitScript() {
		this.initWordPress();
		this.initPlugin();
		this.initTheme();

		this.maybeInstallPackages();
	}

	initProjectFiles() {
		this.createFiles( 'vvv' );
	}

	initRepo() {

		if ( __config.repo.create ) {

			console.log( 'Checking for Git repo...' );

			if ( helpers.directoryExists( `${ __path.project }/.git` ) ) {
				return helpers.logSuccess( 'Repo exists' );
			}

			// Initialize repo.
			this.execSync( 'git init' );

			// If the repo URL is set, add it as a remote.
			if ( __config.repo.url ) {
				this.execSync( `git remote add origin ${ __config.repo.url }` );
			}

			return helpers.logSuccess( 'Repo initialized' );
		}
	}

	initDevLib() {

		console.log( 'Checking for wp-dev-lib submodule...' );

		if ( helpers.directoryExists( `${ __path.project }/dev-lib` ) ) {
			return helpers.logSuccess( 'Submodule exists.' );
		}

		// Add the sub-module.
		let command = 'git submodule add -b master https://github.com/xwp/wp-dev-lib.git dev-lib';
		this.execSync( command );
		helpers.logSuccess( 'Submodule added.' );
	}

	initProject() {

		console.log( 'Checking for Bedrock...' );

		// Install Bedrock.
		if ( helpers.directoryExists( `${ __path.project }/htdocs` ) ) {
			return helpers.logSuccess( 'Bedrock exists' );
		}

		let command = 'composer create-project roots/bedrock htdocs --no-install';
		this.execSync( command );

		helpers.logSuccess( 'Bedrock installed.' );

		this.createFiles( 'project' );
		this.createFiles( 'bedrock' );
		this.removeFiles( 'bedrock' );

		console.log( 'Installing project dependencies...' );

		this.execSync( 'composer install' );

		helpers.logSuccess( 'Dependencies installed.' );
	}

	initWordPress() {

		console.log( 'Checking for database...' );

		if ( this.execSync( 'wp db tables' ) ) {
			return helpers.logSuccess( 'Database exists.' );
		}

		this.execSync( 'wp db create' );
		helpers.logSuccess( 'Database created.' );

		console.log( 'Checking for WordPress database tables...' );

		if ( this.execSync( 'wp core is-installed' ) ) {
			return helpers.logSuccess( 'Tables exist.' );
		}

		let command = 'wp core install' +
			` --url="${ __config.project.url }"` +
			` --title="${ __config.project.title }"` +
			` --admin_user="${ __config.admin.user }"` +
			` --admin_password="${ __config.admin.password }"` +
			` --admin_email="${ __config.admin.email }"` +
			` --path="${ this.getBasePath( 'wordpress' ) }"`;

		this.execSync( command );
		helpers.logSuccess( 'Tables created.' );
	}

	initPlugin() {

		if ( ! __config.plugin.scaffold ) {
			return;
		}

		console.log( 'Checking for plugin...' );

		if ( this.execSync( `wp plugin is-installed ${ __config.plugin.slug }` ) ) {
			return helpers.logSuccess( 'Plugin exists.' );
		}

		let command = `wp scaffold plugin ${ __config.plugin.slug }` +
			` --plugin_name="${ __config.plugin.name }" --activate`;

		this.execSync( command );
		this.execSync( `wp plugin activate ${ __config.plugin.slug }` );
	}

	initTheme() {

		if ( ! __config.theme.scaffold ) {
			return;
		}

		console.log( 'Checking for theme...' );

		if ( this.execSync( `wp theme is-installed ${ __config.theme.slug }` ) ) {
			return helpers.logSuccess( 'Theme exists.' );
		}

		let command = `wp scaffold child-theme ${ __config.theme.slug }` +
			` --activate --parent_theme=sage` +
			` --theme_name="${ __config.theme.name }"`;

		this.execSync( command );
		this.execSync( `wp theme activate ${ __config.theme.slug }` );

		let themeDir = this.getBasePath( 'theme' );
		mkdirp.sync( `${themeDir}/assets/source/css` );
		mkdirp.sync( `${themeDir}/assets/source/js` );
		mkdirp.sync( `${themeDir}/assets/dist/css` );
		mkdirp.sync( `${themeDir}/assets/dist/js` );

		this.createFiles( 'theme' );

		helpers.logSuccess( 'Theme created.' );

		console.log( 'Installing theme dependencies...' );

		this.execSync( 'npm install', 'theme' );
		this.execSync( 'bower install', 'theme' );

		helpers.logSuccess( 'Done' );
	}

	initParentTheme() {

		console.log( 'Checking for parent theme...' );

		if ( this.execSync( `wp theme is-installed sage` ) ) {
			return helpers.logSuccess( 'Parent theme exists.' );
		}

		this.execSync( `composer create-project roots/sage ${ this.getBasePath( 'parentTheme ') }` );
		this.execSync( 'wp theme activate sage' );

		helpers.logSuccess( 'Parent theme created.' );
	}

	exec( command, type = 'project', callback = null ) {

		const options = {
			cwd: this.getBasePath( type ),
		};

		return cp.exec( command, options, ( error, stdout, stderr ) => {

			// Exit on error.
			if ( null !== error ) {
				return helpers.logFailure( `Error: ${ error }` );
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
			return cp.execSync( command, options );
		} catch( error ) {
			helpers.logFailure( `Error: ${ error }` );
			return false;
		}
	}

	getBasePath( type = 'project' ) {

		const basePaths = {
			project:     '.',
			vvv:         'vvv-config',
			bedrock:     'htdocs',
			wordpress:   'htdocs/web/wp',
			plugin:      `htdocs/web/app/plugins/${ __config.plugin.slug }`,
			theme:       `htdocs/web/app/themes/${ __config.theme.slug }`,
			parentTheme: 'htdocs/web/app/themes/sage',
		};

		let base = basePaths[ _.camelCase( type ) ];

		if ( ! base ) {
			base = '';
		}

		return path.join( __path.project, base );
	}

	createFiles( type = 'project' ) {

		const files = this._files[ type ].create;

		if ( ! files ) {
			helpers.logFailure( `Error: no files found in config for "${ type }".` );
			return false;
		}

		for ( let file of files ) {
			this.scaffoldFile( file, type );
		}
	}

	linkFiles( type = 'project' ) {

		const base  = this.getBasePath( type );
		const files = this._files[ type ].remove;

		if ( ! files ) {
			return;
		}

		for ( let [ source, dest ] of files ) {

			let destFile = path.basename( source );
			let destRel  = path.join( dest, destFile );
			let destAbs  = path.join( __path.project, destRel );

			console.log( `Checking for ${ destRel }...` );
			helpers.logSuccess( `Link to ${ source } created` );
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
			rimraf.sync( filePath );
		}
	}

	scaffoldFile( file, type = 'project' ) {

		console.log( `Checking for ${ file }...` );

		let sourceFile = `${ path.basename( file ) }.mustache`;

		// Templates for hidden files start with `_` instead of `.`
		if ( 0 === file.indexOf( '.' ) ) {
			sourceFile = sourceFile.replace( '.', '_' );
		}

		if ( type ) {
			sourceFile = path.join( _.kebabCase( type ), sourceFile );
		}

		const base   = this.getBasePath( type );
		const dest   = path.join( base, file );
		const source = path.join( __path.templates, sourceFile );

		if ( helpers.fileExists( dest ) ) {
			return helpers.logSuccess( `${ file } exists.` );
		}

		mkdirp.sync( base );

		try {
			const contentOriginal = fs.readFileSync( source ).toString();
			const contentRendered = mustache.render( contentOriginal, __config );

			fs.writeFileSync( dest, contentRendered );

			return helpers.logSuccess( `${ file } created.` );
		} catch ( error ) {
			helpers.logFailure( `Error: ${ error }` );
		}
	}
}

export default new Scaffold();
