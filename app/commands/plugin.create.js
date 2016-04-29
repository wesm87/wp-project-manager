
import scaffold from '../include/scaffold';

module.exports = {
	command:  'plugin create',
	describe: 'scaffold new plugin',
	builder:  {},
	handler() {
		scaffold.init();
		scaffold.initPlugin();
	},
};
