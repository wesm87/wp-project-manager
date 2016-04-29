
import scaffold from '../include/scaffold';

module.exports = {
	command:  'theme create-tests',
	describe: 'create theme unit tests',
	builder:  {},
	handler() {
		scaffold.init();
		scaffold.createThemeTests();
	},
};
