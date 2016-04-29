
import project from '../include/project';

module.exports = {
	command:  'config create',
	describe: 'create a new project.yml file with the default settings',
	builder:  {},
	handler( argv ) {
		project.createConfigFile( argv.force );
	},
};
