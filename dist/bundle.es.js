import yargs from 'yargs';
import _JSON$stringify from 'babel-runtime/core-js/json/stringify';
import _getIterator from 'babel-runtime/core-js/get-iterator';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import _ from 'lodash';
import colors from 'colors';
import fs from 'fs-extra';
import path from 'path';
import upsearch from 'utils-upsearch';
import { mock } from 'mocktail';
import YAML from 'js-yaml';
import crypto from 'crypto';
import _Set from 'babel-runtime/core-js/set';
import _Map from 'babel-runtime/core-js/map';
import _slicedToArray from 'babel-runtime/helpers/slicedToArray';
import _Object$getPrototypeOf from 'babel-runtime/core-js/object/get-prototype-of';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';
import os from 'os';
import cp from 'child_process';
import mustache from 'mustache';

/**
 * @module
 */

// eslint-disable-line no-shadow

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
   * @param  {String} path The path to check.
   * @param  {String} type Optional. A type to check the path against.
   * @return {Boolean}     True if path exists and is `type`; false if not.
   */
		value: function pathExists(path) {
			var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'any';

			try {
				var info = fs.lstatSync(path);

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
   * @param  {String} path The path to the file to check.
   * @return {Boolean}     True the file exists; false if not.
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
   * @param  {String} path The path to the directory to check.
   * @return {Boolean}     True the directory exists; false if not.
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
   * @param  {String} path The path to the symbolic link to check.
   * @return {Boolean}     True the symbolic link exists; false if not.
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
   * @param  {String}  dir                   The directory path.
   * @param  {Boolean} [includeHidden=false] If true, hidden files are included.
   * @return {Array}  The directory contents.
   */

	}, {
		key: 'readDir',
		value: function readDir(dir) {
			var includeHidden = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;


			try {
				var files = fs.readdirSync(dir);

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
   * @param  {String} filePath The path to the YAML file.
   * @return {Object}          The parsed results. If the file is blank or
   *                           doesn't exist, we return an empty object.
   */

	}, {
		key: 'loadYAML',
		value: function loadYAML(filePath) {

			try {

				// Get file contents as JSON.
				var json = YAML.safeLoad(fs.readFileSync(filePath, 'utf8'));

				// Make sure the config isn't empty.
				if (json) {
					return json;
				}
			} catch (error) {
				log.error(error);
			}

			// If the file doesn't exist or is empty, return an empty object.
			return {};
		}

		/**
   * Takes a JSON string or object, parses it into YAML, and writes to a file.
   *
   * @since 0.3.0
   *
   * @param {String} filePath The path to the file to write to.
   * @param {Object} json     The JSON object to parse into YAML.
   */

	}, {
		key: 'writeYAML',
		value: function writeYAML(filePath, json) {

			try {

				// Convert JSON to YAML.
				var yaml = YAML.safeDump(json, { noCompatMode: true });

				fs.writeFileSync(filePath, yaml);
			} catch (error) {
				log.error(error);
			}
		}

		/**
   * Generates a random string in hexadecimal format.
   *
   * @since 0.1.0
   *
   * @param  {Number} strLen         The number of characters to include in the string.
   * @param  {String} [format='hex'] The string format to use (hex, base64, etc).
   * @return {String}                The randomly generated string.
   */

	}, {
		key: 'randomString',
		value: function randomString(strLen) {
			var format = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'hex';


			try {

				var numBytes = void 0;

				// Adjust number of bytes based on desired string format.
				if ('hex' === format) {
					numBytes = Math.ceil(strLen * RATIOS.BYTES_TO_HEX);
				} else if ('base64' === format) {
					numBytes = Math.ceil(strLen * RATIOS.BYTES_TO_BASE64);
				}

				return crypto.randomBytes(numBytes).toString(format).slice(0, strLen); // eslint-disable-line no-magic-numbers
			} catch (error) {
				log.error(error);

				return '';
			}
		}
	}]);

	return Helpers;
}();

var helpers = mock(Helpers);

/**
 * @module
 */

if (!_.upperSnakeCase) {
	_.upperSnakeCase = function (string) {
		return _.startCase(string).replace(/ /g, '_');
	};
}

/**
 * The number of characters to use when generating a database prefix.
 *
 * @type {Number}
 */
var DB_PREFIX_LENGTH = 8;

/**
 * The number of characters to use when generating a secret key.
 *
 * @type {Number}
 */
var SECRET_KEY_LENGTH = 64;

/**
 * The number of characters to use when generating a secret salt.
 *
 * @type {Number}
 */
var SECRET_SALT_LENGTH = 64;

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
   * @param  {String} file The path to the config file.
   * @return {Object}      The resulting config object.
   */
		value: function loadConfig() {
			var file = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;


			var config = void 0;

			// Try to load the config file if one was passed and it exists.
			if (file && helpers.fileExists(file)) {
				config = helpers.loadYAML(file);
			}

			// If we don't have a config object (or the config object is empty)
			// fall back to the default config file.
			if (_.isEmpty(config) && helpers.fileExists(this.paths.config)) {
				config = helpers.loadYAML(this.paths.config);
			}

			config = _.merge(config, yargs.argv);

			return this.parseConfig(config);
		}

		/**
   * Parses the project config. Missing values are filled in from the default
   * config object.
   *
   * @since 0.1.0
   *
   * @param  {Object} config The config object to parse.
   * @return {Object}        The parsed config object.
   */

	}, {
		key: 'parseConfig',
		value: function parseConfig(config) {
			var _this = this;

			// Merge config with defaults.
			config = _.pickBy(_.defaultsDeep(config, this.defaultConfig), function (value, key) {
				return _.has(_this.defaultConfig, key);
			});

			// Fill in any config values that aren't set.
			config = this.ensureProjectConfig(config);
			config = this.ensurePluginConfig(config);
			config = this.ensureThemeConfig(config);
			config = this.ensureDatabaseConfig(config);
			config = this.ensureSecretConfig(config);

			// Set internal config values.
			config.project.folder = path.basename(this.paths.project);
			config.project.namespace = _.upperSnakeCase(config.project.title);

			config.plugin.id = _.snakeCase(config.plugin.name);
			config.plugin.class = _.upperSnakeCase(config.plugin.name);
			config.plugin.namespace = config.project.namespace || config.plugin.class;
			config.plugin.namespace = config.plugin.namespace + '\\Plugin';

			config.theme.id = _.snakeCase(config.theme.name);
			config.theme.class = _.upperSnakeCase(config.theme.name);
			config.theme.namespace = config.project.namespace || config.theme.class;
			config.theme.namespace = config.theme.namespace + '\\Theme';

			// Return the updated config settings.
			return config;
		}

		/**
   * Fills in any missing project settings with their default values.
   *
   * @since 0.5.0
   *
   * @param  {Object} config The current config object.
   * @return {Object}        The updated config object.
   */

	}, {
		key: 'ensureProjectConfig',
		value: function ensureProjectConfig(config) {

			if (!config.project.title && config.project.slug) {
				config.project.title = _.startCase(config.project.slug);
			}

			if (!config.project.slug && config.project.title) {
				config.project.slug = _.kebabCase(config.project.title);
			}

			if (!config.project.url) {
				config.project.url = config.project.slug + '.dev';
			}

			return config;
		}

		/**
   * Fills in any missing plugin settings with their default values.
   *
   * @since 0.5.0
   *
   * @param  {Object} config The current config object.
   * @return {Object}        The updated config object.
   */

	}, {
		key: 'ensurePluginConfig',
		value: function ensurePluginConfig(config) {

			if (!config.plugin.name) {
				if (config.plugin.slug) {
					config.plugin.name = _.startCase(config.plugin.slug);
				} else {
					config.plugin.name = config.project.title;
				}
			}

			if (!config.plugin.slug) {
				config.plugin.slug = _.kebabCase(config.plugin.name);
			}

			return config;
		}

		/**
   * Fills in any missing theme settings with their default values.
   *
   * @since 0.5.0
   *
   * @param  {Object} config The current config object.
   * @return {Object}        The updated config object.
   */

	}, {
		key: 'ensureThemeConfig',
		value: function ensureThemeConfig(config) {

			if (!config.theme.name) {
				if (config.theme.slug) {
					config.theme.name = _.startCase(config.theme.slug);
				} else {
					config.theme.name = config.project.title;
				}
			}

			if (!config.theme.slug) {
				config.theme.slug = _.kebabCase(config.theme.name);
			}

			return config;
		}

		/**
   * Fills in any missing database settings with their default values.
   *
   * @since 0.5.0
   *
   * @param  {Object} config The current config object.
   * @return {Object}        The updated config object.
   */

	}, {
		key: 'ensureDatabaseConfig',
		value: function ensureDatabaseConfig(config) {

			if (!config.db.name) {
				config.db.name = config.project.slug;
			}

			if (!config.db.prefix) {
				config.db.prefix = helpers.randomString(DB_PREFIX_LENGTH) + '_';
			}

			return config;
		}

		/**
   * Fills in any missing secret key / salts with their default values.
   *
   * @since 0.5.0
   *
   * @param  {Object} config The current config object.
   * @return {Object}        The updated config object.
   */

	}, {
		key: 'ensureSecretConfig',
		value: function ensureSecretConfig(config) {

			var types = ['auth', 'secure_auth', 'logged_in', 'nonce'];

			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = _getIterator(types), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var type = _step.value;

					if (!config.secret[type + '_key']) {
						config.secret[type + '_key'] = helpers.randomString(SECRET_KEY_LENGTH, 'base64');
					}
					if (!config.secret[type + '_salt']) {
						config.secret[type + '_salt'] = helpers.randomString(SECRET_SALT_LENGTH, 'base64');
					}
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

			return config;
		}

		/**
   * Creates a new `project.yml` file with the default settings.
   *
   * @since 0.3.0
   *
   * @param {Boolean} [force=false] If true and a config file already exists,
   *                                it will be deleted and a new file will be
   *                                created.
   */

	}, {
		key: 'createConfigFile',
		value: function createConfigFile() {
			var force = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;


			if (force && helpers.fileExists(this.paths.config)) {
				fs.removeSync(this.paths.config);
			}

			if (!helpers.fileExists(this.paths.config)) {
				helpers.writeYAML(this.paths.config, this.defaultConfig);
			}
		}
	}, {
		key: 'paths',


		/**
   * Gets project paths.
   *
   * @since 0.3.0
   *
   * @return {Object}
   */
		get: function get() {

			if (!this._paths) {

				var rootPath = path.join(__dirname, '..');

				this._paths = {
					root: rootPath,
					cwd: process.cwd(),
					project: process.cwd(),
					assets: path.join(rootPath, 'project-files', 'assets'),
					templates: path.join(rootPath, 'project-files', 'templates'),
					plugins: path.join(rootPath, 'project-files', 'plugin-zips'),
					test: path.join(rootPath, 'test'),
					config: upsearch.sync('project.yml')
				};

				if (this._paths.root === this._paths.project) {
					this._paths.project = path.join(this._paths.root, '_test-project');
				}

				if (!this._paths.config) {
					this._paths.config = path.join(this._paths.project, 'project.yml');
				}
			}

			return this._paths;
		}

		/**
   * Gets config.
   *
   * @since 0.1.0
   *
   * @return {Object}
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
   * @param {Object} config The new config settings.
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
   * @return {Object}
   */

	}, {
		key: 'defaultConfig',
		get: function get() {
			return {
				vvv: true,
				debug: false,
				token: '',
				author: {
					name: 'Your Name',
					email: 'your-email@example.com',
					website: 'http://your-website.example.com'
				},
				project: {
					multisite: false,
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
					slug: '',
					description: ''
				},
				theme: {
					scaffold: true,
					name: '',
					slug: '',
					description: ''
				},
				admin: {
					user: 'admin',
					pass: 'admin_password',
					email: 'admin@localhost.dev'
				},
				db: {
					name: '',
					user: 'external',
					pass: 'external',
					host: 'vvv.dev:3306',
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

var Project$1 = mock(Project);

/**
 * @module
 */

// import { mock } from 'mocktail';

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
			colors.setTheme(this.styles);

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

				for (var _iterator = _getIterator(_.keys(this.styles)), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
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
			if (_.isObjectLike(message)) {
				message = _JSON$stringify(message, null, JSON_TAB_WIDTH);
			}

			// Don't log anything if message is empty.
			if (_.isEmpty(message)) {
				return;
			}

			// Make sure the message is a string.
			message = message.toString();

			// Check if a valid style was specified.
			if (style && message[style]) {

				// Bail if the style is 'debug' and debugging is disabled.
				if ('debug' === style && !Project$1.debug) {
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

var log = new Log();

var configDisplayCommand = {
	command: 'config display',
	describe: 'parse and display project settings',
	builder: {},
	handler: function handler() {
		log.message(Project$1.config);
	}
};

var configCreateCommand = {
	command: 'config create',
	describe: 'create a new project.yml file with the default settings',
	builder: {},
	handler: function handler(argv) {
		Project$1.createConfigFile(argv.force);
	}
};

/**
 * @module
 */

/**
 * Manages dependencies (npm / Bower / Composer).
 */

var Deps = function Deps() {
  _classCallCheck(this, Deps);
};

var deps = mock(Deps);

var depsInstallCommand = {
	command: 'deps install [--type=all|npm|bower|composer]',
	describe: 'install project, theme, and plugin dependencies',
	builder: {},
	handler: function handler(argv) {
		deps.install(argv.type);
	}
};

/**
 * @module
 */

/**
 * Scaffolds out project files, plugins, themes, etc.
 *
 * @todo Figure out better names for functions.
 * @todo Document all the things! Maybe switch to rspec?
 * @todo Break this up into multiple classes.
 *       - Scaffold class should only handle project files and folders.
 *       - Move WordPress / database setup into separate class.
 *       - Move git commands into separate class?
 */

var Scaffold = function (_Project) {
	_inherits(Scaffold, _Project);

	function Scaffold() {
		_classCallCheck(this, Scaffold);

		return _possibleConstructorReturn(this, (Scaffold.__proto__ || _Object$getPrototypeOf(Scaffold)).apply(this, arguments));
	}

	_createClass(Scaffold, null, [{
		key: 'init',


		/**
   * Sets initial values required for other class methods.
   */
		value: function init() {

			this.templateData = this.config;

			fs.mkdirpSync(this.paths.project);

			if ('node-test' === this.config.env) {
				fs.removeSync(this.paths.project);
				fs.mkdirpSync(this.paths.project);
			}
		}

		/**
   * Creates a new project.
   *
   * @return {Boolean}
   */

	}, {
		key: 'createProject',
		value: function createProject() {

			if (!this.config.project.title) {
				log.error('You must specify a project title.' + ' Check the README for usage information.');

				return false;
			}

			this.initProjectFiles();
			this.initRepo();
			this.initDevLib();
			this.initProject();
			this.initPlugin();
			this.initTheme();

			return true;
		}

		/**
   * Creates project files.
   */

	}, {
		key: 'initProjectFiles',
		value: function initProjectFiles() {

			this.maybeCreateAuthFiles();
			this.maybeCopyPluginZips();
			this.parseTemplateData();

			this.scaffoldFiles('scripts');

			if (this.config.vvv) {
				this.scaffoldFiles('vvv');
			}
		}

		/**
   * Creates a Composer `auth.json` file if enabled in project config.
   */

	}, {
		key: 'maybeCreateAuthFiles',
		value: function maybeCreateAuthFiles() {

			if (!this.config.token) {
				return;
			}

			var filePath = path.join(os.homedir(), '.composer/auth.json');
			var contents = _JSON$stringify({
				'github-oauth': {
					'github.com': '' + this.config.token
				}
			});

			if (!helpers.fileExists(filePath)) {
				fs.writeFileSync(filePath, contents);
			}
		}

		/**
   * Copies plugin ZIP files.
   */

	}, {
		key: 'maybeCopyPluginZips',
		value: function maybeCopyPluginZips() {

			if (!helpers.directoryExists(this.paths.plugins)) {
				return;
			}

			log.message('Copying plugin ZIPs...');

			var source = this.paths.plugins;
			var dest = path.join(this.paths.project, 'project-files/plugin-zips');

			fs.copySync(source, dest);

			log.ok('Plugin ZIPs copied.');
		}

		/**
   * Parses template data from project config.
   */

	}, {
		key: 'parseTemplateData',
		value: function parseTemplateData() {

			var pluginZipsDir = path.join(this.paths.project, 'project-files/plugin-zips');

			if (!this.templateData.pluginZips) {
				this.templateData.pluginZips = [];
			}

			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = _getIterator(helpers.readDir(pluginZipsDir)), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var val = _step.value;

					this.templateData.pluginZips.push({
						name: path.basename(val, '.zip'),
						file: val
					});
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
		}

		/**
   * Initializes the Git repo if enabled in project config.
   *
   * @return {Boolean}
   */

	}, {
		key: 'initRepo',
		value: function initRepo() {

			if (!this.config.repo.create) {
				return false;
			}

			log.message('Checking for Git repo...');

			var dirExists = helpers.directoryExists(path.join(this.paths.project, '.git'));

			if (dirExists) {
				log.ok('Repo exists.');

				return false;
			}

			// Initialize repo.
			if (this.execSync('git init', 'project', false)) {
				log.ok('Repo initialized.');
			}

			// If the repo URL is set, add it as a remote.
			if (this.config.repo.url) {
				var command = 'git remote add origin ' + this.config.repo.url;

				if (this.execSync(command, 'project', false)) {
					log.ok('Remote URL added.');
				}
			}

			return true;
		}

		/**
   * Adds the `wp-dev-lib` git submodule.
   *
   * @return {Boolean}
   */

	}, {
		key: 'initDevLib',
		value: function initDevLib() {

			log.message('Checking for wp-dev-lib submodule...');

			var dirExists = helpers.directoryExists(path.join(this.paths.project, 'dev-lib'));

			if (dirExists) {
				log.ok('Submodule exists.');

				return false;
			}

			// Add the sub-module.
			var command = 'git submodule add -f -b master https://github.com/xwp/wp-dev-lib.git dev-lib';

			if (this.execSync(command, 'project')) {
				log.ok('Submodule added.');
			}

			return true;
		}

		/**
   * Creates project files and install project dependencies.
   *
   * @return {Boolean}
   */

	}, {
		key: 'initProject',
		value: function initProject() {

			log.message('Checking for Bedrock...');

			var dirExists = helpers.directoryExists(path.join(this.paths.project, 'htdocs'));

			if (dirExists) {
				log.ok('Bedrock exists');

				return false;
			}

			// Install Bedrock.
			var command = 'composer create-project roots/bedrock htdocs --no-install';

			if (this.execSync(command, 'project')) {
				log.ok('Bedrock installed.');
			}

			this.linkFiles('project');
			this.scaffoldFiles('project');
			this.scaffoldFiles('bedrock');
			this.removeFiles('bedrock');

			log.message('Installing project dependencies...');

			if (this.execSync('composer install', 'project')) {
				log.ok('Dependencies installed.');
			}

			return true;
		}

		/**
   * Creates plugin files.
   *
   * @return {Boolean}
   */

	}, {
		key: 'initPlugin',
		value: function initPlugin() {

			if (!this.config.plugin.scaffold) {
				return false;
			}

			if (!this.config.plugin.name) {
				log.error('You must specify a plugin name.' + ' Check the README for usage information.');

				return false;
			}

			log.message('Checking for plugin...');

			var basePath = this.getBasePath('plugin');

			if (helpers.directoryExists(basePath)) {
				log.ok('Plugin exists.');

				return false;
			}

			this.scaffoldFiles('plugin');

			this.createPlaceholders('plugin');

			log.ok('Plugin created.');

			return true;
		}

		/**
   * Creates plugin unit tests.
   */

	}, {
		key: 'createPluginTests',
		value: function createPluginTests() {
			log.error('This feature is not ready');
		}

		/**
   * Creates a child theme.
   *
   * @since 0.1.0
   *
   * @return {Boolean} False if theme exists,
   */

	}, {
		key: 'initTheme',
		value: function initTheme() {

			if (!this.config.theme.scaffold) {
				return false;
			}

			if (!this.config.theme.name) {
				log.error('You must specify a theme name.' + ' Check the README for usage information.');

				return false;
			}

			log.message('Checking for child theme...');

			var basePath = this.getBasePath('theme');

			if (helpers.directoryExists(basePath)) {
				log.ok('Child theme exists.');

				return true;
			}

			this.scaffoldFiles('theme');

			this.createPlaceholders('theme');

			this.copyAssets('theme');

			log.ok('Theme created.');

			log.message('Installing theme dependencies...');

			this.execSync('npm install', 'theme');
			this.execSync('bower install', 'theme');

			log.message('Compiling theme assets...');
			this.execSync('npm run build', 'theme');

			log.ok('Done');

			return true;
		}

		/**
   * Creates theme unit tests.
   */

	}, {
		key: 'createThemeTests',
		value: function createThemeTests() {
			log.error('This feature is not ready');
		}

		/**
   * Executes a command.
   *
   * @param  {String}   command The command.
   * @param  {String}   [type = 'project'] Type to use for the base path.
   * @param  {Function} [callback = null]  A callback to call on success.
   * @return {Boolean}
   */

	}, {
		key: 'exec',
		value: function exec(command) {
			var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'project';
			var callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;


			var options = {
				cwd: this.getBasePath(type)
			};

			return cp.exec(command, options, function (error, stdout, stderr) {

				// Exit on error.
				if (null !== error) {
					log.error(error);

					return false;
				}

				// If a callback was provided, call it.
				if (callback) {
					callback(stdout, stderr);

					return true;
				}

				// Otherwise just return true.
				return true;
			});
		}

		/**
   * Synchronously executes a command.
   *
   * @param  {String} command             The command.
   * @param  {String} [type = 'project']  Command runs in the type's base path.
   * @param  {Boolean} [logError = false] Whether to log errors.
   * @return {Boolean}
   */

	}, {
		key: 'execSync',
		value: function execSync(command) {
			var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'project';
			var logError = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;


			var options = {
				cwd: this.getBasePath(type)
			};

			try {
				cp.execSync(command, options);

				return true;
			} catch (error) {

				if (logError && !_.isEmpty(error)) {
					log.error(error);
				}

				return false;
			}
		}

		/**
   * Gets base path to a specific type of file.
   *
   * @param  {String} [type = 'project'] [description]
   * @return {String}
   */

	}, {
		key: 'getBasePath',
		value: function getBasePath() {
			var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'project';


			var basePaths = {
				project: '.',
				vvv: 'vvv',
				scripts: 'scripts',
				bedrock: 'htdocs',
				wordpress: 'htdocs/web/wp',
				plugin: path.join('htdocs/web/app/plugins/', this.config.plugin.slug),
				theme: path.join('htdocs/web/app/themes/', this.config.theme.slug)
			};

			// We convert the type to camel case so we don't run into issues if we
			// want to use a type like `type-name` or `type_name`.
			var base = basePaths[_.camelCase(type)];

			if (!base) {
				base = '';
			}

			return path.join(this.paths.project, base);
		}

		/**
   * Gets path to plugin or theme assets.
   *
   * @param  {String} [type = 'theme'] [description]
   * @return {String}
   */

	}, {
		key: 'getAssetsPath',
		value: function getAssetsPath() {
			var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'theme';


			var assetsPaths = {
				plugin: 'assets/source',
				theme: 'assets/source'
			};

			var assetsPath = assetsPaths[_.camelCase(type)];

			if (!assetsPath) {
				assetsPath = '';
			}

			return path.join(this.getBasePath(type), assetsPath);
		}

		/**
   * Creates placeholder files and folders.
   *
   * @param  {String} [type = 'theme'] [description]
   */

	}, {
		key: 'createPlaceholders',
		value: function createPlaceholders() {
			var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'theme';


			var base = this.getBasePath(type);

			var dirs = ['includes', 'assets/source/css', 'assets/source/js', 'assets/source/images', 'assets/source/fonts', 'assets/dist/css', 'assets/dist/js', 'assets/dist/images', 'assets/dist/fonts'];

			var files = ['assets/dist/css/.gitkeep', 'assets/dist/js/.gitkeep', 'assets/dist/images/.gitkeep', 'assets/dist/fonts/.gitkeep'];

			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = _getIterator(dirs), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var dir = _step2.value;

					try {
						fs.mkdirpSync(path.join(base, dir));
					} catch (error) {
						log.error(error);
					}
				}
			} catch (err) {
				_didIteratorError2 = true;
				_iteratorError2 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion2 && _iterator2.return) {
						_iterator2.return();
					}
				} finally {
					if (_didIteratorError2) {
						throw _iteratorError2;
					}
				}
			}

			var _iteratorNormalCompletion3 = true;
			var _didIteratorError3 = false;
			var _iteratorError3 = undefined;

			try {
				for (var _iterator3 = _getIterator(files), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
					var file = _step3.value;

					try {
						fs.ensureFileSync(path.join(base, file));
					} catch (error) {

						// Do nothing.
					}
				}
			} catch (err) {
				_didIteratorError3 = true;
				_iteratorError3 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion3 && _iterator3.return) {
						_iterator3.return();
					}
				} finally {
					if (_didIteratorError3) {
						throw _iteratorError3;
					}
				}
			}
		}

		/**
   * Copy an included set of plugin or theme assets.
   *
   * @param  {String} [type = 'theme'] [description]
   * @param  {String} [dir  = '']      [description]
   * @return {Boolean}
   */

	}, {
		key: 'copyAssets',
		value: function copyAssets() {
			var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'theme';
			var dir = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';


			var source = path.join(this.paths.assets, type, dir);
			var dest = path.join(this.getAssetsPath(type), dir);

			if (!helpers.directoryExists(source)) {
				log.error(source + ' is not a valid assets folder.');

				return false;
			}

			try {
				fs.mkdirpSync(dest);
				fs.copySync(source, dest);

				log.ok(_.startCase(type) + ' assets created.');
			} catch (error) {
				if (!_.isEmpty(error)) {
					log.error(error);
				}
			}

			return true;
		}

		/**
   * Creates symlinks to a set of files.
   *
   * @param  {String} type = 'project' [description]
   */

	}, {
		key: 'linkFiles',
		value: function linkFiles() {
			var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'project';


			var base = this.getBasePath(type);
			var files = this.files[type].link;

			if (!files) {
				return;
			}

			var _iteratorNormalCompletion4 = true;
			var _didIteratorError4 = false;
			var _iteratorError4 = undefined;

			try {
				for (var _iterator4 = _getIterator(files), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
					var _step4$value = _slicedToArray(_step4.value, 2);

					var source = _step4$value[0];
					var dest = _step4$value[1];


					var destBase = path.join(dest, path.basename(source));

					source = path.join(base, source);
					dest = path.join(base, destBase);

					log.message('Checking for ' + destBase + '...');

					if (helpers.symlinkExists(dest)) {
						log.ok(dest + ' exists.');
					} else {
						try {
							fs.ensureSymlinkSync(dest, source);
							log.ok(dest + ' created.');
						} catch (error) {
							if (!_.isEmpty(error)) {
								log.error(error);
							}
						}
					}
				}
			} catch (err) {
				_didIteratorError4 = true;
				_iteratorError4 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion4 && _iterator4.return) {
						_iterator4.return();
					}
				} finally {
					if (_didIteratorError4) {
						throw _iteratorError4;
					}
				}
			}
		}

		/**
   * Removes a set of files.
   *
   * @param  {String} type = 'project' [description]
   */

	}, {
		key: 'removeFiles',
		value: function removeFiles() {
			var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'project';


			var base = this.getBasePath(type);
			var files = this.files[type].remove;

			if (!files) {
				return;
			}

			var _iteratorNormalCompletion5 = true;
			var _didIteratorError5 = false;
			var _iteratorError5 = undefined;

			try {
				for (var _iterator5 = _getIterator(files), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
					var file = _step5.value;

					file = path.join(base, file);

					try {
						fs.removeSync(file);
					} catch (error) {
						if (!_.isEmpty(error)) {
							log.error(error);
						}
					}
				}
			} catch (err) {
				_didIteratorError5 = true;
				_iteratorError5 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion5 && _iterator5.return) {
						_iterator5.return();
					}
				} finally {
					if (_didIteratorError5) {
						throw _iteratorError5;
					}
				}
			}
		}

		/**
   * Renders a set of template files using the template data.
   *
   * @param  {String} type =             'project' [description]
   * @return {Boolean}      [description]
   */

	}, {
		key: 'scaffoldFiles',
		value: function scaffoldFiles() {
			var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'project';


			var source = path.join(this.paths.templates, type);

			if (!helpers.directoryExists(source)) {
				log.error(source + ' is not a valid template directory');

				return false;
			}

			var dirs = helpers.readDir(source);

			if (!_.isEmpty(dirs)) {
				var _iteratorNormalCompletion6 = true;
				var _didIteratorError6 = false;
				var _iteratorError6 = undefined;

				try {
					for (var _iterator6 = _getIterator(dirs), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
						var file = _step6.value;

						this.scaffoldFile(path.join(source, file), type);
					}
				} catch (err) {
					_didIteratorError6 = true;
					_iteratorError6 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion6 && _iterator6.return) {
							_iterator6.return();
						}
					} finally {
						if (_didIteratorError6) {
							throw _iteratorError6;
						}
					}
				}
			}

			return true;
		}

		/**
   * Renders a specific template file.
   *
   * @param  {String} source [description]
   * @param  {String} type   = 'project' [description]
   * @return {Boolean}        [description]
   */

	}, {
		key: 'scaffoldFile',
		value: function scaffoldFile(source) {
			var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'project';


			var file = path.basename(source, '.mustache');

			// Templates for hidden files start with `_` instead of `.`
			if (0 === file.indexOf('_')) {
				// eslint-disable-line no-magic-numbers
				file = file.replace('_', '.');
			}

			log.message('Checking for ' + file + '...');

			var base = this.getBasePath(type);
			var dest = path.join(base, file);

			if (helpers.fileExists(dest)) {
				log.ok(file + ' exists.');

				return true;
			}

			fs.mkdirpSync(base);

			try {
				var templateContent = fs.readFileSync(source).toString();
				var renderedContent = mustache.render(templateContent, this.templateData);

				fs.writeFileSync(dest, renderedContent);

				log.ok(file + ' created.');
			} catch (error) {

				if (!_.isEmpty(error)) {
					log.error(error);

					return false;
				}
			}

			return true;
		}
	}, {
		key: 'files',


		/**
   * Project files that need to be symlinked, removed, or any other special
   * type of action that we can't determine automatically based on template
   * files or project configuration.
   *
   * @return {Object}
   */
		get: function get() {
			return {
				project: {
					link: new _Map([['dev-lib/pre-commit', '.git/hooks'], ['dev-lib/.jshintrc', '.'], ['dev-lib/.jscsrc', '.']])
				},

				bedrock: {
					remove: new _Set(['composer.*', '*.md', 'phpcs.xml', 'wp-cli.yml', '.gitignore', '.travis.yml', '.env.example', '.editorconfig'])
				}
			};
		}
	}]);

	return Scaffold;
}(Project$1);

var scaffold = mock(Scaffold);

var pluginCreateTestsCommand = {
	command: 'plugin create-tests',
	describe: 'create plugin unit tests',
	builder: {},
	handler: function handler() {
		scaffold.init();
		scaffold.createPluginTests();
	}
};

var pluginCreateCommand = {
	command: 'plugin create',
	describe: 'scaffold new plugin',
	builder: {},
	handler: function handler() {
		scaffold.init();
		scaffold.initPlugin();
	}
};

var themeCreateTestsCommand = {
	command: 'theme create-tests',
	describe: 'create theme unit tests',
	builder: {},
	handler: function handler() {
		scaffold.init();
		scaffold.createThemeTests();
	}
};

var themeCreateCommand = {
	command: 'theme create',
	describe: 'scaffold new child theme',
	builder: {},
	handler: function handler() {
		scaffold.init();
		scaffold.initTheme();
	}
};

var projectCreateCommand = {
	command: 'project create',
	describe: 'scaffold new project',
	builder: {},
	handler: function handler() {
		scaffold.init();
		scaffold.createProject();
	}
};

var wpInstallCommand = {
	command: 'wp install',
	describe: 'install WordPress',
	builder: {},
	handler: function handler() {
		log.error('This feature is not ready');
	}
};

/**
 * Performs all of the following:
 *   - Create project folder.
 *   - Create vvv-hosts, vvv-nginx.conf, and vvv-init.sh.
 *   - When vvv-init.sh runs: update Node to 6.x, install Gulp & Bower globally.
 *   - Initialize the Git repo.
 *   - Scaffold out a new project and install dependencies.
 *   - Install and configure wp-dev-lib.
 *   - Install and configure Bedrock.
 *   - Install and configure WordPress.
 *   - Create a custom plugin and activate it.
 *   - Create parent and child themes and activate them.
 *   - Install theme dependencies and compile assets.
 *
 * Default settings can be configured in `project.yml` or `package.json`.
 * Default settings can be overridden via command arguments.
 *
 * If no `project.yml` file is found in the project folder, but one is found
 * in a parent folder, that one will be used instead. This can be useful for
 * setting a default configuration that will apply to multiple projects.
 *
 * You can also specify the path using the `--config` argument. For example:
 *     `node wp-manager --config=/path/to/config.yml`.
 *
 * @TODO Add argument validation and sanitization.
 * @TODO Add description, usage, example, and copyright messages.
 * @TODO Switch to using `async` / `await` instead of `*Sync()` methods.
 * @TODO Add `deps` module to handle npm / Bower / Composer dependencies.
 * @TODO Add `install-deps` command to install project, plugin, and theme deps.
 * @TODO Replace `yargs` with a CLI framework that supports sub-commands.
 */
var index = yargs.help().completion().command(configDisplayCommand).command(configCreateCommand).command(depsInstallCommand).command(pluginCreateTestsCommand).command(pluginCreateCommand).command(themeCreateTestsCommand).command(themeCreateCommand).command(projectCreateCommand).command(wpInstallCommand).argv;

export default index;