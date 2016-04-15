'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

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

var Scaffold = function () {

	/**
  * Class constructor. Sets default values for class properties.
  *
  * @since 0.1.0
  *
  * @todo Figure out better names for functions.
  * @todo DOCUMENT ALL THE THINGS! Maybe switch to rspec?
  * @todo Break this up into multiple classes.
  *           Scaffold should only handle project files and folders.
  *           Move WordPress / database setup into separate class.
  *           Move git commands into separate class.
  *
  */

	function Scaffold() {
		_classCallCheck(this, Scaffold);

		this._files = {
			bedrock: {
				remove: new Set(['composer.*', '*.md', 'ruleset.xml', 'wp-cli.yml', '.gitignore', '.travis.yml', '.env.example'])
			},

			project: {
				link: new Map([['dev-lib/pre-commit', '.git/hooks'], ['dev-lib/.jshintrc', '.'], ['dev-lib/.jscsrc', '.']])
			}
		};
	}

	_createClass(Scaffold, [{
		key: 'init',
		value: function init() {

			this._data = __config;
			this._data.path = __path;

			_fsExtra2.default.mkdirpSync(__path.project);

			if (!__config.project.title) {
				_log2.default.error('You must specify a project title. Check the README for usage information.');
				return;
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

			this.scaffoldFiles('scripts');

			if (__config.vvv) {
				this.scaffoldFiles('vvv');
			}
		}
	}, {
		key: 'initRepo',
		value: function initRepo() {

			if (!__config.repo.create) {
				return;
			}

			_log2.default.info('Checking for Git repo...');

			var dirExists = _helpers2.default.directoryExists(_path2.default.join(__path.project, '.git'));

			if (dirExists) {
				return _log2.default.ok('Repo exists.');
			}

			// Initialize repo.
			if (this.execSync('git init')) {
				_log2.default.ok('Repo initialized.');
			}

			// If the repo URL is set, add it as a remote.
			if (__config.repo.url) {
				var command = 'git remote add origin ' + __config.repo.url;

				if (this.execSync(command)) {
					_log2.default.ok('Remote URL added.');
				}
			}
		}
	}, {
		key: 'initDevLib',
		value: function initDevLib() {

			_log2.default.info('Checking for wp-dev-lib submodule...');

			var dirExists = _helpers2.default.directoryExists(_path2.default.join(__path.project, 'dev-lib'));

			if (dirExists) {
				return _log2.default.ok('Submodule exists.');
			}

			// Add the sub-module.
			var command = 'git submodule add -b master https://github.com/xwp/wp-dev-lib.git dev-lib';

			if (this.execSync(command)) {
				_log2.default.ok('Submodule added.');
			}
		}
	}, {
		key: 'initProject',
		value: function initProject() {

			_log2.default.info('Checking for Bedrock...');

			var dirExists = _helpers2.default.directoryExists(_path2.default.join(__path.project, 'htdocs'));

			if (dirExists) {
				return _log2.default.ok('Bedrock exists');
			}

			// Install Bedrock.
			var command = 'composer create-project roots/bedrock htdocs --no-install';

			if (this.execSync(command)) {
				_log2.default.ok('Bedrock installed.');
			}

			this.scaffoldFiles('project');
			this.scaffoldFiles('bedrock');

			this.removeFiles('bedrock');

			_log2.default.info('Installing project dependencies...');

			if (this.execSync('composer install')) {
				_log2.default.ok('Dependencies installed.');
			}
		}
	}, {
		key: 'initWordPress',
		value: function initWordPress() {

			_log2.default.info('Checking for database...');

			if (this.execSync('wp db tables')) {
				return _log2.default.ok('Database exists.');
			}

			if (this.execSync('wp db create')) {
				_log2.default.ok('Database created.');
			}

			_log2.default.info('Checking for WordPress database tables...');

			if (this.execSync('wp core is-installed')) {
				return _log2.default.ok('Tables exist.');
			}

			var command = 'wp core install' + (' --url="' + __config.project.url + '"') + (' --title="' + __config.project.title + '"') + (' --admin_user="' + __config.admin.user + '"') + (' --admin_password="' + __config.admin.pass + '"') + (' --admin_email="' + __config.admin.email + '"') + (' --path="' + this.getBasePath('wordpress') + '"');

			if (this.execSync(command)) {
				_log2.default.ok('Tables created.');
			}
		}
	}, {
		key: 'initPlugin',
		value: function initPlugin() {

			if (!__config.plugin.scaffold) {
				return;
			}

			_log2.default.info('Checking for plugin...');

			var basePath = this.getBasePath('plugin');

			if (_helpers2.default.directoryExists(basePath)) {
				return _log2.default.ok('Plugin exists.');
			}

			this.scaffoldFiles('plugin');

			['includes', 'assets/source/css', 'assets/source/js', 'assets/dist/css', 'assets/dist/js'].forEach(function (dir) {
				try {
					_fsExtra2.default.mkdirpSync(_path2.default.join(basePath, dir));
				} catch (error) {
					_log2.default.error(error);
				}
			});

			_log2.default.ok('Plugin created.');
		}
	}, {
		key: 'initTheme',
		value: function initTheme() {

			if (!__config.theme.scaffold) {
				return;
			}

			_log2.default.info('Checking for child theme...');

			var basePath = this.getBasePath('theme');

			if (_helpers2.default.directoryExists(basePath)) {
				return _log2.default.ok('Child theme exists.');
			}

			this.scaffoldFiles('theme');

			['includes', 'assets/source/css', 'assets/source/js', 'assets/dist/css', 'assets/dist/js'].forEach(function (dir) {
				try {
					_fsExtra2.default.mkdirpSync(_path2.default.join(basePath, dir));
				} catch (error) {
					_log2.default.error(error);
				}
			});

			this.copyAssets('theme', 'css');

			_log2.default.ok('Theme created.');

			_log2.default.info('Installing theme dependencies...');

			this.execSync('npm install', 'theme');
			this.execSync('bower install', 'theme');

			_log2.default.ok('Done');
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


			var options = {
				cwd: this.getBasePath(type)
			};

			try {
				_child_process2.default.execSync(command, options);
				return true;
			} catch (error) {
				_log2.default.error(error);
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
				plugin: _path2.default.join('htdocs/web/app/plugins/', __config.plugin.slug),
				theme: _path2.default.join('htdocs/web/app/themes/', __config.theme.slug)
			};

			// We convert the type to camel case so we don't run into issues if we
			// want to use a type like `type-name` or `type_name`.
			var base = basePaths[_lodash2.default.camelCase(type)];

			if (!base) {
				base = '';
			}

			return _path2.default.join(__path.project, base);
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


			var source = _path2.default.join(__path.assets, type, dir);
			var dest = _path2.default.join(this.getAssetsPath(type), dir);

			if (!_helpers2.default.directoryExists(source)) {
				return _log2.default.error(source + ' is not a valid assets folder.');
			}

			try {
				_fsExtra2.default.mkdirpSync(dest);
				_fsExtra2.default.copySync(source, dest);

				_log2.default.ok(_lodash2.default.startCase(type) + ' assets created.');
			} catch (error) {
				_log2.default.error(error);
			}
		}
	}, {
		key: 'linkFiles',
		value: function linkFiles() {
			var type = arguments.length <= 0 || arguments[0] === undefined ? 'project' : arguments[0];


			var base = this.getBasePath(type);
			var files = this._files[type].remove;

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

					var destPath = _path2.default.join(__path.project, dest);
					var sourcePath = _path2.default.join(__path.project, source);

					_log2.default.info('Checking for ' + dest + '...');

					if (_helpers2.default.symlinkExists(destPath)) {
						return _log2.default.ok(dest + ' exists.');
					}

					try {
						_fsExtra2.default.ensureSymlinkSync(destPath, sourcePath);
						_log2.default.ok(dest + ' created.');
					} catch (error) {
						_log2.default.error(error);
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
			var files = this._files[type].remove;

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
					} catch (error) {}
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
			var _this = this;

			var type = arguments.length <= 0 || arguments[0] === undefined ? 'project' : arguments[0];


			var source = _path2.default.join(__path.templates, type);

			if (!_helpers2.default.directoryExists(source)) {
				return _log2.default.error(source + ' is not a valid template directory');
			}

			try {
				var dirs = _fsExtra2.default.readdirSync(source);

				dirs.forEach(function (file) {

					var filePath = _path2.default.join(source, file);

					if (_helpers2.default.fileExists(filePath)) {
						_this.scaffoldFile(filePath, type);
					}
				});
			} catch (error) {
				_log2.default.error(error);
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

			_log2.default.info('Checking for ' + file + '...');

			var base = this.getBasePath(type);
			var dest = _path2.default.join(base, file);

			if (_helpers2.default.fileExists(dest)) {
				return _log2.default.ok(file + ' exists.');
			}

			_fsExtra2.default.mkdirpSync(base);

			try {
				var templateContent = _fsExtra2.default.readFileSync(source).toString();
				var renderedContent = _mustache2.default.render(templateContent, this._data);

				_fsExtra2.default.writeFileSync(dest, renderedContent);

				_log2.default.ok(file + ' created.');
			} catch (error) {
				_log2.default.error(error);
			}
		}
	}]);

	return Scaffold;
}();

exports.default = new Scaffold();