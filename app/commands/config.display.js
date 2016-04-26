'use strict';

import log     from '../include/log';
import project from '../include/project';

module.exports = {
	command:  'config display',
	describe: 'parse and display project settings',
	builder:  {},
	handler() {
		log.message( project.config );
	}
};
