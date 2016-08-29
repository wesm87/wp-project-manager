
import '../setup';

import chai from 'chai';

const should = chai.should();

describe( 'commands', () => {

	const commands = [
		'config.create',
		'config.display',
		'deps.install',
		'plugin.create-tests',
		'plugin.create',
		'project.create',
		'theme.create-tests',
		'theme.create',
		'wp.install',
	];

	for ( const command of commands ) {

		describe( command, () => {

			const commandModule = require( `${ __appPath }/commands/${ command }` );

			it( 'should export a non-empty object', () => {
				should.exist( commandModule );
				commandModule.should.be.an( 'object' );
			} );

			it( 'should export a `command` property', () => {
				commandModule.should.have.property( 'command' );
			} );

			it( 'should export a `describe` property', () => {
				commandModule.should.have.property( 'describe' );
			} );

			it( 'should export a `builder` property', () => {
				commandModule.should.have.property( 'builder' );
			} );

			it( 'should export a `handler()` method', () => {
				commandModule.should.respondTo( 'handler' );
			} );
		} );
	}
} );
