
import '../setup';

import chai      from 'chai';
import sinonChai from 'sinon-chai';

chai.use( sinonChai ).should();

const commandModule = require( `${ __appPath }/commands/config.create` );
const projectMock   = require( `${ __appPath }/include/project` ).default;

describe( 'commands', () => {

	describe( 'config.create.js', () => {

		it( 'should call `project.createConfigFile()`', () => {

			const stub = projectMock.createConfigFile;

			stub.should.have.callCount( 0 );

			commandModule.handler( {} );

			stub.should.have.callCount( 1 );
		} );

	} );

} );
