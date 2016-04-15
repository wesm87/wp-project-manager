'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _colors = require('colors');

var _colors2 = _interopRequireDefault(_colors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Log = function () {
	function Log() {
		_classCallCheck(this, Log);
	}

	_createClass(Log, [{
		key: 'info',


		/**
   * Logs an informational message.
   *
   * @since 0.2.0
   *
   * @param {string} message
   */
		value: function info(message) {
			console.log(message);
		}

		/**
   * Logs a debug message.
   *
   * @since 0.2.0
   *
   * @param {string} message
   */

	}, {
		key: 'debug',
		value: function debug(message) {
			console.log(('' + message).cyan);
		}

		/**
   * Logs an OK symbol and optional message.
   *
   * @since 0.2.0
   *
   * @param {string} [message]
   */

	}, {
		key: 'ok',
		value: function ok() {
			var message = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

			console.log(('✔ ' + message).green);
		}

		/**
   * Logs a warning symbol and optional message.
   *
   * @since 0.2.0
   *
   * @param {string} [message]
   */

	}, {
		key: 'warn',
		value: function warn() {
			var message = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

			console.log(('✱ ' + message).yellow);
		}

		/**
   * Logs an error symbol and optional message.
   *
   * @since 0.2.0
   *
   * @param {string} [message]
   */

	}, {
		key: 'error',
		value: function error() {
			var message = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

			console.log(('✘ ' + message).red.underline);
		}
	}]);

	return Log;
}();

exports.default = new Log();