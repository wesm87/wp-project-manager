
import sinon from 'sinon';

import { env, ENV, inject } from 'mocktail';

env( ENV.TESTING );

class ProjectMock {

	static get config() {
		return {

		};
	}

	// eslint-disable-next-line no-empty-function
	static createConfigFile() {

	}

}

// eslint-disable-next-line no-magic-numbers
sinon.stub( ProjectMock, 'createConfigFile' ).returnsArg( 0 );

inject( 'Project', ProjectMock );
