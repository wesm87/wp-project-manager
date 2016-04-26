/**
 * Gulpfile.
 *
 * jshint mocha: false
 */

'use strict';

import path             from 'path';
import gulp             from 'gulp';
import nsp              from 'gulp-nsp';
import babel            from 'gulp-babel';
import istanbul         from 'gulp-istanbul';
import mocha            from 'gulp-mocha';
import { Instrumenter } from 'isparta';

class GulpTasks {

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
	 * Once ES7 arrives we can just define class methods as arrow functions.
	 * In the meantime, we need to bind each task method to the class.
	 */
	constructor() {
		this.tasks.forEach( task =>
			gulp.task( task, this[ task ].bind( this ) )
		);
	}

	default() {
		return gulp.series( this.test, this.build );
	}

	watch() {
		gulp.watch( this.files.js.watch, this.test );
	}

	build( done ) {
		return gulp
			.src(  this.files.js.source )
			.pipe( babel() )
			.pipe( gulp.dest( this.files.js.dest ) )
			.on( 'finish', () => nsp( this.config.nsp, done ) );
	}

	test() {
		return gulp
			.src(  this.files.js.tests )
			.pipe( mocha( this.config.mocha ) );
	}

	coverage( done ) {
		return gulp
			.src(  this.files.js.source )
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
	 */
	nsp( done ) {
		return nsp( this.config.nsp, done );
	}
}

new GulpTasks();
