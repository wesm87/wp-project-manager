'use strict';

var _log = require('../include/log');

var _log2 = _interopRequireDefault(_log);

var _project = require('../include/project');

var _project2 = _interopRequireDefault(_project);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
	command: 'config display',
	describe: 'parse and display project settings',
	builder: {},
	handler: function handler() {
		_log2.default.message(_project2.default.config);
	}
};