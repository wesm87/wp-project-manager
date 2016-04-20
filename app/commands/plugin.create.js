
import project  from '../include/project';
import scaffold from '../include/scaffold';

module.exports = {
	command:  'plugin create',
	describe: 'scaffold new plugin',
	builder:  {},
	handler( argv ) {
		scaffold.initPlugin();
	},
};
