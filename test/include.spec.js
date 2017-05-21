/* eslint-env mocha */

import chai from 'chai';

import projectModule from '../app/include/project';
import scaffoldModule from '../app/include/scaffold';
import depsModule from '../app/include/deps';
import logModule from '../app/include/log';

const should = chai.should();

describe('include', () => {
  describe('project.js', () => {
    it('should export a non-empty object', () => {
      should.exist(projectModule);
    });

    it('should export a `config` property', () => {
      projectModule.should.have.property('config');
    });
  });

  describe('scaffold.js', () => {
    it('should export a non-empty object', () => {
      should.exist(scaffoldModule);
    });
  });

  describe('deps.js', () => {
    it('should export a non-empty object', () => {
      should.exist(depsModule);
    });
  });

  describe('log.js', () => {
    it('should export a non-empty object', () => {
      should.exist(logModule);
    });
  });
});
