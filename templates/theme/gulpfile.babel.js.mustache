'use strict';

// Gulp
import gulp         from 'gulp';

// Files
import rename       from 'gulp-rename';
import concat       from 'gulp-concat';
import sourcemaps   from 'gulp-sourcemaps';

// CSS / Sass
import sass         from 'gulp-sass';
import cssmin       from 'gulp-cssmin';
import autoprefixer from 'gulp-autoprefixer';

// JS
import babel        from 'gulp-babel';
import uglify       from 'gulp-uglify';
import jshint       from 'gulp-jshint';

class GulpTasks {

	get config() {
		return {
			sass: {
				outputStyle: 'expanded',
				precision: 10,
				includePaths: [ 'bower_components', 'node_modules' ],
			},
			autoprefixer: {
				browsers: [
					'last 2 versions',
					'android 4',
					'opera 12',
					'ie > 8',
					'> 1%',
				],
			}
		};
	}

	get files() {
		return {
			css: {
				source: 'assets/source/css/**/*.scss',
				dest:   'assets/dist/css/'
			},
			js: {
				source: 'assets/source/js/**/*.js',
				dest:   'assets/dist/js',
			},
		};
	}

	get tasks() {
		return [
			'build',
			'buildCSS',
			'buildJS',
			'watch',
			'default'
		];
	}

	constructor() {

		// Once ES7 arrives we can just define class methods as arrow functions.
		// In the meantime, we need to bind each task method to the class.
		this.tasks.forEach(( task ) => {
			this[ task ] = this[ task ].bind( this );
			gulp.task( task, this[ task ] );
		});
	}

	build( done ) {
		this.buildCSS();
		this.buildJS();
		return done();
	}

	buildCSS() {
		return gulp
			.src( this.files.css.source )
			.pipe( sourcemaps.init() )
			.pipe( sass( this.config.sass ) )
			.pipe( concat( 'app.css' ) )
			.pipe( autoprefixer( this.config.autoprefixer ) )
			.pipe( gulp.dest( this.files.css.dest ) )
			.pipe( cssmin() )
			.pipe( rename({ suffix: '.min' }) )
			.pipe( sourcemaps.write( './maps' ) )
			.pipe( gulp.dest( this.files.css.dest ) );
	}

	buildJS() {
		return gulp
			.src( this.files.js.source )
			.pipe( sourcemaps.init() )
			.pipe( babel() )
			.pipe( concat( 'app.js' ) )
			.pipe( gulp.dest( this.files.js.dest ) )
			.pipe( uglify() )
			.pipe( rename({ suffix: '.min' }) )
			.pipe( sourcemaps.write( './maps' ) )
			.pipe( gulp.dest( this.files.js.dest ) );

	}

	watch() {
		gulp.watch( this.files.js.source, this.buildJS() );
		gulp.watch( this.files.css.source, this.buildCSS() );
	}

	default() {
		return gulp.series( this.build );
	}
}

export default new GulpTasks();
