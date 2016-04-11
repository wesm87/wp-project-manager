'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _rimraf = require('rimraf');

var _rimraf2 = _interopRequireDefault(_rimraf);

var _mustache = require('mustache');

var _mustache2 = _interopRequireDefault(_mustache);

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
			vvv: {
				create: new Set(['vvv-hosts', 'vvv-init.sh', 'vvv-nginx.conf'])
			},

			bedrock: {
				create: new Set(['.env']),

				remove: new Set(['composer.*', 'vendor', '*.md', 'ruleset.xml', 'wp-cli.yml', '.gitignore', '.travis.yml', '.env.example'])
			},

			project: {
				create: new Set(['composer.json', 'phpcs.ruleset.xml', 'wp-cli.yml', '.gitignore', '.editorconfig', '.travis.yml', '.scss-lint.yml', '.jshintignore', '.babelrc', '.dev-lib']),

				link: new Map([['dev-lib/pre-commit', '.git/hooks'], ['dev-lib/.jshintrc', '.'], ['dev-lib/.jscsrc', '.']])
			},

			theme: {
				create: new Set(['bower.json', 'package.json', 'gulpfile.babel.js', 'style.css'])
			}
		};
	}

	_createClass(Scaffold, [{
		key: 'init',
		value: function init() {
			_mkdirp2.default.sync(__path.project);

			if (__config.vvv) {
				this.createInitScript();
			} else {

				if (!__config.project.title) {
					_helpers2.default.logFailure('Error: you must specify a project title. Check the README for more information.');
					return;
				}

				this.createProject();
			}
		}
	}, {
		key: 'createProject',
		value: function createProject() {
			this.initProjectFiles();
			this.initRepo();
			this.initDevLib();
			this.initProject();
		}
	}, {
		key: 'createInitScript',
		value: function createInitScript() {
			this.initWordPress();
			this.initPlugin();
			this.initTheme();

			this.maybeInstallPackages();
		}
	}, {
		key: 'initProjectFiles',
		value: function initProjectFiles() {
			this.createFiles('vvv');
		}
	}, {
		key: 'initRepo',
		value: function initRepo() {

			if (__config.repo.create) {

				console.log('Checking for Git repo...');

				if (_helpers2.default.directoryExists(__path.project + '/.git')) {
					return _helpers2.default.logSuccess('Repo exists');
				}

				// Initialize repo.
				this.execSync('git init');

				// If the repo URL is set, add it as a remote.
				if (__config.repo.url) {
					this.execSync('git remote add origin ' + __config.repo.url);
				}

				return _helpers2.default.logSuccess('Repo initialized');
			}
		}
	}, {
		key: 'initDevLib',
		value: function initDevLib() {

			console.log('Checking for wp-dev-lib submodule...');

			if (_helpers2.default.directoryExists(__path.project + '/dev-lib')) {
				return _helpers2.default.logSuccess('Submodule exists.');
			}

			// Add the sub-module.
			var command = 'git submodule add -b master https://github.com/xwp/wp-dev-lib.git dev-lib';
			this.execSync(command);
			_helpers2.default.logSuccess('Submodule added.');
		}
	}, {
		key: 'initProject',
		value: function initProject() {

			console.log('Checking for Bedrock...');

			// Install Bedrock.
			if (_helpers2.default.directoryExists(__path.project + '/htdocs')) {
				return _helpers2.default.logSuccess('Bedrock exists');
			}

			var command = 'composer create-project roots/bedrock htdocs --no-install';
			this.execSync(command);

			_helpers2.default.logSuccess('Bedrock installed.');

			this.createFiles('project');
			this.createFiles('bedrock');
			this.removeFiles('bedrock');

			console.log('Installing project dependencies...');

			this.execSync('composer install');

			_helpers2.default.logSuccess('Dependencies installed.');
		}
	}, {
		key: 'initWordPress',
		value: function initWordPress() {

			console.log('Checking for database...');

			if (this.execSync('wp db tables')) {
				return _helpers2.default.logSuccess('Database exists.');
			}

			this.execSync('wp db create');
			_helpers2.default.logSuccess('Database created.');

			console.log('Checking for WordPress database tables...');

			if (this.execSync('wp core is-installed')) {
				return _helpers2.default.logSuccess('Tables exist.');
			}

			var command = 'wp core install' + (' --url="' + __config.project.url + '"') + (' --title="' + __config.project.title + '"') + (' --admin_user="' + __config.admin.user + '"') + (' --admin_password="' + __config.admin.password + '"') + (' --admin_email="' + __config.admin.email + '"') + (' --path="' + this.getBasePath('wordpress') + '"');

			this.execSync(command);
			_helpers2.default.logSuccess('Tables created.');
		}
	}, {
		key: 'initPlugin',
		value: function initPlugin() {

			if (!__config.plugin.scaffold) {
				return;
			}

			console.log('Checking for plugin...');

			if (this.execSync('wp plugin is-installed ' + __config.plugin.slug)) {
				return _helpers2.default.logSuccess('Plugin exists.');
			}

			var command = 'wp scaffold plugin ' + __config.plugin.slug + (' --plugin_name="' + __config.plugin.name + '" --activate');

			this.execSync(command);
			this.execSync('wp plugin activate ' + __config.plugin.slug);
		}
	}, {
		key: 'initTheme',
		value: function initTheme() {

			if (!__config.theme.scaffold) {
				return;
			}

			console.log('Checking for theme...');

			if (this.execSync('wp theme is-installed ' + __config.theme.slug)) {
				return _helpers2.default.logSuccess('Theme exists.');
			}

			var command = 'wp scaffold child-theme ' + __config.theme.slug + ' --activate --parent_theme=sage' + (' --theme_name="' + __config.theme.name + '"');

			this.execSync(command);
			this.execSync('wp theme activate ' + __config.theme.slug);

			var themeDir = this.getBasePath('theme');
			_mkdirp2.default.sync(themeDir + '/assets/source/css');
			_mkdirp2.default.sync(themeDir + '/assets/source/js');
			_mkdirp2.default.sync(themeDir + '/assets/dist/css');
			_mkdirp2.default.sync(themeDir + '/assets/dist/js');

			this.createFiles('theme');

			_helpers2.default.logSuccess('Theme created.');

			console.log('Installing theme dependencies...');

			this.execSync('npm install', 'theme');
			this.execSync('bower install', 'theme');

			_helpers2.default.logSuccess('Done');
		}
	}, {
		key: 'initParentTheme',
		value: function initParentTheme() {

			console.log('Checking for parent theme...');

			if (this.execSync('wp theme is-installed sage')) {
				return _helpers2.default.logSuccess('Parent theme exists.');
			}

			this.execSync('composer create-project roots/sage ' + this.getBasePath('parentTheme '));
			this.execSync('wp theme activate sage');

			_helpers2.default.logSuccess('Parent theme created.');
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
					return _helpers2.default.logFailure('Error: ' + error);
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
				return _child_process2.default.execSync(command, options);
			} catch (error) {
				_helpers2.default.logFailure('Error: ' + error);
				return false;
			}
		}
	}, {
		key: 'getBasePath',
		value: function getBasePath() {
			var type = arguments.length <= 0 || arguments[0] === undefined ? 'project' : arguments[0];


			var basePaths = {
				project: '.',
				vvv: 'vvv-config',
				bedrock: 'htdocs',
				wordpress: 'htdocs/web/wp',
				plugin: 'htdocs/web/app/plugins/' + __config.plugin.slug,
				theme: 'htdocs/web/app/themes/' + __config.theme.slug,
				parentTheme: 'htdocs/web/app/themes/sage'
			};

			var base = basePaths[_lodash2.default.camelCase(type)];

			if (!base) {
				base = '';
			}

			return _path2.default.join(__path.project, base);
		}
	}, {
		key: 'createFiles',
		value: function createFiles() {
			var type = arguments.length <= 0 || arguments[0] === undefined ? 'project' : arguments[0];


			var files = this._files[type].create;

			if (!files) {
				_helpers2.default.logFailure('Error: no files found in config for "' + type + '".');
				return false;
			}

			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = files[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var file = _step.value;

					this.scaffoldFile(file, type);
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
		key: 'linkFiles',
		value: function linkFiles() {
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
					var _step2$value = _slicedToArray(_step2.value, 2);

					var source = _step2$value[0];
					var dest = _step2$value[1];


					var destFile = _path2.default.basename(source);
					var destRel = _path2.default.join(dest, destFile);
					var destAbs = _path2.default.join(__path.project, destRel);

					console.log('Checking for ' + destRel + '...');
					_helpers2.default.logSuccess('Link to ' + source + ' created');
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
		key: 'removeFiles',
		value: function removeFiles() {
			var type = arguments.length <= 0 || arguments[0] === undefined ? 'project' : arguments[0];


			var base = this.getBasePath(type);
			var files = this._files[type].remove;

			if (!files) {
				return;
			}

			var _iteratorNormalCompletion3 = true;
			var _didIteratorError3 = false;
			var _iteratorError3 = undefined;

			try {
				for (var _iterator3 = files[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
					var file = _step3.value;

					var filePath = _path2.default.join(base, file);
					_rimraf2.default.sync(filePath);
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
	}, {
		key: 'scaffoldFile',
		value: function scaffoldFile(file) {
			var type = arguments.length <= 1 || arguments[1] === undefined ? 'project' : arguments[1];


			console.log('Checking for ' + file + '...');

			var sourceFile = _path2.default.basename(file) + '.mustache';

			// Templates for hidden files start with `_` instead of `.`
			if (0 === file.indexOf('.')) {
				sourceFile = sourceFile.replace('.', '_');
			}

			if (type) {
				sourceFile = _path2.default.join(_lodash2.default.kebabCase(type), sourceFile);
			}

			var base = this.getBasePath(type);
			var dest = _path2.default.join(base, file);
			var source = _path2.default.join(__path.templates, sourceFile);

			if (_helpers2.default.fileExists(dest)) {
				return _helpers2.default.logSuccess(file + ' exists.');
			}

			_mkdirp2.default.sync(base);

			try {
				var contentOriginal = _fs2.default.readFileSync(source).toString();
				var contentRendered = _mustache2.default.render(contentOriginal, __config);

				_fs2.default.writeFileSync(dest, contentRendered);

				return _helpers2.default.logSuccess(file + ' created.');
			} catch (error) {
				_helpers2.default.logFailure('Error: ' + error);
			}
		}
	}]);

	return Scaffold;
}();

exports.default = new Scaffold();