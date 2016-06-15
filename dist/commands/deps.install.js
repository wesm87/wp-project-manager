'use strict';

var _deps = require('../include/deps');

var _deps2 = _interopRequireDefault(_deps);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
	command: 'deps install [--type=all|npm|bower|composer]',
	describe: 'install project, theme, and plugin dependencies',
	builder: {},
	handler: function handler(argv) {
		_deps2.default.install(argv.type);
	}
};