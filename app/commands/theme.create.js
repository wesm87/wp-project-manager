
import scaffold from '../include/scaffold';

module.exports = {
	command:  'theme create',
	describe: 'scaffold new child theme',
	builder:  {},
	handler() {
		scaffold.init();
		scaffold.initTheme();
	},
};
