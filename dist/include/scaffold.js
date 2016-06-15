'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mustache = require('mustache');

var _mustache2 = _interopRequireDefault(_mustache);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

var _helpers = require('./helpers');

var _helpers2 = _interopRequireDefault(_helpers);

var _project = require('./project');

var _project2 = _interopRequireDefault(_project);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

		return _possibleConstructorReturn(this, Object.getPrototypeOf(Scaffold).apply(this, arguments));
	}

	_createClass(Scaffold, null, [{
		key: 'init',


		/**
   * Sets initial values required for other class methods.
   */
		value: function init() {

			this.templateData = this.config;

			_fsExtra2.default.mkdirpSync(this.paths.project);

			if ('node-test' === this.config.env) {
				_fsExtra2.default.removeSync(this.paths.project);
				_fsExtra2.default.mkdirpSync(this.paths.project);
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
				_log2.default.error('You must specify a project title.' + ' Check the README for usage information.');

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

			var filePath = _path2.default.join(_os2.default.homedir(), '.composer/auth.json');
			var contents = JSON.stringify({
				'github-oauth': {
					'github.com': '' + this.config.token
				}
			});

			if (!_helpers2.default.fileExists(filePath)) {
				_fsExtra2.default.writeFileSync(filePath, contents);
			}
		}

		/**
   * Copies plugin ZIP files.
   */

	}, {
		key: 'maybeCopyPluginZips',
		value: function maybeCopyPluginZips() {

			if (!_helpers2.default.directoryExists(this.paths.plugins)) {
				return;
			}

			_log2.default.message('Copying plugin ZIPs...');

			var source = this.paths.plugins;
			var dest = _path2.default.join(this.paths.project, 'project-files/plugin-zips');

			_fsExtra2.default.copySync(source, dest);

			_log2.default.ok('Plugin ZIPs copied.');
		}

		/**
   * Parses template data from project config.
   */

	}, {
		key: 'parseTemplateData',
		value: function parseTemplateData() {
			var _this2 = this;

			var pluginZipsDir = _path2.default.join(this.paths.project, 'project-files/plugin-zips');

			if (!this.templateData.pluginZips) {
				this.templateData.pluginZips = [];
			}

			_helpers2.default.readDir(pluginZipsDir).forEach(function (val) {
				_this2.templateData.pluginZips.push({
					name: _path2.default.basename(val, '.zip'),
					file: val
				});
			});
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

			_log2.default.message('Checking for Git repo...');

			var dirExists = _helpers2.default.directoryExists(_path2.default.join(this.paths.project, '.git'));

			if (dirExists) {
				_log2.default.ok('Repo exists.');

				return false;
			}

			// Initialize repo.
			if (this.execSync('git init', 'project', false)) {
				_log2.default.ok('Repo initialized.');
			}

			// If the repo URL is set, add it as a remote.
			if (this.config.repo.url) {
				var command = 'git remote add origin ' + this.config.repo.url;

				if (this.execSync(command, 'project', false)) {
					_log2.default.ok('Remote URL added.');
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

			_log2.default.message('Checking for wp-dev-lib submodule...');

			var dirExists = _helpers2.default.directoryExists(_path2.default.join(this.paths.project, 'dev-lib'));

			if (dirExists) {
				_log2.default.ok('Submodule exists.');

				return false;
			}

			// Add the sub-module.
			var command = 'git submodule add -f -b master https://github.com/xwp/wp-dev-lib.git dev-lib';

			if (this.execSync(command, 'project')) {
				_log2.default.ok('Submodule added.');
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

			_log2.default.message('Checking for Bedrock...');

			var dirExists = _helpers2.default.directoryExists(_path2.default.join(this.paths.project, 'htdocs'));

			if (dirExists) {
				_log2.default.ok('Bedrock exists');

				return false;
			}

			// Install Bedrock.
			var command = 'composer create-project roots/bedrock htdocs --no-install';

			if (this.execSync(command, 'project')) {
				_log2.default.ok('Bedrock installed.');
			}

			this.linkFiles('project');
			this.scaffoldFiles('project');
			this.scaffoldFiles('bedrock');
			this.removeFiles('bedrock');

			_log2.default.message('Installing project dependencies...');

			if (this.execSync('composer install', 'project')) {
				_log2.default.ok('Dependencies installed.');
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
				_log2.default.error('You must specify a plugin name.' + ' Check the README for usage information.');

				return false;
			}

			_log2.default.message('Checking for plugin...');

			var basePath = this.getBasePath('plugin');

			if (_helpers2.default.directoryExists(basePath)) {
				_log2.default.ok('Plugin exists.');

				return false;
			}

			this.scaffoldFiles('plugin');

			this.createPlaceholders('plugin');

			_log2.default.ok('Plugin created.');

			return true;
		}

		/**
   * Creates plugin unit tests.
   */

	}, {
		key: 'createPluginTests',
		value: function createPluginTests() {
			_log2.default.error('This feature is not ready');
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
				_log2.default.error('You must specify a theme name.' + ' Check the README for usage information.');

				return false;
			}

			_log2.default.message('Checking for child theme...');

			var basePath = this.getBasePath('theme');

			if (_helpers2.default.directoryExists(basePath)) {
				_log2.default.ok('Child theme exists.');

				return true;
			}

			this.scaffoldFiles('theme');

			this.createPlaceholders('theme');

			this.copyAssets('theme');

			_log2.default.ok('Theme created.');

			_log2.default.message('Installing theme dependencies...');

			this.execSync('npm install', 'theme');
			this.execSync('bower install', 'theme');

			_log2.default.message('Compiling theme assets...');
			this.execSync('npm run build', 'theme');

			_log2.default.ok('Done');

			return true;
		}

		/**
   * Creates theme unit tests.
   */

	}, {
		key: 'createThemeTests',
		value: function createThemeTests() {
			_log2.default.error('This feature is not ready');
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
			var type = arguments.length <= 1 || arguments[1] === undefined ? 'project' : arguments[1];
			var callback = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];


			var options = {
				cwd: this.getBasePath(type)
			};

			return _child_process2.default.exec(command, options, function (error, stdout, stderr) {

				// Exit on error.
				if (null !== error) {
					_log2.default.error(error);

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
			var type = arguments.length <= 1 || arguments[1] === undefined ? 'project' : arguments[1];
			var logError = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];


			var options = {
				cwd: this.getBasePath(type)
			};

			try {
				_child_process2.default.execSync(command, options);

				return true;
			} catch (error) {

				if (logError && !_lodash2.default.isEmpty(error)) {
					_log2.default.error(error);
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
			var type = arguments.length <= 0 || arguments[0] === undefined ? 'project' : arguments[0];


			var basePaths = {
				project: '.',
				vvv: 'vvv',
				scripts: 'scripts',
				bedrock: 'htdocs',
				wordpress: 'htdocs/web/wp',
				plugin: _path2.default.join('htdocs/web/app/plugins/', this.config.plugin.slug),
				theme: _path2.default.join('htdocs/web/app/themes/', this.config.theme.slug)
			};

			// We convert the type to camel case so we don't run into issues if we
			// want to use a type like `type-name` or `type_name`.
			var base = basePaths[_lodash2.default.camelCase(type)];

			if (!base) {
				base = '';
			}

			return _path2.default.join(this.paths.project, base);
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
			var type = arguments.length <= 0 || arguments[0] === undefined ? 'theme' : arguments[0];


			var assetsPaths = {
				plugin: 'assets/source',
				theme: 'assets/source'
			};

			var assetsPath = assetsPaths[_lodash2.default.camelCase(type)];

			if (!assetsPath) {
				assetsPath = '';
			}

			return _path2.default.join(this.getBasePath(type), assetsPath);
		}

		/**
   * Creates placeholder files and folders.
   *
   * @param  {String} [type = 'theme'] [description]
   */

	}, {
		key: 'createPlaceholders',
		value: function createPlaceholders() {
			var type = arguments.length <= 0 || arguments[0] === undefined ? 'theme' : arguments[0];


			var base = this.getBasePath(type);

			var dirs = ['includes', 'assets/source/css', 'assets/source/js', 'assets/source/images', 'assets/source/fonts', 'assets/dist/css', 'assets/dist/js', 'assets/dist/images', 'assets/dist/fonts'];

			var files = ['assets/dist/css/.gitkeep', 'assets/dist/js/.gitkeep', 'assets/dist/images/.gitkeep', 'assets/dist/fonts/.gitkeep'];

			dirs.forEach(function (dir) {
				try {
					_fsExtra2.default.mkdirpSync(_path2.default.join(base, dir));
				} catch (error) {
					_log2.default.error(error);
				}
			});

			files.forEach(function (file) {
				try {
					_fsExtra2.default.ensureFileSync(_path2.default.join(base, file));
				} catch (error) {

					// Do nothing.
				}
			});
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
			var type = arguments.length <= 0 || arguments[0] === undefined ? 'theme' : arguments[0];
			var dir = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];


			var source = _path2.default.join(this.paths.assets, type, dir);
			var dest = _path2.default.join(this.getAssetsPath(type), dir);

			if (!_helpers2.default.directoryExists(source)) {
				_log2.default.error(source + ' is not a valid assets folder.');

				return false;
			}

			try {
				_fsExtra2.default.mkdirpSync(dest);
				_fsExtra2.default.copySync(source, dest);

				_log2.default.ok(_lodash2.default.startCase(type) + ' assets created.');
			} catch (error) {
				if (!_lodash2.default.isEmpty(error)) {
					_log2.default.error(error);
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
			var type = arguments.length <= 0 || arguments[0] === undefined ? 'project' : arguments[0];


			var base = this.getBasePath(type);
			var files = this.files[type].link;

			if (!files) {
				return;
			}

			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = files[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var _step$value = _slicedToArray(_step.value, 2);

					var source = _step$value[0];
					var dest = _step$value[1];


					var destBase = _path2.default.join(dest, _path2.default.basename(source));

					source = _path2.default.join(base, source);
					dest = _path2.default.join(base, destBase);

					_log2.default.message('Checking for ' + destBase + '...');

					if (_helpers2.default.symlinkExists(dest)) {
						_log2.default.ok(dest + ' exists.');
					} else {
						try {
							_fsExtra2.default.ensureSymlinkSync(dest, source);
							_log2.default.ok(dest + ' created.');
						} catch (error) {
							if (!_lodash2.default.isEmpty(error)) {
								_log2.default.error(error);
							}
						}
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
		}

		/**
   * Removes a set of files.
   *
   * @param  {String} type = 'project' [description]
   */

	}, {
		key: 'removeFiles',
		value: function removeFiles() {
			var type = arguments.length <= 0 || arguments[0] === undefined ? 'project' : arguments[0];


			var base = this.getBasePath(type);
			var files = this.files[type].remove;

			if (!files) {
				return;
			}

			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = files[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var file = _step2.value;

					file = _path2.default.join(base, file);

					try {
						_fsExtra2.default.removeSync(file);
					} catch (error) {
						if (!_lodash2.default.isEmpty(error)) {
							_log2.default.error(error);
						}
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
			var _this3 = this;

			var type = arguments.length <= 0 || arguments[0] === undefined ? 'project' : arguments[0];


			var source = _path2.default.join(this.paths.templates, type);

			if (!_helpers2.default.directoryExists(source)) {
				_log2.default.error(source + ' is not a valid template directory');

				return false;
			}

			var dirs = _helpers2.default.readDir(source);

			if (!_lodash2.default.isEmpty(dirs)) {
				dirs.forEach(function (file) {
					_this3.scaffoldFile(_path2.default.join(source, file), type);
				});
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
			var type = arguments.length <= 1 || arguments[1] === undefined ? 'project' : arguments[1];


			var file = _path2.default.basename(source, '.mustache');

			// Templates for hidden files start with `_` instead of `.`
			if (0 === file.indexOf('_')) {
				// eslint-disable-line no-magic-numbers
				file = file.replace('_', '.');
			}

			_log2.default.message('Checking for ' + file + '...');

			var base = this.getBasePath(type);
			var dest = _path2.default.join(base, file);

			if (_helpers2.default.fileExists(dest)) {
				_log2.default.ok(file + ' exists.');

				return true;
			}

			_fsExtra2.default.mkdirpSync(base);

			try {
				var templateContent = _fsExtra2.default.readFileSync(source).toString();
				var renderedContent = _mustache2.default.render(templateContent, this.templateData);

				_fsExtra2.default.writeFileSync(dest, renderedContent);

				_log2.default.ok(file + ' created.');
			} catch (error) {

				if (!_lodash2.default.isEmpty(error)) {
					_log2.default.error(error);

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
					link: new Map([['dev-lib/pre-commit', '.git/hooks'], ['dev-lib/.jshintrc', '.'], ['dev-lib/.jscsrc', '.']])
				},

				bedrock: {
					remove: new Set(['composer.*', '*.md', 'phpcs.xml', 'wp-cli.yml', '.gitignore', '.travis.yml', '.env.example', '.editorconfig'])
				}
			};
		}
	}]);

	return Scaffold;
}(_project2.default);

exports.default = Scaffold;