'use strict';

import path         from 'path';
import gulp         from 'gulp';
import nsp          from 'gulp-nsp';
import babel        from 'gulp-babel';
import istanbul     from 'gulp-istanbul';
import mochaTask    from 'gulp-mocha';
import coveralls    from 'gulp-coveralls';
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
		this.tasks.forEach(( task ) => {
			this[ task ] = this[ task ].bind( this );
			gulp.task( task, this[ task ] );
		});
	}

	watch() {
		gulp.watch( this.files.js.watch, this.test );
	}

	build() {
		return gulp
			.src(  this.files.js.source )
			.pipe( babel() )
			.pipe( gulp.dest( this.files.js.dest ) );
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

	test( done ) {
		console.log( this.config.istanbul.read );
		gulp
			.src(  this.files.js.source )
			.pipe( istanbul( this.config.istanbul.read ) )
			.pipe( istanbul.hookRequire() )
			.on( 'finish', () => {
				console.log( this.config.mocha );
				console.log( this.config.istanbul );
				console.log( this.files.js.tests );
				return gulp
					.src(  this.files.js.tests )
					.pipe( mochaTask( this.config.mocha ) )
					.pipe( istanbul.writeReports( this.config.istanbul.write ) )
					.on( 'end', done );
			});
	}

	default() {
		return gulp.series( this.test, this.watch );
	}
}

new GulpTasks();



function test() {
	return gulp.src( 'test/**/*.js' )
		.pipe( mochaTask() );
}

function coverage( done ) {
	gulp
		.src([ 'app/**/*.js' ])
		.pipe( istanbul({ instrumenter: Instrumenter }) )
		.pipe( istanbul.hookRequire() )
		.on( 'finish', function() {
			return test()
				.pipe(istanbul.writeReports())
				.on('end', done);
		});
}

// Run our tests as the default task
gulp.task( 'default', test );
gulp.task( 'coverage', coverage );
