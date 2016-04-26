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
		value: function init() {

			_fsExtra2.default.mkdirpSync(this.paths.project);

			if (!this.config.project.title) {
				_log2.default.error('You must specify a project title. Check the README for usage information.');
				return;
			}

			if ('node-test' === this.config.env) {
				_fsExtra2.default.removeSync(this.paths.project);
				_fsExtra2.default.mkdirpSync(this.paths.project);
			}

			this.createProject();
		}
	}, {
		key: 'createProject',
		value: function createProject() {
			this.initProjectFiles();
			this.initRepo();
			this.initDevLib();
			this.initProject();
			this.initPlugin();
			this.initTheme();
		}
	}, {
		key: 'createInitScript',
		value: function createInitScript() {
			this.initWordPress();
			this.maybeInstallPackages();
		}
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
	}, {
		key: 'maybeCopyPluginZips',
		value: function maybeCopyPluginZips() {

			if (!_helpers2.default.directoryExists(this.paths.plugins)) {
				return;
			}

			_log2.default.message('Copying plugin ZIPs...');

			var source = this.paths.plugins;
			var dest = _path2.default.join(this.paths.project, 'plugin-zips');

			_fsExtra2.default.copySync(source, dest);

			_log2.default.ok('Plugin ZIPs copied.');
		}
	}, {
		key: 'parseTemplateData',
		value: function parseTemplateData() {
			var _this2 = this;

			var pluginZipsDir = _path2.default.join(this.paths.project, 'plugin-zips');

			this.templateData = this.config;

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
	}, {
		key: 'initRepo',
		value: function initRepo() {

			if (!this.config.repo.create) {
				return;
			}

			_log2.default.message('Checking for Git repo...');

			var dirExists = _helpers2.default.directoryExists(_path2.default.join(this.paths.project, '.git'));

			if (dirExists) {
				return _log2.default.ok('Repo exists.');
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
		}
	}, {
		key: 'initDevLib',
		value: function initDevLib() {

			_log2.default.message('Checking for wp-dev-lib submodule...');

			var dirExists = _helpers2.default.directoryExists(_path2.default.join(this.paths.project, 'dev-lib'));

			if (dirExists) {
				return _log2.default.ok('Submodule exists.');
			}

			// Add the sub-module.
			var command = 'git submodule add -f -b master https://github.com/xwp/wp-dev-lib.git dev-lib';

			if (this.execSync(command, 'project', false)) {
				_log2.default.ok('Submodule added.');
			}
		}
	}, {
		key: 'initProject',
		value: function initProject() {

			_log2.default.message('Checking for Bedrock...');

			var dirExists = _helpers2.default.directoryExists(_path2.default.join(this.paths.project, 'htdocs'));

			if (dirExists) {
				return _log2.default.ok('Bedrock exists');
			}

			// Install Bedrock.
			var command = 'composer create-project roots/bedrock htdocs --no-install';

			if (this.execSync(command, 'project', false)) {
				_log2.default.ok('Bedrock installed.');
			}

			this.linkFiles('project');
			this.scaffoldFiles('project');
			this.scaffoldFiles('bedrock');
			this.removeFiles('bedrock');

			_log2.default.message('Installing project dependencies...');

			if (this.execSync('composer install', 'project', false)) {
				_log2.default.ok('Dependencies installed.');
			}
		}
	}, {
		key: 'initWordPress',
		value: function initWordPress() {

			_log2.default.message('Checking for database...');

			if (this.execSync('wp db tables')) {
				return _log2.default.ok('Database exists.');
			}

			if (this.execSync('wp db create')) {
				_log2.default.ok('Database created.');
			}

			_log2.default.message('Checking for WordPress database tables...');

			if (this.execSync('wp core is-installed')) {
				return _log2.default.ok('Tables exist.');
			}

			var command = 'wp core install' + (' --url="' + this.config.project.url + '"') + (' --title="' + this.config.project.title + '"') + (' --admin_user="' + this.config.admin.user + '"') + (' --admin_password="' + this.config.admin.pass + '"') + (' --admin_email="' + this.config.admin.email + '"') + (' --path="' + this.getBasePath('wordpress') + '"');

			if (this.execSync(command)) {
				_log2.default.ok('Tables created.');
			}
		}
	}, {
		key: 'initPlugin',
		value: function initPlugin() {

			if (!this.config.plugin.scaffold) {
				return;
			}

			_log2.default.message('Checking for plugin...');

			var basePath = this.getBasePath('plugin');

			if (_helpers2.default.directoryExists(basePath)) {
				return _log2.default.ok('Plugin exists.');
			}

			this.scaffoldFiles('plugin');

			var pluginDirs = ['includes', 'assets/source/css', 'assets/source/js', 'assets/source/fonts', 'assets/dist/css', 'assets/dist/js', 'assets/dist/fonts'];

			pluginDirs.forEach(function (dir) {
				try {
					_fsExtra2.default.mkdirpSync(_path2.default.join(basePath, dir));
				} catch (error) {
					_log2.default.error(error);
				}
			});

			var pluginFiles = ['assets/dist/css/.gitkeep', 'assets/dist/js/.gitkeep', 'assets/dist/fonts/.gitkeep'];

			pluginFiles.forEach(function (file) {
				try {
					_fsExtra2.default.ensureFileSync(file);
				} catch (error) {}
			});

			_log2.default.ok('Plugin created.');
		}
	}, {
		key: 'createPluginTests',
		value: function createPluginTests() {
			_log2.default.error('This feature is not ready');
		}
	}, {
		key: 'initTheme',
		value: function initTheme() {

			if (!this.config.theme.scaffold) {
				return;
			}

			_log2.default.message('Checking for child theme...');

			var basePath = this.getBasePath('theme');

			if (_helpers2.default.directoryExists(basePath)) {
				return _log2.default.ok('Child theme exists.');
			}

			this.scaffoldFiles('theme');

			var themeDirs = ['includes', 'assets/source/css', 'assets/source/js', 'assets/source/fonts', 'assets/dist/css', 'assets/dist/js', 'assets/dist/fonts'];

			themeDirs.forEach(function (dir) {
				try {
					_fsExtra2.default.mkdirpSync(_path2.default.join(basePath, dir));
				} catch (error) {
					_log2.default.error(error);
				}
			});

			var themeFiles = ['assets/dist/css/.gitkeep', 'assets/dist/js/.gitkeep', 'assets/dist/fonts/.gitkeep'];

			themeFiles.forEach(function (file) {
				try {
					_fsExtra2.default.ensureFileSync(file);
				} catch (error) {}
			});

			this.copyAssets('theme', 'css');

			_log2.default.ok('Theme created.');

			_log2.default.message('Installing theme dependencies...');

			this.execSync('npm install', 'theme');
			this.execSync('bower install', 'theme');

			_log2.default.ok('Done');
		}
	}, {
		key: 'createThemeTests',
		value: function createThemeTests() {
			_log2.default.error('This feature is not ready');
		}
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
					return _log2.default.error(error);
				}

				// If a callback was provided, call it.
				if (callback) {
					return callback(stdout, stderr);
				}

				// Otherwise just return true.
				return true;
			});
		}
	}, {
		key: 'execSync',
		value: function execSync(command) {
			var type = arguments.length <= 1 || arguments[1] === undefined ? 'project' : arguments[1];
			var logError = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];


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
	}, {
		key: 'copyAssets',
		value: function copyAssets() {
			var type = arguments.length <= 0 || arguments[0] === undefined ? 'theme' : arguments[0];
			var dir = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];


			var source = _path2.default.join(this.paths.assets, type, dir);
			var dest = _path2.default.join(this.getAssetsPath(type), dir);

			if (!_helpers2.default.directoryExists(source)) {
				return _log2.default.error(source + ' is not a valid assets folder.');
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
		}
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


					dest = _path2.default.join(dest, _path2.default.basename(source));

					var destPath = _path2.default.join(base, dest);
					var sourcePath = _path2.default.join(base, source);

					_log2.default.message('Checking for ' + dest + '...');

					if (_helpers2.default.symlinkExists(destPath)) {
						return _log2.default.ok(dest + ' exists.');
					}

					try {
						_fsExtra2.default.ensureSymlinkSync(destPath, sourcePath);
						_log2.default.ok(dest + ' created.');
					} catch (error) {
						if (!_lodash2.default.isEmpty(error)) {
							_log2.default.error(error);
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

					var filePath = _path2.default.join(base, file);

					try {
						_fsExtra2.default.removeSync(filePath);
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
	}, {
		key: 'scaffoldFiles',
		value: function scaffoldFiles() {
			var _this3 = this;

			var type = arguments.length <= 0 || arguments[0] === undefined ? 'project' : arguments[0];


			var source = _path2.default.join(this.paths.templates, type);

			if (!_helpers2.default.directoryExists(source)) {
				return _log2.default.error(source + ' is not a valid template directory');
			}

			var dirs = _helpers2.default.readDir(source);

			if (!_lodash2.default.isEmpty(dirs)) {
				dirs.forEach(function (file) {
					_this3.scaffoldFile(_path2.default.join(source, file), type);
				});
			}
		}
	}, {
		key: 'scaffoldFile',
		value: function scaffoldFile(source) {
			var type = arguments.length <= 1 || arguments[1] === undefined ? 'project' : arguments[1];


			var file = _path2.default.basename(source, '.mustache');

			// Templates for hidden files start with `_` instead of `.`
			if (0 === file.indexOf('_')) {
				file = file.replace('_', '.');
			}

			_log2.default.message('Checking for ' + file + '...');

			var base = this.getBasePath(type);
			var dest = _path2.default.join(base, file);

			if (_helpers2.default.fileExists(dest)) {
				return _log2.default.ok(file + ' exists.');
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
				}
			}
		}
	}, {
		key: 'files',
		get: function get() {
			return {
				bedrock: {
					remove: new Set(['composer.*', '*.md', 'phpcs.xml', 'wp-cli.yml', '.gitignore', '.travis.yml', '.env.example', '.editorconfig'])
				},

				project: {
					link: new Map([['dev-lib/pre-commit', '.git/hooks'], ['dev-lib/.jshintrc', '.'], ['dev-lib/.jscsrc', '.']])
				}
			};
		}
	}]);

	return Scaffold;
}(_project2.default);

exports.default = Scaffold;