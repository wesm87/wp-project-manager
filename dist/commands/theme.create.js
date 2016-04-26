'use strict';

var _scaffold = require('../include/scaffold');

var _scaffold2 = _interopRequireDefault(_scaffold);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
	command: 'theme create',
	describe: 'scaffold new child theme',
	builder: {},
	handler: function handler() {
		_scaffold2.default.initTheme();
	}
};