/* eslint-env mocha */

import chai from 'chai';

const should = chai.should();

const basePath = '../app/include';

describe( 'include', () => {

	describe( 'project.js', () => {
		const currentModule = require( `${ basePath }/project` ).default;

		it( 'should export a non-empty object', () => {
			should.exist( currentModule );
		} );

		it( 'should export a `config` property', () => {
			currentModule.should.have.property( 'config' );
		} );
	} );

	describe( 'scaffold.js', () => {
		const currentModule = require( `${ basePath }/scaffold` ).default;

		it( 'should export a non-empty object', () => {
			should.exist( currentModule );
		} );
	} );

	describe( 'helpers.js', () => {
		const currentModule = require( `${ basePath }/helpers` ).default;

		it( 'should export a non-empty object', () => {
			should.exist( currentModule );
		} );
	} );

	describe( 'deps.js', () => {
		const currentModule = require( `${ basePath }/deps` ).default;

		it( 'should export a non-empty object', () => {
			should.exist( currentModule );
		} );
	} );

	describe( 'log.js', () => {
		const currentModule = require( `${ basePath }/log` ).default;

		it( 'should export a non-empty object', () => {
			should.exist( currentModule );
		} );
	} );

} );
