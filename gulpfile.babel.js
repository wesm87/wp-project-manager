'use strict';

import path      from 'path';
import gulp      from 'gulp';
import nsp       from 'gulp-nsp';
import babel     from 'gulp-babel';
import istanbul  from 'gulp-istanbul';
import mochaTask from 'gulp-mocha';
import coveralls from 'gulp-coveralls';

import { Instrumenter } from 'isparta';

class GulpTasks {

	get tasks() {
		return [
			'watch',
			'build',
			'nsp',
			'coverage',
			'test',
			'default',
		];
	}

	get config() {
		return {
			build: {
				source: 'app/**/*.js',
				dest:   'dist',
			},
			nsp: {
				package: path.resolve( 'package.json' ),
			},
			istanbul: {
				read: {
					includeUntested: true,
					instrumenter:    Instrumenter,
				},
				write: {
					reporters: [ 'lcov' ],
				},
			},
			mocha: {
				reporter: 'spec',
			},
		};
	}

	get files() {
		return {
			js: {
				source: [
					'index.js',
					'bin/**/*.js',
				],
				tests: [
					'test/**/*.js',
				],
				watch: [
					'index.js',
					'bin/**/*.js',
					'test/**/*.js',
				]
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
		this.tasks.forEach(( task ) => {
			this[ task ] = this[ task ].bind( this );
			gulp.task( task, this[ task ] );
		});
	}

	watch() {
		gulp.watch( this.js.files.watch, this.test );
	}

	build() {
		return gulp
			.src(  this.config.build.source )
			.pipe( babel() )
			.pipe( gulp.dest( this.config.build.dest ) );
	}

	/**
	 * Checks for any potential security issues (NSP = Node Security Project).
	 */
	nsp( done ) {
		return nsp( this.config.nsp, done );
	}

	coverage() {
		if ( ! process.env.CI ) {
			return;
		}

		return gulp
			.src(  this.files.coverage.source )
			.pipe( coveralls() );
	}

	test() {
		return gulp
			.src(  this.files.js.source )
			.pipe( istanbul( this.config.istanbul.read ) )
			.pipe( istanbul.hookRequire() )
			.on( 'finish', () => {
				return gulp
					.src(  this.files.js.tests )
					.pipe( mochaTask( this.config.mocha ) )
					.pipe( istanbul.writeReports( this.config.istanbul.write ) );
			});
	}

	default() {
		return gulp.series( this.test, this.watch );
	}
}

new GulpTasks();
