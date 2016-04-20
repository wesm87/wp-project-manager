
import project  from '../include/project';
import scaffold from '../include/scaffold';

module.exports = {
	command:  'theme create',
	describe: 'scaffold new child theme',
	builder:  {},
	handler( argv ) {
		scaffold.initTheme();
	},
};
