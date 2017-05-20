// @flow
/* eslint-disable import/no-extraneous-dependencies */

/**
 * Gulpfile.
 */

import 'babel-polyfill';

import fs from 'fs-extra';
import path from 'path';
import yargs from 'yargs';
import semver from 'semver';

import babel from 'rollup-plugin-babel';

import gulp from 'gulp';
import gulpDI from 'gulp-di';
import nsp from 'gulp-nsp';
import mocha from 'gulp-mocha';
import istanbul from 'gulp-istanbul';

import { rollup } from 'rollup';
import { Instrumenter } from 'isparta';

import pkg from './package.json';

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
    dest: 'dist',
    tests: 'test/**/*.js',
    watch: ['app/**/*.js', 'test/**/*.js'],
  },
  coverage: {
    source: path.join(__dirname, 'coverage/lcov.info'),
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

gulpDI(gulp, diConfig)
  .provide('taskConfig', taskConfig)
  .provide('taskFiles', taskFiles)
  .modules('./gulp/lib')
  .tasks('./gulp/tasks')
  .resolve();
