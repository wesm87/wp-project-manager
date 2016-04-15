/**
 * Performs all of the following:
 *   - Create project folder.
 *   - Create vvv-hosts, vvv-nginx.conf, and vvv-init.sh.
 *   - When vvv-init.sh runs: update Node to 5.x, install Gulp & Bower.
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
 * @todo Separate script out into individual command modules.
 *       @todo Add argument validation and sanitization.
 *       @todo Add description, usage, example, and copyright messages.
 * @todo Add functions to validate, sanitize, and/or format Git repo URLs.
 * @todo Add the ability to install VVV using WP Project Manager.
 */

'use strict';

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _yargs = require('yargs');

var _yargs2 = _interopRequireDefault(_yargs);

var _utilsUpsearch = require('utils-upsearch');

var _utilsUpsearch2 = _interopRequireDefault(_utilsUpsearch);

var _helpers = require('./include/helpers');

var _helpers2 = _interopRequireDefault(_helpers);

var _project = require('./include/project');

var _project2 = _interopRequireDefault(_project);

var _scaffold = require('./include/scaffold');

var _scaffold2 = _interopRequireDefault(_scaffold);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var appPath = __dirname;
var rootPath = _path2.default.join(__dirname, '..');
var cwd = process.cwd();

global.__path = {
  app: appPath,
  root: rootPath,
  cwd: cwd,
  project: cwd,
  includes: _path2.default.join(appPath, 'include'),
  assets: _path2.default.join(rootPath, 'project-files', 'assets'),
  templates: _path2.default.join(rootPath, 'project-files', 'templates'),
  plugins: _path2.default.join(rootPath, 'project-files', 'plugins'),
  test: _path2.default.join(rootPath, 'test'),
  config: _utilsUpsearch2.default.sync('project.yml')
};

if (!__path.config) {
  __path.config = _path2.default.join(rootPath, 'project.yml');
}

_yargs2.default.options({
  'config': {
    default: __path.config
  }
}).config('config', function (configPath) {
  return _helpers2.default.loadYAML(configPath);
}).pkgConf('wpProjectManager', __path.cwd).help().completion();

var argv = _yargs2.default.argv;

if ('node-test' === argv.env) {
  __path.project = _path2.default.join(__path.root, '_test-project');
  _fsExtra2.default.removeSync(__path.project);
  _fsExtra2.default.mkdirpSync(__path.project);
}

_project2.default.parseConfig(argv);
_scaffold2.default.init();