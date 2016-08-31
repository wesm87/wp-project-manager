'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @module
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _colors = require('colors');

var _colors2 = _interopRequireDefault(_colors);

var _mocktail = require('mocktail');

var _project = require('./project');

var _project2 = _interopRequireDefault(_project);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * The number of spaces to use for a tab when formatting JSON strings.
 */
var JSON_TAB_WIDTH = 2;

/**
 * Logger class. Contains various methods (debug, info, ok, warn, error, etc.)
 * that take a string or object-like value, apply an associated style, and log
 * it. Some styles also prepend an associated icon identifier to the message.
 */

var Log = function () {
	_createClass(Log, [{
		key: 'styles',


		/**
   * Message styles.
   *
   * @since 0.4.0
   *
   * @member {Object}
   */
		get: function get() {
			return {
				ok: ['green'],
				info: ['cyan'],
				warn: ['yellow', 'underline'],
				error: ['red', 'underline'],
				debug: ['cyan', 'underline'],
				message: ['reset']
			};
		}

		/**
   * Message icons. Includes plain-text fallbacks for Windows, since the CMD
   * prompt supports a very limited character set.
   *
   * @since 0.4.0
   *
   * @see https://github.com/sindresorhus/log-symbols
   *
   * @member {Object}
   */

	}, {
		key: 'icons',
		get: function get() {

			if ('win32' === process.platform) {
				return {
					ok: '√',
					info: 'i',
					warn: '‼',
					error: '×',
					debug: '*'
				};
			}

			return {
				ok: '✔',
				info: 'ℹ',
				warn: '⚠',
				error: '✘',
				debug: '✱'
			};
		}

		/**
   * Class constructor.
   *
   * @since 0.4.0
   */

	}]);

	function Log() {
		_classCallCheck(this, Log);

		if (!this.instance) {
			this.init();
		}

		return this.instance;
	}

	/**
  * Initialize class and store the class instance.
  *
  * @since 0.5.0
  */


	_createClass(Log, [{
		key: 'init',
		value: function init() {
			var _this = this;

			// Set the colors theme based on our styles.
			_colors2.default.setTheme(this.styles);

			// Automatically create methods for each style.
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				var _loop = function _loop() {
					var style = _step.value;

					_this[style] = function (message) {
						return _this._log(message, style);
					};
				};

				for (var _iterator = _lodash2.default.keys(this.styles)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					_loop();
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}

			this.instance = this;
		}

		/**
   * Logs a message with an optional style.
   *
   * If message is an object, array, function, class, etc. it is converted to
   * a string using `JSON.stringify()`.
   *
   * @since 0.4.0
   *
   * @access private
   *
   * @param {*}      message The message to log.
   * @param {String} [style] A style to apply to the message.
   */

	}, {
		key: '_log',
		value: function _log(message, style) {

			// Convert object-like messages to string.
			if (_lodash2.default.isObjectLike(message)) {
				message = JSON.stringify(message, null, JSON_TAB_WIDTH);
			}

			// Don't log anything if message is empty.
			if (_lodash2.default.isEmpty(message)) {
				return;
			}

			// Make sure the message is a string.
			message = message.toString();

			// Check if a valid style was specified.
			if (style && message[style]) {

				// Bail if the style is 'debug' and debugging is disabled.
				if ('debug' === style && !_project2.default.debug) {
					return;
				}

				// If the style has an associated icon, prepend it to the message.
				if (this.icons[style]) {
					message = this.icons[style] + ' ' + message;
				}

				// Apply the style to the message.
				message = message[style];
			}

			// Log the message.
			console.log(message);
		}
	}]);

	return Log;
}();

exports.default = (0, _mocktail.mock)(new Log());