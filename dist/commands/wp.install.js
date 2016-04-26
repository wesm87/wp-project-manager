'use strict';

var _log = require('../include/log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
	command: 'wp install',
	describe: 'install WordPress',
	builder: {},
	handler: function handler() {
		_log2.default.error('This feature is not ready');
	}
};