
import '../setup';

import chai      from 'chai';
import sinonChai from 'sinon-chai';

import commandModule from '../../app/commands/config.create';
import projectMock   from '../../app/include/project';

chai.use( sinonChai ).should();

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
