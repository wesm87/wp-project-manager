'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // eslint-disable-line no-shadow

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _jsYaml = require('js-yaml');

var _jsYaml2 = _interopRequireDefault(_jsYaml);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Ratios used when converting numbers from one format to another.
 *
 * @since 0.7.7
 *
 * @type {Object}
 */
var RATIOS = {
	BYTES_TO_HEX: 0.5,
	BYTES_TO_BASE64: 0.75
};

/**
 * Helper functions.
 */

var Helpers = function () {
	function Helpers() {
		_classCallCheck(this, Helpers);
	}

	_createClass(Helpers, null, [{
		key: 'pathExists',


		/**
   * Checks if the specified file or directory exists.
   *
   * @since 0.1.0
   * @since 0.2.0 Added 'symlink' type.
   *
   * @param  {string} path The path to check.
   * @param  {string} type Optional. A type to check the path against.
   * @return {bool}        True if path exists and is `type`; false if not.
   */
		value: function pathExists(path) {
			var type = arguments.length <= 1 || arguments[1] === undefined ? 'any' : arguments[1];

			try {
				var info = _fsExtra2.default.lstatSync(path);

				switch (type) {
					case 'file':
						return info.isFile();
					case 'folder':
					case 'directory':
						return info.isDirectory();
					case 'link':
					case 'symlink':
						return info.isSymbolicLink();
					default:
						return !!info;
				}
			} catch (error) {
				return false;
			}
		}

		/**
   * Checks if the specified file exists.
   *
   * @since 0.1.0
   *
   * @param  {string} path The path to the file to check.
   * @return {bool}        True the file exists; false if not.
   */

	}, {
		key: 'fileExists',
		value: function fileExists(path) {
			return this.pathExists(path, 'file');
		}

		/**
   * Checks if the specified directory exists.
   *
   * @since 0.1.0
   *
   * @param  {string} path The path to the directory to check.
   * @return {bool}        True the directory exists; false if not.
   */

	}, {
		key: 'directoryExists',
		value: function directoryExists(path) {
			return this.pathExists(path, 'directory');
		}

		/**
   * Checks if the specified symbolic link exists.
   *
   * @since 0.2.0
   *
   * @param  {string} path The path to the symbolic link to check.
   * @return {bool}        True the symbolic link exists; false if not.
   */

	}, {
		key: 'symlinkExists',
		value: function symlinkExists(path) {
			return this.pathExists(path, 'symlink');
		}

		/**
   * Takes a directory path and returns an array containing the contents of
   * the directory.
   *
   * @since 0.4.0
   *
   * @param  {string} dir             The directory path.
   * @param  {bool}   [includeHidden] If true, hidden files are included.
   *                                  Default is false.
   *
   * @return {array}  The directory contents.
   */

	}, {
		key: 'readDir',
		value: function readDir(dir, includeHidden) {

			try {
				var files = _fsExtra2.default.readdirSync(dir);

				if (!includeHidden) {

					// eslint-disable-next-line no-magic-numbers
					files = files.filter(function (file) {
						return 0 !== file.indexOf('.');
					});
				}

				return files;
			} catch (error) {
				return [];
			}
		}

		/**
   * Tries to load a YAML config file and parse it into JSON.
   *
   * @since 0.1.0
   *
   * @param  {string} filePath The path to the YAML file.
   * @return {object}          The parsed results. If the file is blank or
   *                           doesn't exist, we return an empty object.
   */

	}, {
		key: 'loadYAML',
		value: function loadYAML(filePath) {

			try {

				// Get file contents as JSON.
				var json = _jsYaml2.default.safeLoad(_fsExtra2.default.readFileSync(filePath, 'utf8'));

				// Make sure the config isn't empty.
				if (json) {
					return json;
				}
			} catch (error) {
				_log2.default.error(error);
			}

			// If the file doesn't exist or is empty, return an empty object.
			return {};
		}

		/**
   * Takes a JSON string or object, parses it into YAML, and writes to a file.
   *
   * @since 0.3.0
   *
   * @param  {string} filePath The path to the file to write to.
   * @param  {object} json     The JSON object to parse into YAML.
   */

	}, {
		key: 'writeYAML',
		value: function writeYAML(filePath, json) {

			try {

				// Convert JSON to YAML.
				var yaml = _jsYaml2.default.safeDump(json, { noCompatMode: true });

				_fsExtra2.default.writeFileSync(filePath, yaml);
			} catch (error) {
				_log2.default.error(error);
			}
		}

		/**
   * Generates a random string in hexadecimal format.
   *
   * @since 0.1.0
   *
   * @param  {int}    strLen  The number of characters to include in the string.
   * @param  {string} format  The string format to use (hex, base64, etc).
   * @return {string}         The randomly generated string.
   */

	}, {
		key: 'randomString',
		value: function randomString(strLen) {
			var format = arguments.length <= 1 || arguments[1] === undefined ? 'hex' : arguments[1];


			try {

				var numBytes = void 0;

				// Adjust number of bytes based on desired string format.
				if ('hex' === format) {
					numBytes = Math.ceil(strLen * RATIOS.BYTES_TO_HEX);
				} else if ('base64' === format) {
					numBytes = Math.ceil(strLen * RATIOS.BYTES_TO_BASE64);
				}

				return _crypto2.default.randomBytes(numBytes).toString(format).slice(0, strLen); // eslint-disable-line no-magic-numbers
			} catch (error) {
				_log2.default.error(error);

				return '';
			}
		}
	}]);

	return Helpers;
}();

exports.default = Helpers;