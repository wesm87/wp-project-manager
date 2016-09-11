
import scaffold from '../include/scaffold';

export default {
	command:  'theme create-tests',
	describe: 'create theme unit tests',
	builder:  {},
	handler() {
		scaffold.init();
		scaffold.createThemeTests();
	},
};
