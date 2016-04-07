'use strict';

import path      from 'path';
import gulp      from 'gulp';
import nsp       from 'gulp-nsp';
import isparta   from 'isparta';
import istanbul  from 'gulp-istanbul';
import mochaTask from 'gulp-mocha';
import coveralls from 'gulp-coveralls';

class GulpTasks {

	constructor() {

		// Task configuration
		this.config = {
			nsp: {
				package: path.resolve( 'package.json' ),
			},
			istanbul: {
				read: {
					includeUntested: true,
					instrumenter:    isparta.Instrumenter,
				},
				write: {
					reporters: [ 'lcov' ],
				},
			},
			mocha: {
				reporter: 'spec',
			},
		};

		// Source / dest files & folders
		this.files = {
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

	registerTasks() {
		gulp.task( 'watch', this.watch );
		gulp.task( 'test', this.test );
		gulp.task( 'prepublish', this.shrinkWrap );
		gulp.task( 'default', this.default );
	}

	watch() {
		gulp.watch( this.js.files.watch, this.test );
	}

	shrinkWrap() {
		return nsp( this.config.nsp );
	}

	coveralls() {
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
