'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _yargs = require('yargs');

var _yargs2 = _interopRequireDefault(_yargs);

var _utilsUpsearch = require('utils-upsearch');

var _utilsUpsearch2 = _interopRequireDefault(_utilsUpsearch);

var _helpers = require('./helpers');

var _helpers2 = _interopRequireDefault(_helpers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

if (!_lodash2.default.upperSnakeCase) {
	_lodash2.default.upperSnakeCase = function (string) {
		return _lodash2.default.startCase(string).replace(/ /g, '_');
	};
}

/**
 * Project config settings and helper methods.
 */

var Project = function () {
	function Project() {
		_classCallCheck(this, Project);
	}

	_createClass(Project, null, [{
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
		value: function loadConfig() {
			var file = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];


			var config = void 0;

			// Try to load the config file if one was passed and it exists.
			if (file && _helpers2.default.fileExists(file)) {
				config = _helpers2.default.loadYAML(file);
			}

			// If we don't have a config object (or the config object is empty)
			// fall back to the default config file.
			if (_lodash2.default.isEmpty(config) && _helpers2.default.fileExists(this.paths.config)) {
				config = _helpers2.default.loadYAML(this.paths.config);
			}

			config = _lodash2.default.merge(config, _yargs2.default.argv);

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
					config.plugin.name = _lodash2.default.startCase(config.plugin.slug);
				} else {
					config.plugin.name = config.project.title;
				}
			}

			if (!config.plugin.slug) {
				config.plugin.slug = _lodash2.default.kebabCase(config.plugin.name);
			}

			if (!config.theme.name) {
				if (config.theme.slug) {
					config.theme.name = _lodash2.default.startCase(config.theme.slug);
				} else {
					config.theme.name = config.project.title;
				}
			}

			if (!config.theme.slug) {
				config.theme.slug = _lodash2.default.kebabCase(config.theme.name);
			}

			if (!config.db.name) {
				config.db.name = config.project.slug;
			}

			if (!config.db.prefix) {
				config.db.prefix = _helpers2.default.randomString(8) + '_';
			}

			['auth', 'secure_auth', 'logged_in', 'nonce'].forEach(function (type) {
				if (!config.secret[type + '_key']) {
					config.secret[type + '_key'] = _helpers2.default.randomString(64, 'base64');
				}
				if (!config.secret[type + '_salt']) {
					config.secret[type + '_salt'] = _helpers2.default.randomString(64, 'base64');
				}
			});

			// Set internal config values.
			config.project.folder = _path2.default.basename(this.paths.project);

			config.plugin.id = _lodash2.default.snakeCase(config.plugin.name);
			config.plugin.class = _lodash2.default.upperSnakeCase(config.plugin.name);
			config.plugin.package = _lodash2.default.upperSnakeCase(config.project.name) + '\\Plugin';
			config.plugin.namespace = config.plugin.package;

			config.theme.id = _lodash2.default.snakeCase(config.theme.name);
			config.theme.class = _lodash2.default.upperSnakeCase(config.theme.name);
			config.theme.package = _lodash2.default.upperSnakeCase(config.project.name) + '\\Theme';
			config.theme.namespace = config.theme.package;

			// Return the updated config settings.
			return config;
		}

		/**
   * Creates a new `project.yml` file with the default settings.
   *
   * @since 0.3.0
   *
   * @param {bool} [force] If true and a config file already exists, it will
   *                       be deleted and a new file will be created.
   */

	}, {
		key: 'createConfigFile',
		value: function createConfigFile() {
			var force = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];


			if (force && _helpers2.default.fileExists(this.paths.config)) {
				_fsExtra2.default.removeSync(this.paths.config);
			}

			if (!_helpers2.default.fileExists(this.paths.config)) {
				_helpers2.default.writeYAML(this.paths.config, this.defaultConfig);
			}
		}
	}, {
		key: 'paths',


		/**
   * Gets project paths.
   *
   * @since 0.3.0
   *
   * @return {object}
   */
		get: function get() {

			if (!this._paths) {

				var rootPath = _path2.default.join(__appPath, '..');

				this._paths = {
					app: __appPath,
					root: rootPath,
					cwd: process.cwd(),
					project: process.cwd(),
					includes: _path2.default.join(__appPath, 'include'),
					assets: _path2.default.join(rootPath, 'project-files', 'assets'),
					templates: _path2.default.join(rootPath, 'project-files', 'templates'),
					plugins: _path2.default.join(rootPath, 'project-files', 'plugins'),
					test: _path2.default.join(rootPath, 'test'),
					config: _utilsUpsearch2.default.sync('project.yml')
				};

				if (this._paths.root === this._paths.project) {
					this._paths.project = _path2.default.join(this._paths.root, '_test-project');
				}

				if (!this._paths.config) {
					this._paths.config = _path2.default.join(this._paths.project, 'project.yml');
				}
			}

			return this._paths;
		}

		/**
   * Gets config.
   *
   * @since 0.1.0
   *
   * @return {object}
   */

	}, {
		key: 'config',
		get: function get() {

			if (!this._config) {
				this._config = this.loadConfig();
			}

			return this._config;
		}

		/**
   * Sets config.
   *
   * @since 0.1.0
   *
   * @param {object} config The new config settings.
   */
		,
		set: function set(config) {
			this._config = this.parseConfig(config);
		}

		/**
   * Gets default config settings.
   *
   * @since 0.1.0
   *
   * @return {object}
   */

	}, {
		key: 'defaultConfig',
		get: function get() {
			return {
				vvv: true,
				debug: false,
				token: '',
				project: {
					title: '',
					slug: '',
					url: ''
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
					user: 'admin',
					pass: 'admin_password',
					email: 'admin@localhost.dev'
				},
				db: {
					name: '',
					user: 'wp',
					pass: 'wp',
					host: 'localhost',
					root_user: 'root',
					root_pass: 'root',
					prefix: ''
				},
				secret: {
					auth_key: '',
					auth_salt: '',
					secure_auth_key: '',
					secure_auth_salt: '',
					logged_in_key: '',
					logged_in_salt: '',
					nonce_key: '',
					nonce_salt: ''
				}
			};
		}
	}]);

	return Project;
}();

exports.default = Project;