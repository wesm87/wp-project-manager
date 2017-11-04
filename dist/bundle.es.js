import commander from 'commander';
import { mock } from 'mocktail';

function _AwaitValue(value) {
  this.wrapped = value;
}

function _AsyncGenerator(gen) {
  var front, back;

  function send(key, arg) {
    return new Promise(function (resolve, reject) {
      var request = {
        key: key,
        arg: arg,
        resolve: resolve,
        reject: reject,
        next: null
      };

      if (back) {
        back = back.next = request;
      } else {
        front = back = request;
        resume(key, arg);
      }
    });
  }

  function resume(key, arg) {
    try {
      var result = gen[key](arg);
      var value = result.value;
      var wrappedAwait = value instanceof _AwaitValue;
      Promise.resolve(wrappedAwait ? value.wrapped : value).then(function (arg) {
        if (wrappedAwait) {
          resume("next", arg);
          return;
        }

        settle(result.done ? "return" : "normal", arg);
      }, function (err) {
        resume("throw", err);
      });
    } catch (err) {
      settle("throw", err);
    }
  }

  function settle(type, value) {
    switch (type) {
      case "return":
        front.resolve({
          value: value,
          done: true
        });
        break;

      case "throw":
        front.reject(value);
        break;

      default:
        front.resolve({
          value: value,
          done: false
        });
        break;
    }

    front = front.next;

    if (front) {
      resume(front.key, front.arg);
    } else {
      back = null;
    }
  }

  this._invoke = send;

  if (typeof gen.return !== "function") {
    this.return = undefined;
  }
}

if (typeof Symbol === "function" && Symbol.asyncIterator) {
  _AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
    return this;
  };
}

_AsyncGenerator.prototype.next = function (arg) {
  return this._invoke("next", arg);
};

_AsyncGenerator.prototype.throw = function (arg) {
  return this._invoke("throw", arg);
};

_AsyncGenerator.prototype.return = function (arg) {
  return this._invoke("return", arg);
};

/**
 * @module
 */
/**
 * Manages dependencies (npm / Bower / Composer).
 */

let Deps = class Deps {};
var deps = mock(Deps);

/**
 * @TODO Allow type values to collect for more fine-grained control over which
 * dependencies are installed (e.g. --type=npm --type=composer).
 */

var depsInstall = (commander$$1 => {
  commander$$1.command('deps install').option('--type [type]', 'Which dependencies to install', /^(all|npm|bower|composer)$/i, 'all').description('install project, theme, and plugin dependencies').action(options => {
    deps.install(options.type);
  });
});

const VERSION = '0.8.0'; // import configDisplay from './commands/config.display'
// import configCreate from './commands/config.create'

// import pluginCreateTests from './commands/plugin.create-tests'
// import themeCreate from './commands/theme.create'
// import themeCreateTests from './commands/theme.create-tests'
// import projectCreate from './commands/project.create'
// import wpInstall from './commands/wp.install'

const commandFactories = [// configDisplay,
// configCreate,
depsInstall];

const invokeCommandFactory = commandFactory => {
  commandFactory(commander);
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


commander.version(VERSION);
commandFactories.forEach(invokeCommandFactory);
commander.parse(process.argv);
