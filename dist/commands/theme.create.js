'use strict';

var _project = require('../include/project');

var _project2 = _interopRequireDefault(_project);

var _scaffold = require('../include/scaffold');

var _scaffold2 = _interopRequireDefault(_scaffold);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
	command: 'theme create',
	describe: 'scaffold new child theme',
	builder: {},
	handler: function handler(argv) {
		_scaffold2.default.initTheme();
	}
};