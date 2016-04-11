'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _helpers = require('./helpers');

var _helpers2 = _interopRequireDefault(_helpers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Project = function () {

	/**
  * Class constructor. Sets default values for class properties.
  *
  * @since 0.1.0
  */

	function Project() {
		_classCallCheck(this, Project);

		if (!global.__config) {
			global.__config = {};
		}

		_lodash2.default.upperSnakeCase = function (string) {
			return _lodash2.default.startCase(string).replace(/ /g, '_');
		};
	}

	/**
  * Config getter.
  *
  * @since 0.1.0
  *
  * @return {object} The current config settings.
  */


	_createClass(Project, [{
		key: 'loadConfig',


		/**
   * Loads and parses a YAML config file. If no file is passed, or the
   * specified file doesn't exist or is empty, the default config file path
   * is used.
   *
   * @since 0.1.0
   *
   * @param  {string} file The path to the config file.
   * @return {object}      The resulting config object.
   */
		value: function loadConfig(file) {

			var config = void 0;

			// Try to load the file if one was passed.
			if (file) {
				config = _helpers2.default.loadYAML(file);
			}

			// If we don't have a config object (or the config object is empty)
			// fall back to the default config file.
			if (!config || _lodash2.default.isEmpty(config)) {
				config = _helpers2.default.loadYAML(__path.config);
			}

			return this.parseConfig(config);
		}

		/**
   * Parses the project config. Missing values are filled in from the default
   * config object.
   *
   * @since 0.1.0
   *
   * @param  {object} config The config object to parse.
   * @return {object}        The parsed config object.
   */

	}, {
		key: 'parseConfig',
		value: function parseConfig(config) {
			var _this = this;

			// Merge config with defaults.
			config = _lodash2.default.pickBy(_lodash2.default.defaultsDeep(config, this.defaultConfig), function (value, key) {
				return _lodash2.default.has(_this.defaultConfig, key);
			});

			// Fill in any dynamic config values that aren't set.
			if (!config.project.title && config.project.slug) {
				config.project.title = _lodash2.default.startCase(config.project.slug);
			}

			if (!config.project.slug && config.project.title) {
				config.project.slug = _lodash2.default.kebabCase(config.project.title);
			}

			if (!config.project.url) {
				config.project.url = config.project.slug + '.dev';
			}

			if (!config.plugin.name) {
				if (config.plugin.slug) {
					config.plugin.name = _lodash2.default.startCase(config.pluin.slug);
				} else {
					config.plugin.name = config.project.name;
				}
			}

			if (!config.plugin.slug) {
				config.plugin.slug = config.project.slug;
			}

			if (!config.theme.name) {
				if (config.theme.slug) {
					config.theme.name = _lodash2.default.startCase(config.theme.slug);
				} else {
					config.theme.name = config.project.name;
				}
			}

			if (!config.theme.slug) {
				config.theme.slug = config.project.slug;
			}

			if (!config.db.name) {
				config.db.name = config.project.slug;
			}

			if (!config.db.prefix) {
				config.db.prefix = _helpers2.default.randomString(8) + '_';
			}

			['auth', 'secureAuth', 'loggedIn', 'nonce'].forEach(function (type) {
				if (!config.secret[type + 'Key']) {
					config.secret[type + 'Key'] = _helpers2.default.randomString(64, 'base64');
				}
				if (!config.secret[type + 'Salt']) {
					config.secret[type + 'Salt'] = _helpers2.default.randomString(64, 'base64');
				}
			});

			// Set internal config values.
			config.project.folder = _path2.default.basename(__path.project);

			config.plugin.id = _lodash2.default.snakeCase(config.plugin.name);
			config.plugin.class = _lodash2.default.upperSnakeCase(config.plugin.name);
			config.plugin.package = _lodash2.default.upperSnakeCase(config.plugin.name);

			config.theme.id = _lodash2.default.snakeCase(config.theme.name);
			config.theme.class = _lodash2.default.upperSnakeCase(config.theme.name);
			config.theme.package = _lodash2.default.upperSnakeCase(config.theme.name);

			// Update the global config settings.
			global.__config = config;

			// Return the updated config settings.
			return config;
		}
	}, {
		key: 'config',
		get: function get() {
			return global.__config;
		}

		/**
   * Config setter.
   *
   * @since 0.1.0
   *
   * @param  {object} config The new config settings.
   */
		,
		set: function set(config) {
			global.__config = this.parseConfig(config);
		}

		/**
   * Returns the default project config settings.
   *
   * @since 0.1.0
   *
   * @return {object} The default config settings.
   */

	}, {
		key: 'defaultConfig',
		get: function get() {
			return {
				env: 'development',
				project: {
					title: 'New WP Project',
					slug: '',
					url: '',
					repo: ''
				},
				repo: {
					create: false,
					url: ''
				},
				plugin: {
					scaffold: true,
					name: '',
					slug: ''
				},
				theme: {
					scaffold: true,
					name: '',
					slug: ''
				},
				admin: {
					username: 'admin',
					password: 'admin_password',
					email: 'admin@localhost.dev'
				},
				db: {
					name: '',
					user: 'wp',
					password: 'wp',
					host: 'localhost',
					prefix: ''
				},
				secret: {
					authKey: '',
					secureAuthKey: '',
					loggedInKey: '',
					nonceKey: '',
					authSalt: '',
					secureAuthSalt: '',
					loggedInSalt: '',
					nonceSalt: ''
				}
			};
		}
	}]);

	return Project;
}();

exports.default = new Project();