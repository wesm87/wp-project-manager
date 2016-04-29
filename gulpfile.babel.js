/**
 * Gulpfile.
 */


import 'babel-polyfill';

import path     from 'path';
import gulp     from 'gulp';
import nsp      from 'gulp-nsp';
import babel    from 'gulp-babel';
import mocha    from 'gulp-mocha';
import istanbul from 'gulp-istanbul';

import { Instrumenter } from 'isparta';

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
		await this.test();
		await this.build();

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
}

new GulpTasks();
