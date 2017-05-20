import yargs from 'yargs';
import _JSON$stringify from 'babel-runtime/core-js/json/stringify';
import _getIterator from 'babel-runtime/core-js/get-iterator';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import { isEmpty, isObjectLike, keys } from 'lodash';
import colors from 'colors';
import path from 'path';
import upsearch from 'utils-upsearch';
import { camelCase, complement, compose, constant, defaultsDeep, has, isEmpty as isEmpty$1, isEqual, isFunction, kebabCase, merge, partialRight, pickBy, replace, snakeCase, startCase, startsWith, stubArray, stubFalse, stubString, toString, truncate, values } from 'lodash/fp';
import { mock } from 'mocktail';
import fs from 'fs-extra';
import YAML from 'js-yaml';
import thenifyAll from 'thenify-all';
import crypto from 'mz/crypto';
import _Set from 'babel-runtime/core-js/set';
import _slicedToArray from 'babel-runtime/helpers/slicedToArray';
import _regeneratorRuntime from 'babel-runtime/regenerator';
import _asyncToGenerator from 'babel-runtime/helpers/asyncToGenerator';
import _Object$getPrototypeOf from 'babel-runtime/core-js/object/get-prototype-of';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';
import cp from 'mz/child_process';
import mustache from 'mustache';

var _class;
var _temp;

/**
 * @module
 */

/**
 * Filesystem helper methods, plus everything from the `fs-extra` module (which
 * itself includes everything from the core `fs` module). All the `fs-extra`
 * methods have been modified to return a Promise so `async/await` can be used.
 */
var FSHelpers = (_temp = _class = function () {
  function FSHelpers() {
    _classCallCheck(this, FSHelpers);
  }

  _createClass(FSHelpers, null, [{
    key: '_inheritMethods',


    /**
     * Takes an object and copies any methods it has into this class.
     *
     * @since 0.7.17
     *
     * @param {Object} source The source object.
     */
    value: function _inheritMethods(source) {
      var methods = values(source).filter(isFunction);

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = _getIterator(methods), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var method = _step.value;

          this[method] = source[method].bind(this);
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
     * Checks whether the specified file is a hidden file.
     *
     * @param  {String} file The file name to check.
     * @return {Boolean}     True if the file name begins with a dot;
     *                       false if not.
     */

  }, {
    key: 'pathExists',


    /**
     * Checks if the specified file or directory exists.
     *
     * @since 0.1.0
     * @since 0.2.0  Added 'symlink' type.
     * @since 0.7.17 Moved to `FSHelpers` class; now returns a Promise.
     *
     * @param  {String} path The path to check.
     * @param  {String} type Optional. A type to check the path against.
     * @return {Promise}     Resolves to true if path exists and matches `type`;
     *                       false if not.
     */
    value: function pathExists(path$$1) {
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'any';

      return this.lstat(path$$1).then(function handleSuccess(info) {
        switch (type) {
          case 'file':
            {
              return info.isFile();
            }
          case 'folder':
          case 'directory':
            {
              return info.isDirectory();
            }
          case 'link':
          case 'symlink':
            {
              return info.isSymbolicLink();
            }
          default:
            {
              return Boolean(info);
            }
        }
      }).catch(stubFalse);
    }

    /**
     * Checks if the specified file exists.
     *
     * @since 0.1.0
     * @since 0.7.17 Moved to `FSHelpers` class; now returns a Promise.
     *
     * @param  {String} path The path to the file to check.
     * @return {Boolean}     Resolves to true if file exists; false if not.
     */


    /**
     * Checks if the specified directory exists.
     *
     * @since 0.1.0
     * @since 0.7.17 Moved to `FSHelpers` class; now returns a Promise.
     *
     * @param  {String} path The path to the directory to check.
     * @return {Promise}     Resolves to true if directory exists; false if not.
     */


    /**
     * Alias for `directoryExists`.
     *
     * @since 0.7.17
     *
     * @param  {String} path The path to the directory to check.
     * @return {Promise}     Resolves to true if directory exists; false if not.
     */


    /**
     * Checks if the specified symbolic link exists.
     *
     * @since 0.2.0
     * @since 0.7.17 Moved to `FSHelpers` class; now returns a Promise.
     *
     * @param  {String} path The path to the link to check.
     * @return {Promise}     Resolves to true if link exists; false if not.
     */

  }, {
    key: 'readDir',


    /**
     * Takes a directory path and returns Promise that resolves to an array,
     * which contains the contents of the directory.
     *
     * @since 0.4.0
     * @since 0.7.17 Moved to `FSHelpers` class; now returns a Promise.
     *
     * @param  {String}  dir                   The directory path.
     * @param  {Boolean} [includeHidden=false] If true, include hidden files.
     * @return {Promise}                       Resolves to an array of the
     *                                         directory's contents.
     */
    value: function readDir(dir) {
      var includeHidden = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      return this.readdir(dir).then(function handleSuccess(files) {
        if (!includeHidden) {
          return files.filter(this.isHiddenFile);
        }

        return files;
      }).catch(stubArray);
    }

    /**
     * Tries to load a YAML config file and parse it into JSON.
     *
     * @since 0.1.0
     * @since 0.7.17 Moved to `FSHelpers` class; now returns a Promise.
     *
     * @param  {String} filePath The path to the YAML file.
     * @return {Promise}          Resolves to the parsed results on success;
     *                            an empty object on failure.
     */

  }, {
    key: 'loadYAML',
    value: function loadYAML(filePath) {
      var defaultValue = {};

      return this.readFile(filePath, 'utf8').then(function handleSuccess(contents) {
        var json = YAML.safeLoad(contents);

        return json || defaultValue;
      }).catch(constant(defaultValue));
    }

    /**
     * Takes a JSON string or object, parses it into YAML, and writes to a file.
     *
     * @since 0.3.0
     * @since 0.7.17 Moved to `FSHelpers` class; now returns a Promise.
     *
     * @param  {String} filePath The path to the file to write to.
     * @param  {Object} json     The JSON object to parse into YAML.
     * @return {Promise}         Resolves to true on success; false on failure.
     */

  }, {
    key: 'writeYAML',
    value: function writeYAML(filePath, json) {
      var yaml = YAML.safeDump(json, { noCompatMode: true });

      return this.writeFile(filePath, yaml);
    }
  }]);

  return FSHelpers;
}(), _class.isHiddenFile = complement(startsWith('.')), _class.fileExists = partialRight(undefined.pathExists, ['file']), _class.directoryExists = partialRight(undefined.pathExists, ['directory']), _class.dirExists = undefined.directoryExists, _class.symlinkExists = partialRight(undefined.pathExists, ['symlink']), _temp);


FSHelpers._inheritMethods(thenifyAll(fs));

var fs$1 = mock(FSHelpers);

/**
 * Generates a random string in hexadecimal format.
 *
 * @since 0.1.0
 *
 * @param  {Number} strLen         The number of characters to include in the string.
 * @param  {String} [format='hex'] The string format to use (hex, base64, etc).
 * @return {String}                The randomly generated string.
 */
function randomString(strLen) {
  var format = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'hex';

  var numBytes = void 0;

  // Adjust number of bytes based on desired string format.
  if (format === 'hex') {
    numBytes = Math.ceil(strLen * RATIOS.BYTES_TO_HEX);
  } else if (format === 'base64') {
    numBytes = Math.ceil(strLen * RATIOS.BYTES_TO_BASE64);
  }

  var sliceString = truncate({
    length: strLen,
    ommission: ''
  });

  var formatString = compose(sliceString, toString);

  // log.error(reason) -> stubString() -> ''
  var handleError = compose(stubString, log.error);

  return crypto.randomBytes(numBytes).then(formatString).catch(handleError);
}

/**
 * @module
 */

var upperSnakeCase = compose(replace(/ /g, '_'), startCase);

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
      if (file && fs$1.fileExists(file)) {
        config = fs$1.loadYAML(file);
      }

      // If we don't have a config object (or the config object is empty)
      // fall back to the default config file.
      if (isEmpty$1(config) && fs$1.fileExists(this.paths.config)) {
        config = fs$1.loadYAML(this.paths.config);
      }

      config = merge(config, yargs.argv);

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

      var parsed = config;

      // Merge config with defaults.
      parsed = pickBy(function (value, key) {
        return has(key, _this.defaultConfig);
      }, defaultsDeep(this.defaultConfig, config));

      // Fill in any config values that aren't set.
      parsed = this.ensureProjectConfig(parsed);
      parsed = this.ensurePluginConfig(parsed);
      parsed = this.ensureThemeConfig(parsed);
      parsed = this.ensureDatabaseConfig(parsed);
      parsed = this.ensureSecretConfig(parsed);

      // Set internal config values.
      parsed.project.folder = path.basename(this.paths.project);
      parsed.project.namespace = upperSnakeCase(parsed.project.title);

      parsed.plugin.id = snakeCase(parsed.plugin.name);
      parsed.plugin.class = upperSnakeCase(parsed.plugin.name);
      parsed.plugin.namespace = parsed.project.namespace || parsed.plugin.class;
      parsed.plugin.namespace = parsed.plugin.namespace + '\\Plugin';

      parsed.theme.id = snakeCase(parsed.theme.name);
      parsed.theme.class = upperSnakeCase(parsed.theme.name);
      parsed.theme.namespace = parsed.project.namespace || parsed.theme.class;
      parsed.theme.namespace = parsed.theme.namespace + '\\Theme';

      // Return the updated config settings.
      return parsed;
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
      var parsed = config;

      if (!parsed.project.title && parsed.project.slug) {
        parsed.project.title = startCase(parsed.project.slug);
      }

      if (!parsed.project.slug && parsed.project.title) {
        parsed.project.slug = kebabCase(parsed.project.title);
      }

      if (!parsed.project.url) {
        parsed.project.url = parsed.project.slug + '.dev';
      }

      return parsed;
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
      var parsed = config;

      if (!parsed.plugin.name) {
        if (parsed.plugin.slug) {
          parsed.plugin.name = startCase(parsed.plugin.slug);
        } else {
          parsed.plugin.name = parsed.project.title;
        }
      }

      if (!parsed.plugin.slug) {
        parsed.plugin.slug = kebabCase(parsed.plugin.name);
      }

      return parsed;
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
      var parsed = config;

      if (!parsed.theme.name) {
        if (parsed.theme.slug) {
          parsed.theme.name = startCase(parsed.theme.slug);
        } else {
          parsed.theme.name = parsed.project.title;
        }
      }

      if (!parsed.theme.slug) {
        parsed.theme.slug = parsed.theme.name;
      }

      return parsed;
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
      var parsed = config;

      if (!parsed.db.name) {
        parsed.db.name = parsed.project.slug;
      }

      if (!parsed.db.prefix) {
        parsed.db.prefix = randomString(DB_PREFIX_LENGTH) + '_';
      }

      return parsed;
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
      var parsed = config;
      var types = ['auth', 'secure_auth', 'logged_in', 'nonce'];

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = _getIterator(types), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var type = _step.value;

          if (!parsed.secret[type + '_key']) {
            var secretKey = randomString(SECRET_KEY_LENGTH, 'base64');

            parsed.secret[type + '_key'] = secretKey;
          }
          if (!parsed.secret[type + '_salt']) {
            var secretSalt = randomString(SECRET_SALT_LENGTH, 'base64');

            parsed.secret[type + '_salt'] = secretSalt;
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

      return parsed;
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

      if (force && fs$1.fileExists(this.paths.config)) {
        fs$1.removeSync(this.paths.config);
      }

      if (!fs$1.fileExists(this.paths.config)) {
        fs$1.writeYAML(this.paths.config, this.defaultConfig);
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
      if (process.platform === 'win32') {
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

        for (var _iterator = _getIterator(keys(this.styles)), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
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
      var output = message;

      // Convert object-like messages to string.
      if (isObjectLike(output)) {
        output = _JSON$stringify(output, null, JSON_TAB_WIDTH);
      }

      // Don't log anything if message is empty.
      if (isEmpty(output)) {
        return;
      }

      // Make sure the message is a string.
      output = String(output);

      // Check if a valid style was specified.
      if (style && output[style]) {
        // Bail if the style is 'debug' and debugging is disabled.
        if (style === 'debug' && !Project$1.debug) {
          return;
        }

        // If the style has an associated icon, prepend it to the message.
        if (this.icons[style]) {
          output = this.icons[style] + ' ' + output;
        }

        // Apply the style to the message.
        output = output[style];
      }

      // Log the message.
      console.log(output);
    }
  }]);

  return Log;
}();

var log$1 = new Log();

var configDisplayCommand = {
  command: 'config display',
  describe: 'parse and display project settings',
  builder: {},
  handler: function handler() {
    log$1.message(Project$1.config);
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

var isTest = isEqual('node-test');
var isDev = isEqual('develop');
var isProd = isEqual('production');

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
    key: 'getBasePath',


    /**
     * Gets base path to a specific type of file.
     *
     * @param  {String} [type = 'project'] [description]
     * @return {String}
     */
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
      var pathKey = camelCase(type);
      var base = basePaths[pathKey];

      if (!base) {
        return '';
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

      var pathKey = camelCase(type);
      var assetsPath = assetsPaths[pathKey];

      if (!assetsPath) {
        return '';
      }

      return path.join(this.getBasePath(type), assetsPath);
    }

    /**
     * Sets initial values required for other class methods.
     * Also creates the project folder if it doesn't exist.
     */

  }, {
    key: 'init',
    value: function () {
      var _ref = _asyncToGenerator(_regeneratorRuntime.mark(function _callee() {
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this.templateData = this.config;

                if (!isTest(this.config.env)) {
                  _context.next = 4;
                  break;
                }

                _context.next = 4;
                return fs$1.remove(this.paths.project);

              case 4:
                _context.next = 6;
                return fs$1.mkdirp(this.paths.project);

              case 6:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function init() {
        return _ref.apply(this, arguments);
      }

      return init;
    }()

    /**
     * Creates a new project.
     *
     * @return {Boolean}
     */

  }, {
    key: 'createProject',
    value: function () {
      var _ref2 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee2() {
        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (this.config.project.title) {
                  _context2.next = 4;
                  break;
                }

                log$1.error('You must specify a project title.');
                log$1.info('Check the README for usage information.');

                return _context2.abrupt('return', false);

              case 4:
                _context2.next = 6;
                return this.initProjectFiles();

              case 6:
                _context2.next = 8;
                return this.initRepo();

              case 8:
                _context2.next = 10;
                return this.initProject();

              case 10:
                _context2.next = 12;
                return this.initPlugin();

              case 12:
                _context2.next = 14;
                return this.initTheme();

              case 14:
                return _context2.abrupt('return', true);

              case 15:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function createProject() {
        return _ref2.apply(this, arguments);
      }

      return createProject;
    }()

    /**
     * Creates project files.
     */

  }, {
    key: 'initProjectFiles',
    value: function () {
      var _ref3 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee3() {
        return _regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this.maybeCopyPluginZips();

              case 2:
                _context3.next = 4;
                return this.parseTemplateData();

              case 4:
                _context3.next = 6;
                return this.scaffoldFiles('scripts');

              case 6:
                if (!this.config.vvv) {
                  _context3.next = 9;
                  break;
                }

                _context3.next = 9;
                return this.scaffoldFiles('vvv');

              case 9:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function initProjectFiles() {
        return _ref3.apply(this, arguments);
      }

      return initProjectFiles;
    }()

    /**
     * Copies plugin ZIP files.
     */

  }, {
    key: 'maybeCopyPluginZips',
    value: function () {
      var _ref4 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee4() {
        var dirExists, source, dest;
        return _regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return fs$1.directoryExists(this.paths.plugins);

              case 2:
                dirExists = _context4.sent;

                if (dirExists) {
                  _context4.next = 5;
                  break;
                }

                return _context4.abrupt('return');

              case 5:

                log$1.message('Copying plugin ZIPs...');

                source = this.paths.plugins;
                dest = path.join(this.paths.project, 'project-files/plugin-zips');
                _context4.next = 10;
                return fs$1.copy(source, dest);

              case 10:

                log$1.ok('Plugin ZIPs copied.');

              case 11:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function maybeCopyPluginZips() {
        return _ref4.apply(this, arguments);
      }

      return maybeCopyPluginZips;
    }()

    /**
     * Parses template data from project config.
     */

  }, {
    key: 'parseTemplateData',
    value: function () {
      var _ref5 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee5() {
        var pluginZipsDir, files, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, file, name;

        return _regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                pluginZipsDir = path.join(this.paths.project, 'project-files/plugin-zips');


                if (!this.templateData.pluginZips) {
                  this.templateData.pluginZips = [];
                }

                _context5.next = 4;
                return fs$1.readDir(pluginZipsDir);

              case 4:
                files = _context5.sent;
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                _context5.prev = 8;


                for (_iterator = _getIterator(files); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                  file = _step.value;
                  name = path.basename(file, '.zip');


                  this.templateData.pluginZips.push({ name: name, file: file });
                }
                _context5.next = 16;
                break;

              case 12:
                _context5.prev = 12;
                _context5.t0 = _context5['catch'](8);
                _didIteratorError = true;
                _iteratorError = _context5.t0;

              case 16:
                _context5.prev = 16;
                _context5.prev = 17;

                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }

              case 19:
                _context5.prev = 19;

                if (!_didIteratorError) {
                  _context5.next = 22;
                  break;
                }

                throw _iteratorError;

              case 22:
                return _context5.finish(19);

              case 23:
                return _context5.finish(16);

              case 24:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this, [[8, 12, 16, 24], [17,, 19, 23]]);
      }));

      function parseTemplateData() {
        return _ref5.apply(this, arguments);
      }

      return parseTemplateData;
    }()

    /**
     * Initializes the Git repo if enabled in project config.
     *
     * @return {Boolean}
     */

  }, {
    key: 'initRepo',
    value: function () {
      var _ref6 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee6() {
        var dirPath, dirExists, gitInitResult, command, remoteAddResult;
        return _regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                if (this.config.repo.create) {
                  _context6.next = 2;
                  break;
                }

                return _context6.abrupt('return', false);

              case 2:

                log$1.message('Checking for Git repo...');

                dirPath = path.join(this.paths.project, '.git');
                _context6.next = 6;
                return fs$1.directoryExists(dirPath);

              case 6:
                dirExists = _context6.sent;

                if (!dirExists) {
                  _context6.next = 10;
                  break;
                }

                log$1.ok('Repo exists.');

                return _context6.abrupt('return', false);

              case 10:
                _context6.next = 12;
                return this.exec('git init', 'project');

              case 12:
                gitInitResult = _context6.sent;


                if (gitInitResult) {
                  log$1.ok('Repo initialized.');
                }

                // If the repo URL is set, add it as a remote.

                if (!this.config.repo.url) {
                  _context6.next = 20;
                  break;
                }

                command = 'git remote add origin ' + this.config.repo.url;
                _context6.next = 18;
                return this.exec(command, 'project');

              case 18:
                remoteAddResult = _context6.sent;


                if (remoteAddResult) {
                  log$1.ok('Remote URL added.');
                }

              case 20:
                return _context6.abrupt('return', true);

              case 21:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function initRepo() {
        return _ref6.apply(this, arguments);
      }

      return initRepo;
    }()

    /**
     * Creates project files and install project dependencies.
     *
     * @return {Boolean}
     */

  }, {
    key: 'initProject',
    value: function () {
      var _ref7 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee7() {
        var dirPath, dirExists, command, createProjectResult, installResult;
        return _regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                log$1.message('Checking for Bedrock...');

                dirPath = path.join(this.paths.project, 'htdocs');
                _context7.next = 4;
                return fs$1.directoryExists(dirPath);

              case 4:
                dirExists = _context7.sent;

                if (!dirExists) {
                  _context7.next = 8;
                  break;
                }

                log$1.ok('Bedrock exists');

                return _context7.abrupt('return', false);

              case 8:

                // Install Bedrock.
                command = 'composer create-project roots/bedrock htdocs --no-install';
                _context7.next = 11;
                return this.exec(command, 'project');

              case 11:
                createProjectResult = _context7.sent;


                if (createProjectResult) {
                  log$1.ok('Bedrock installed.');
                }

                _context7.next = 15;
                return this.linkFiles('project');

              case 15:
                _context7.next = 17;
                return this.scaffoldFiles('project');

              case 17:
                _context7.next = 19;
                return this.scaffoldFiles('bedrock');

              case 19:
                _context7.next = 21;
                return this.removeFiles('bedrock');

              case 21:

                log$1.message('Installing project dependencies...');

                _context7.next = 24;
                return this.exec('composer install', 'project');

              case 24:
                installResult = _context7.sent;


                if (installResult) {
                  log$1.ok('Dependencies installed.');
                }

                return _context7.abrupt('return', true);

              case 27:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function initProject() {
        return _ref7.apply(this, arguments);
      }

      return initProject;
    }()

    /**
     * Creates plugin files.
     *
     * @return {Boolean}
     */

  }, {
    key: 'initPlugin',
    value: function () {
      var _ref8 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee8() {
        var basePath, dirExists;
        return _regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                if (this.config.plugin.scaffold) {
                  _context8.next = 2;
                  break;
                }

                return _context8.abrupt('return', false);

              case 2:
                if (this.config.plugin.name) {
                  _context8.next = 5;
                  break;
                }

                log$1.error('You must specify a plugin name.' + ' Check the README for usage information.');

                return _context8.abrupt('return', false);

              case 5:

                log$1.message('Checking for plugin...');

                basePath = this.getBasePath('plugin');
                _context8.next = 9;
                return fs$1.directoryExists(basePath);

              case 9:
                dirExists = _context8.sent;

                if (!dirExists) {
                  _context8.next = 13;
                  break;
                }

                log$1.ok('Plugin exists.');

                return _context8.abrupt('return', false);

              case 13:
                _context8.next = 15;
                return this.scaffoldFiles('plugin');

              case 15:
                _context8.next = 17;
                return this.createPlaceholders('plugin');

              case 17:

                log$1.ok('Plugin created.');

                return _context8.abrupt('return', true);

              case 19:
              case 'end':
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function initPlugin() {
        return _ref8.apply(this, arguments);
      }

      return initPlugin;
    }()

    /**
     * Creates plugin unit tests.
     */

  }, {
    key: 'createPluginTests',
    value: function createPluginTests() {
      log$1.error('This feature is not ready');
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
    value: function () {
      var _ref9 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee9() {
        var errorMessage, basePath, dirExists;
        return _regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                if (this.config.theme.scaffold) {
                  _context9.next = 2;
                  break;
                }

                return _context9.abrupt('return', false);

              case 2:
                if (this.config.theme.name) {
                  _context9.next = 6;
                  break;
                }

                errorMessage = 'You must specify a theme name.' + ' Check the README for usage information.';


                log$1.error(errorMessage);

                return _context9.abrupt('return', false);

              case 6:

                log$1.message('Checking for child theme...');

                basePath = this.getBasePath('theme');
                _context9.next = 10;
                return fs$1.directoryExists(basePath);

              case 10:
                dirExists = _context9.sent;

                if (!dirExists) {
                  _context9.next = 14;
                  break;
                }

                log$1.ok('Child theme exists.');

                return _context9.abrupt('return', true);

              case 14:
                _context9.next = 16;
                return this.scaffoldFiles('theme');

              case 16:
                _context9.next = 18;
                return this.createPlaceholders('theme');

              case 18:
                _context9.next = 20;
                return this.copyAssets('theme');

              case 20:

                log$1.ok('Theme created.');

                log$1.message('Installing theme dependencies...');

                _context9.next = 24;
                return this.exec('npm install', 'theme');

              case 24:
                _context9.next = 26;
                return this.exec('bower install', 'theme');

              case 26:

                log$1.message('Compiling theme assets...');

                _context9.next = 29;
                return this.exec('npm run build', 'theme');

              case 29:

                log$1.ok('Done');

                return _context9.abrupt('return', true);

              case 31:
              case 'end':
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function initTheme() {
        return _ref9.apply(this, arguments);
      }

      return initTheme;
    }()

    /**
     * Creates theme unit tests.
     */

  }, {
    key: 'createThemeTests',
    value: function () {
      var _ref10 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee10() {
        return _regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                log$1.error('This feature is not ready');

                return _context10.abrupt('return', false);

              case 2:
              case 'end':
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function createThemeTests() {
        return _ref10.apply(this, arguments);
      }

      return createThemeTests;
    }()

    /**
     * Executes a command.
     *
     * @param  {String}   command The command.
     * @param  {String}   [type = 'project'] Type to use for the base path.
     * @return {Boolean}
     */

  }, {
    key: 'exec',
    value: function () {
      var _ref11 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee11(command) {
        var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'project';
        var options;
        return _regeneratorRuntime.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                options = {
                  cwd: this.getBasePath(type)
                };
                return _context11.abrupt('return', cp.exec(command, options).catch(handleError));

              case 2:
              case 'end':
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function exec(_x3) {
        return _ref11.apply(this, arguments);
      }

      return exec;
    }()

    /**
     * Creates placeholder files and folders.
     *
     * @param  {String} [type = 'theme'] [description]
     */

  }, {
    key: 'createPlaceholders',
    value: function () {
      var _ref12 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee12() {
        var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'theme';

        var base, dirs, files, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, dir, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, file;

        return _regeneratorRuntime.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                base = this.getBasePath(type);
                dirs = ['includes', 'assets/source/css', 'assets/source/js', 'assets/source/images', 'assets/source/fonts', 'assets/dist/css', 'assets/dist/js', 'assets/dist/images', 'assets/dist/fonts'];
                files = ['assets/dist/css/.gitkeep', 'assets/dist/js/.gitkeep', 'assets/dist/images/.gitkeep', 'assets/dist/fonts/.gitkeep'];
                _iteratorNormalCompletion2 = true;
                _didIteratorError2 = false;
                _iteratorError2 = undefined;
                _context12.prev = 6;
                _iterator2 = _getIterator(dirs);

              case 8:
                if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                  _context12.next = 21;
                  break;
                }

                dir = _step2.value;
                _context12.prev = 10;
                _context12.next = 13;
                return fs$1.mkdirp(path.join(base, dir));

              case 13:
                _context12.next = 18;
                break;

              case 15:
                _context12.prev = 15;
                _context12.t0 = _context12['catch'](10);

                log$1.error(_context12.t0);

              case 18:
                _iteratorNormalCompletion2 = true;
                _context12.next = 8;
                break;

              case 21:
                _context12.next = 27;
                break;

              case 23:
                _context12.prev = 23;
                _context12.t1 = _context12['catch'](6);
                _didIteratorError2 = true;
                _iteratorError2 = _context12.t1;

              case 27:
                _context12.prev = 27;
                _context12.prev = 28;

                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                  _iterator2.return();
                }

              case 30:
                _context12.prev = 30;

                if (!_didIteratorError2) {
                  _context12.next = 33;
                  break;
                }

                throw _iteratorError2;

              case 33:
                return _context12.finish(30);

              case 34:
                return _context12.finish(27);

              case 35:
                _iteratorNormalCompletion3 = true;
                _didIteratorError3 = false;
                _iteratorError3 = undefined;
                _context12.prev = 38;
                _iterator3 = _getIterator(files);

              case 40:
                if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
                  _context12.next = 52;
                  break;
                }

                file = _step3.value;
                _context12.prev = 42;
                _context12.next = 45;
                return fs$1.ensureFile(path.join(base, file));

              case 45:
                _context12.next = 49;
                break;

              case 47:
                _context12.prev = 47;
                _context12.t2 = _context12['catch'](42);

              case 49:
                _iteratorNormalCompletion3 = true;
                _context12.next = 40;
                break;

              case 52:
                _context12.next = 58;
                break;

              case 54:
                _context12.prev = 54;
                _context12.t3 = _context12['catch'](38);
                _didIteratorError3 = true;
                _iteratorError3 = _context12.t3;

              case 58:
                _context12.prev = 58;
                _context12.prev = 59;

                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                  _iterator3.return();
                }

              case 61:
                _context12.prev = 61;

                if (!_didIteratorError3) {
                  _context12.next = 64;
                  break;
                }

                throw _iteratorError3;

              case 64:
                return _context12.finish(61);

              case 65:
                return _context12.finish(58);

              case 66:
              case 'end':
                return _context12.stop();
            }
          }
        }, _callee12, this, [[6, 23, 27, 35], [10, 15], [28,, 30, 34], [38, 54, 58, 66], [42, 47], [59,, 61, 65]]);
      }));

      function createPlaceholders() {
        return _ref12.apply(this, arguments);
      }

      return createPlaceholders;
    }()

    /**
     * Copy an included set of plugin or theme assets.
     *
     * @param  {String} [type = 'theme'] [description]
     * @param  {String} [dir  = '']      [description]
     * @return {Boolean}
     */

  }, {
    key: 'copyAssets',
    value: function () {
      var _ref13 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee13() {
        var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'theme';
        var dir = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
        var source, dest, dirExists, assetName;
        return _regeneratorRuntime.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                source = path.join(this.paths.assets, type, dir);
                dest = path.join(this.getAssetsPath(type), dir);
                _context13.next = 4;
                return fs$1.directoryExists(source);

              case 4:
                dirExists = _context13.sent;

                if (dirExists) {
                  _context13.next = 8;
                  break;
                }

                log$1.error(source + ' is not a valid assets folder.');

                return _context13.abrupt('return', false);

              case 8:
                _context13.prev = 8;
                _context13.next = 11;
                return fs$1.mkdirp(dest);

              case 11:
                _context13.next = 13;
                return fs$1.copy(source, dest);

              case 13:
                assetName = startCase(type);


                log$1.ok(assetName + ' assets created.');
                _context13.next = 20;
                break;

              case 17:
                _context13.prev = 17;
                _context13.t0 = _context13['catch'](8);

                if (!isEmpty$1(_context13.t0)) {
                  log$1.error(_context13.t0);
                }

              case 20:
                return _context13.abrupt('return', true);

              case 21:
              case 'end':
                return _context13.stop();
            }
          }
        }, _callee13, this, [[8, 17]]);
      }));

      function copyAssets() {
        return _ref13.apply(this, arguments);
      }

      return copyAssets;
    }()

    /**
     * Creates symlinks to a set of files.
     *
     * @param  {String} type = 'project' [description]
     */

  }, {
    key: 'linkFiles',
    value: function () {
      var _ref14 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee14() {
        var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'project';

        var base, files, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, _step4$value, source, dest, destBase, symlinkExists;

        return _regeneratorRuntime.wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                base = this.getBasePath(type);
                files = this.files[type].link;

                if (files) {
                  _context14.next = 4;
                  break;
                }

                return _context14.abrupt('return');

              case 4:
                _iteratorNormalCompletion4 = true;
                _didIteratorError4 = false;
                _iteratorError4 = undefined;
                _context14.prev = 7;
                _iterator4 = _getIterator(files);

              case 9:
                if (_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done) {
                  _context14.next = 34;
                  break;
                }

                _step4$value = _slicedToArray(_step4.value, 2), source = _step4$value[0], dest = _step4$value[1];
                destBase = path.join(dest, path.basename(source));


                source = path.join(base, source);
                dest = path.join(base, destBase);

                log$1.message('Checking for ' + destBase + '...');

                _context14.next = 17;
                return fs$1.symlinkExists(dest);

              case 17:
                symlinkExists = _context14.sent;

                if (!symlinkExists) {
                  _context14.next = 22;
                  break;
                }

                log$1.ok(dest + ' exists.');
                _context14.next = 31;
                break;

              case 22:
                _context14.prev = 22;
                _context14.next = 25;
                return fs$1.ensureSymlink(dest, source);

              case 25:
                log$1.ok(dest + ' created.');
                _context14.next = 31;
                break;

              case 28:
                _context14.prev = 28;
                _context14.t0 = _context14['catch'](22);

                if (!isEmpty$1(_context14.t0)) {
                  log$1.error(_context14.t0);
                }

              case 31:
                _iteratorNormalCompletion4 = true;
                _context14.next = 9;
                break;

              case 34:
                _context14.next = 40;
                break;

              case 36:
                _context14.prev = 36;
                _context14.t1 = _context14['catch'](7);
                _didIteratorError4 = true;
                _iteratorError4 = _context14.t1;

              case 40:
                _context14.prev = 40;
                _context14.prev = 41;

                if (!_iteratorNormalCompletion4 && _iterator4.return) {
                  _iterator4.return();
                }

              case 43:
                _context14.prev = 43;

                if (!_didIteratorError4) {
                  _context14.next = 46;
                  break;
                }

                throw _iteratorError4;

              case 46:
                return _context14.finish(43);

              case 47:
                return _context14.finish(40);

              case 48:
              case 'end':
                return _context14.stop();
            }
          }
        }, _callee14, this, [[7, 36, 40, 48], [22, 28], [41,, 43, 47]]);
      }));

      function linkFiles() {
        return _ref14.apply(this, arguments);
      }

      return linkFiles;
    }()

    /**
     * Removes a set of files.
     *
     * @param  {String} type = 'project' [description]
     */

  }, {
    key: 'removeFiles',
    value: function () {
      var _ref15 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee15() {
        var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'project';

        var base, files, _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5, file;

        return _regeneratorRuntime.wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                base = this.getBasePath(type);
                files = this.files[type].remove;

                if (files) {
                  _context15.next = 4;
                  break;
                }

                return _context15.abrupt('return');

              case 4:
                _iteratorNormalCompletion5 = true;
                _didIteratorError5 = false;
                _iteratorError5 = undefined;
                _context15.prev = 7;
                _iterator5 = _getIterator(files);

              case 9:
                if (_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done) {
                  _context15.next = 23;
                  break;
                }

                file = _step5.value;

                file = path.join(base, file);

                _context15.prev = 12;
                _context15.next = 15;
                return fs$1.remove(file);

              case 15:
                _context15.next = 20;
                break;

              case 17:
                _context15.prev = 17;
                _context15.t0 = _context15['catch'](12);

                if (!isEmpty$1(_context15.t0)) {
                  log$1.error(_context15.t0);
                }

              case 20:
                _iteratorNormalCompletion5 = true;
                _context15.next = 9;
                break;

              case 23:
                _context15.next = 29;
                break;

              case 25:
                _context15.prev = 25;
                _context15.t1 = _context15['catch'](7);
                _didIteratorError5 = true;
                _iteratorError5 = _context15.t1;

              case 29:
                _context15.prev = 29;
                _context15.prev = 30;

                if (!_iteratorNormalCompletion5 && _iterator5.return) {
                  _iterator5.return();
                }

              case 32:
                _context15.prev = 32;

                if (!_didIteratorError5) {
                  _context15.next = 35;
                  break;
                }

                throw _iteratorError5;

              case 35:
                return _context15.finish(32);

              case 36:
                return _context15.finish(29);

              case 37:
              case 'end':
                return _context15.stop();
            }
          }
        }, _callee15, this, [[7, 25, 29, 37], [12, 17], [30,, 32, 36]]);
      }));

      function removeFiles() {
        return _ref15.apply(this, arguments);
      }

      return removeFiles;
    }()

    /**
     * Renders a set of template files using the template data.
     *
     * @param  {String} type =             'project' [description]
     * @return {Boolean}      [description]
     */

  }, {
    key: 'scaffoldFiles',
    value: function () {
      var _ref16 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee16() {
        var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'project';

        var source, dirExists, dirs, _iteratorNormalCompletion6, _didIteratorError6, _iteratorError6, _iterator6, _step6, file;

        return _regeneratorRuntime.wrap(function _callee16$(_context16) {
          while (1) {
            switch (_context16.prev = _context16.next) {
              case 0:
                source = path.join(this.paths.templates, type);
                _context16.next = 3;
                return fs$1.directoryExists(source);

              case 3:
                dirExists = _context16.sent;

                if (dirExists) {
                  _context16.next = 7;
                  break;
                }

                log$1.error(source + ' is not a valid template directory');

                return _context16.abrupt('return', false);

              case 7:
                _context16.next = 9;
                return fs$1.readDir(source);

              case 9:
                dirs = _context16.sent;

                if (isEmpty$1(dirs)) {
                  _context16.next = 37;
                  break;
                }

                _iteratorNormalCompletion6 = true;
                _didIteratorError6 = false;
                _iteratorError6 = undefined;
                _context16.prev = 14;
                _iterator6 = _getIterator(dirs);

              case 16:
                if (_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done) {
                  _context16.next = 23;
                  break;
                }

                file = _step6.value;
                _context16.next = 20;
                return this.scaffoldFile(path.join(source, file), type);

              case 20:
                _iteratorNormalCompletion6 = true;
                _context16.next = 16;
                break;

              case 23:
                _context16.next = 29;
                break;

              case 25:
                _context16.prev = 25;
                _context16.t0 = _context16['catch'](14);
                _didIteratorError6 = true;
                _iteratorError6 = _context16.t0;

              case 29:
                _context16.prev = 29;
                _context16.prev = 30;

                if (!_iteratorNormalCompletion6 && _iterator6.return) {
                  _iterator6.return();
                }

              case 32:
                _context16.prev = 32;

                if (!_didIteratorError6) {
                  _context16.next = 35;
                  break;
                }

                throw _iteratorError6;

              case 35:
                return _context16.finish(32);

              case 36:
                return _context16.finish(29);

              case 37:
                return _context16.abrupt('return', true);

              case 38:
              case 'end':
                return _context16.stop();
            }
          }
        }, _callee16, this, [[14, 25, 29, 37], [30,, 32, 36]]);
      }));

      function scaffoldFiles() {
        return _ref16.apply(this, arguments);
      }

      return scaffoldFiles;
    }()

    /**
     * Renders a specific template file.
     *
     * @param  {String} source [description]
     * @param  {String} type   = 'project' [description]
     * @return {Boolean}        [description]
     */

  }, {
    key: 'scaffoldFile',
    value: function () {
      var _ref17 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee17(source) {
        var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'project';
        var file, base, dest, fileExists, templateContent, renderedContent;
        return _regeneratorRuntime.wrap(function _callee17$(_context17) {
          while (1) {
            switch (_context17.prev = _context17.next) {
              case 0:
                file = path.basename(source, '.mustache');

                // Templates for hidden files start with `_` instead of `.`

                if (file.startsWith('_')) {
                  file = file.replace('_', '.');
                }

                log$1.message('Checking for ' + file + '...');

                base = this.getBasePath(type);
                dest = path.join(base, file);
                _context17.next = 7;
                return fs$1.fileExists(dest);

              case 7:
                fileExists = _context17.sent;

                if (!fileExists) {
                  _context17.next = 11;
                  break;
                }

                log$1.ok(file + ' exists.');

                return _context17.abrupt('return', true);

              case 11:
                _context17.next = 13;
                return fs$1.mkdirp(base);

              case 13:
                _context17.prev = 13;
                _context17.next = 16;
                return fs$1.readFile(source).toString();

              case 16:
                templateContent = _context17.sent;
                renderedContent = mustache.render(templateContent, this.templateData);
                _context17.next = 20;
                return fs$1.writeFile(dest, renderedContent);

              case 20:

                log$1.ok(file + ' created.');
                _context17.next = 28;
                break;

              case 23:
                _context17.prev = 23;
                _context17.t0 = _context17['catch'](13);

                if (isEmpty$1(_context17.t0)) {
                  _context17.next = 28;
                  break;
                }

                log$1.error(_context17.t0);

                return _context17.abrupt('return', false);

              case 28:
                return _context17.abrupt('return', true);

              case 29:
              case 'end':
                return _context17.stop();
            }
          }
        }, _callee17, this, [[13, 23]]);
      }));

      function scaffoldFile(_x11) {
        return _ref17.apply(this, arguments);
      }

      return scaffoldFile;
    }()
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
    log$1.error('This feature is not ready');
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
