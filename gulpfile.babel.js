/**
 * Gulpfile.
 */


import 'babel-polyfill';

import path   from 'path';
import gulp   from 'gulp';
import gulpDI from 'gulp-di';

import { Instrumenter } from 'isparta';

/**
 * Task config.
 *
 * @param {Object}
 */
const taskConfig = {
  nsp: {
    package: path.resolve( 'package.json' ),
  },
  istanbul: {
    read: {
      includeUntested: true,
      instrumenter:    Instrumenter,
    },
    write: {
      reporters: [ 'lcov', 'text-summary' ],
    },
  },
  mocha: {
    reporter:  'spec',
    require:   'chai',
    compilers: 'js:babel-core/register',
    recursive: true,
  },
};

/**
 * Task files.
 *
 * @param {Object}
 */
const taskFiles = {
  js: {
    source: 'app/index.js',
    dest:   'dist',
    tests:  'test/**/*.js',
    watch:  [ 'app/**/*.js', 'test/**/*.js' ],
  },
  coverage: {
    source: path.join( __dirname, 'coverage/lcov.info' ),
  },
};

const diConfig = {
  pattern: [
    'gulp-*',
    'gulp.*',
    '!gulp-di',
    'rollup',
    'rollup-plugin-*',
  ],
};

gulpDI( gulp, diConfig )
  .provide( 'taskConfig', taskConfig )
  .provide( 'taskFiles', taskFiles )
  .modules( './gulp/lib' )
  .tasks( './gulp/tasks' )
  .resolve();

/**
 * Gulp tasks.
 */
//   /**
//    * Default task.
//    *
//    * @param {Function} done Async callback.
//    */
//   async default( done ) {
//     await this.test( done );
//     await this.build( done );
//
//     done();
//   }
//
//
//   /**
//    * Automatically bumps the version number for a new release.
//    *
//    * @param {Function} done Async callback.
//    */
//   bump( done ) {
//
//     const argv        = yargs.argv;
//     const increment   = 1;
//     const jsonSpaces  = 2;
//     const versionInfo = {
//       major: semver.major( pkg.version ),
//       minor: semver.minor( pkg.version ),
//       patch: semver.patch( pkg.version ),
//     };
//
//     if ( argv.major ) {
//       versionInfo.major += increment;
//       versionInfo.minor = 0;
//       versionInfo.patch = 0;
//     } else if ( argv.minor ) {
//       versionInfo.minor += increment;
//       versionInfo.patch = 0;
//     } else if ( argv.patch ) {
//       versionInfo.patch += increment;
//     }
//
//     const version = `${ versionInfo.major }.${ versionInfo.minor }.${ versionInfo.patch }`;
//
//     pkg.version = version;
//
//     const pkgJSON = JSON.stringify( pkg, null, jsonSpaces );
//
//     fs.writeFileSync( './package.json', `${ pkgJSON }\n` );
//
//     done();
//   }
//
//   /**
//    * Prepares a new release - creates a new build, runs tests, updates code
//    * coverage info, and bumps the version number.
//    *
//    * @param {Function} done Async callback.
//    */
//   async release( done ) {
//
//     await this.build( done );
//     await this.coverage( done );
//     await this.bump( done );
//
//     done();
//   }
// }
//
// new GulpTasks();
