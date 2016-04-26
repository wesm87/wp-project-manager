'use strict';

import scaffold from '../include/scaffold';

module.exports = {
	command:  'project create',
	describe: 'scaffold new project',
	builder:  {},
	handler() {
		scaffold.init();
	},
};
