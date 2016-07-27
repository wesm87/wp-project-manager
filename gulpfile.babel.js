/**
 * Gulpfile.
 */


import 'babel-polyfill';

import fs       from 'fs-extra';
import path     from 'path';
import yargs    from 'yargs';
import semver   from 'semver';

import gulp     from 'gulp';
import nsp      from 'gulp-nsp';
import babel    from 'gulp-babel';
import mocha    from 'gulp-mocha';
import istanbul from 'gulp-istanbul';

import { Instrumenter } from 'isparta';

const pkg = require( './package.json' );

/**
 * Gulp tasks.
 */
class GulpTasks {

	/**
	 * Tasks.
	 *
	 * @return {Array}
	 */
	get tasks() {
		return [
			'default',
			'watch',
			'build',
			'test',
			'coverage',
			'nsp',
			'bump',
			'release',
		];
	}

	/**
	 * Task config.
	 *
	 * @return {Object}
	 */
	get config() {
		return {
			nsp: {
				package: path.resolve( 'package.json' ),
			},
			istanbul: {
				read: {
					includeUntested: true,
					instrumenter:    Instrumenter,
				},
				write: {
					reporters: [ 'lcov', 'text', 'text-summary', 'json', 'html' ],
				},
			},
			mocha: {
				reporter:  'spec',
				require:   'chai',
				compilers: 'js:babel-core/register',
				recursive: true,
			},
		};
	}

	/**
	 * File paths.
	 *
	 * @return {Object}
	 */
	get files() {
		return {
			js: {
				source: 'app/**/*.js',
				dest:   'dist',
				tests:  'test/**/*.js',
				watch:  [ 'app/**/*.js', 'test/**/*.js' ],
			},
			coverage: {
				source: path.join( __dirname, 'coverage/lcov.info' ),
			},
		};
	}

	/**
	 * Constructor.
	 *
	 * Once ES7 arrives we can just define class methods as arrow functions.
	 * In the meantime, we need to bind each task method to the class.
	 */
	constructor() {
		this.tasks.forEach( task =>
			gulp.task( task, this[ task ].bind( this ) )
		);
	}

	/**
	 * Default task.
	 *
	 * @param {Function} done Async callback.
	 */
	async default( done ) {
		await this.test( done );
		await this.build( done );

		done();
	}

	/**
	 * Watch task.
	 */
	watch() {
		gulp.watch( this.files.js.watch, this.test );
	}

	/**
	 * Build task.
	 *
	 * @param  {Function} done Async callback.
	 * @return {Function}
	 */
	build( done ) {
		return gulp.src( this.files.js.source )
			.pipe( babel() )
			.pipe( gulp.dest( this.files.js.dest ) )
			.on( 'finish', () => this.nsp( done ) );
	}

	/**
	 * Unit tests.
	 *
	 * @return {Function}
	 */
	test() {
		return gulp.src( this.files.js.tests )
			.pipe( mocha( this.config.mocha ) );
	}

	/**
	 * Code coverage.
	 *
	 * @param  {Function} done Async callback.
	 * @return {Function}
	 */
	coverage( done ) {
		return gulp.src( this.files.js.source )
			.pipe( istanbul( this.config.istanbul.read ) )
			.pipe( istanbul.hookRequire() )
			.on( 'finish', () =>
				this.test()
					.pipe( istanbul.writeReports( this.config.istanbul.write ) )
					.on( 'end', done )
			);
	}

	/**
	 * Checks for any potential security issues (NSP = Node Security Project).
	 *
	 * @param  {Function} done Async callback.
	 * @return {Function}
	 */
	nsp( done ) {
		return nsp( this.config.nsp, done );
	}

	/**
	 * Automatically bumps the version number for a new release.
	 *
	 * @param {Function} done Async callback.
	 */
	bump( done ) {

		const argv        = yargs.argv;
		const increment   = 1;
		const jsonSpaces  = 2;
		const versionInfo = {
			major: semver.major( pkg.version ),
			minor: semver.minor( pkg.version ),
			patch: semver.patch( pkg.version ),
		};

		if ( argv.major ) {
			versionInfo.major += increment;
			versionInfo.minor = 0;
			versionInfo.patch = 0;
		} else if ( argv.minor ) {
			versionInfo.minor += increment;
			versionInfo.patch = 0;
		} else if ( argv.patch ) {
			versionInfo.patch += increment;
		}

		const version = `${ versionInfo.major }.${ versionInfo.minor }.${ versionInfo.patch }`;

		pkg.version = version;

		const pkgJSON = JSON.stringify( pkg, null, jsonSpaces );

		console.log( argv );
		console.log( versionInfo );
		console.log( version );

		fs.writeFileSync( './package.json', `${ pkgJSON }\n` );

		done();
	}

	/**
	 * Prepares a new release - runs tests, creates a new build, and bumps the
	 * version number.
	 *
	 * @param {Function} done Async callback.
	 */
	async release( done ) {

		await this.test( done );
		await this.build( done );
		await this.bump( done );

		done();
	}
}

new GulpTasks();
