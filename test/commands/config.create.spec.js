
import '../setup';

import chai from 'chai';

chai.should();

const commandModule = require( `${ __appPath }/commands/config.create` );
const projectMock   = require( `${ __appPath }/include/project` ).default;

describe( 'commands', () => {

	describe( 'config.create.js', () => {

		it( 'should call `project.createConfigFile()`', () => {
			projectMock.createConfigFile.callCount.should.equal( 0 );

			commandModule.handler( {} );

			projectMock.createConfigFile.callCount.should.equal( 1 );
		} );

	} );

} );
