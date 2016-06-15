
import deps from '../include/deps';

module.exports = {
	command:  'deps install [--type=all|npm|bower|composer]',
	describe: 'install project, theme, and plugin dependencies',
	builder:  {},
	handler( argv ) {
		deps.install( argv.type );
	},
};
