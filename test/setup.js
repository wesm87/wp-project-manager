
import sinon from 'sinon';

import { env, ENV, inject } from 'mocktail';

env( ENV.TESTING );

class ProjectMock {

	static get config() {
		return {

		};
	}

	static createConfigFile( force = false ) {
		return force;
	}

}

sinon.stub( ProjectMock, 'createConfigFile' );

inject( 'Project', ProjectMock );
