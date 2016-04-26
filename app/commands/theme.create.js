'use strict';

import scaffold from '../include/scaffold';

module.exports = {
	command:  'theme create',
	describe: 'scaffold new child theme',
	builder:  {},
	handler() {
		scaffold.initTheme();
	},
};
