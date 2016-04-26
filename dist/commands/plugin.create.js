'use strict';

var _scaffold = require('../include/scaffold');

var _scaffold2 = _interopRequireDefault(_scaffold);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
	command: 'plugin create',
	describe: 'scaffold new plugin',
	builder: {},
	handler: function handler() {
		_scaffold2.default.initPlugin();
	}
};