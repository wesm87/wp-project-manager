'use strict';

import scaffold from '../include/scaffold';

module.exports = {
	command:  'plugin create-tests',
	describe: 'create plugin unit tests',
	builder:  {},
	handler() {
		scaffold.createPluginTests();
	},
};
