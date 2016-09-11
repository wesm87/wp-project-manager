
import log     from '../include/log';
import project from '../include/project';

export default {
	command:  'config display',
	describe: 'parse and display project settings',
	builder:  {},
	handler() {
		log.message( project.config );
	},
};
