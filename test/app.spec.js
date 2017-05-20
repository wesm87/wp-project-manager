
import chai from 'chai';

import './setup';

import app from '../app/';

const should = chai.should();

describe('app', () => {
  describe('index.js', () => {
    it('should export a non-empty object', () => {
      should.exist(app);
      app.should.be.an('object');
    });
  });
});
