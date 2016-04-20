'use strict';

var _project = require('../include/project');

var _project2 = _interopRequireDefault(_project);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
	command: 'config create',
	describe: 'create a new project.yml file with the default settings',
	builder: {},
	handler: function handler(argv) {
		_project2.default.createConfigFile(argv.force);
	}
};