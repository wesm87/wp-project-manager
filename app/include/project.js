/**
 * @module
 */

import fs from 'fs-extra';
import path from 'path';
import yargs from 'yargs';
import upsearch from 'utils-upsearch';
import {
  isEmpty,
  has,
  merge,
  pickBy,
  defaultsDeep,
  startCase,
  snakeCase,
  kebabCase,
} from 'lodash';

import { mock } from 'mocktail';

import helpers from './helpers';

const upperSnakeCase = string => (
  startCase(string).replace(/ /g, '_')
);

/**
 * The number of characters to use when generating a database prefix.
 *
 * @type {Number}
 */
const DB_PREFIX_LENGTH = 8;

/**
 * The number of characters to use when generating a secret key.
 *
 * @type {Number}
 */
const SECRET_KEY_LENGTH = 64;

/**
 * The number of characters to use when generating a secret salt.
 *
 * @type {Number}
 */
const SECRET_SALT_LENGTH = 64;

/**
 * Project config settings and helper methods.
 */
class Project {

  /**
   * Gets project paths.
   *
   * @since 0.3.0
   *
   * @return {Object}
   */
  static get paths() {
    if (!this._paths) {
      const rootPath = path.join(__dirname, '..');

      this._paths = {
        root: rootPath,
        cwd: process.cwd(),
        project: process.cwd(),
        assets: path.join(rootPath, 'project-files', 'assets'),
        templates: path.join(rootPath, 'project-files', 'templates'),
        plugins: path.join(rootPath, 'project-files', 'plugin-zips'),
        test: path.join(rootPath, 'test'),
        config: upsearch.sync('project.yml'),
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
  static get config() {
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
  static set config(config) {
    this._config = this.parseConfig(config);
  }

  /**
   * Gets default config settings.
   *
   * @since 0.1.0
   *
   * @return {Object}
   */
  static get defaultConfig() {
    return {
      vvv: true,
      debug: false,
      token: '',
      author: {
        name: 'Your Name',
        email: 'your-email@example.com',
        website: 'http://your-website.example.com',
      },
      project: {
        multisite: false,
        title: '',
        slug: '',
        url: '',
      },
      repo: {
        create: false,
        url: '',
      },
      plugin: {
        scaffold: true,
        name: '',
        slug: '',
        description: '',
      },
      theme: {
        scaffold: true,
        name: '',
        slug: '',
        description: '',
      },
      admin: {
        user: 'admin',
        pass: 'admin_password',
        email: 'admin@localhost.dev',
      },
      db: {
        name: '',
        user: 'external',
        pass: 'external',
        host: 'vvv.dev:3306',
        root_user: 'root',
        root_pass: 'root',
        prefix: '',
      },
      secret: {
        auth_key: '',
        auth_salt: '',
        secure_auth_key: '',
        secure_auth_salt: '',
        logged_in_key: '',
        logged_in_salt: '',
        nonce_key: '',
        nonce_salt: '',
      },
    };
  }

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
  static loadConfig(file = null) {
    let config;

    // Try to load the config file if one was passed and it exists.
    if (file && helpers.fileExists(file)) {
      config = helpers.loadYAML(file);
    }

    // If we don't have a config object (or the config object is empty)
    // fall back to the default config file.
    if (isEmpty(config) && helpers.fileExists(this.paths.config)) {
      config = helpers.loadYAML(this.paths.config);
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
  static parseConfig(config) {
    let parsed = config;

    // Merge config with defaults.
    parsed = pickBy(
      defaultsDeep(config, this.defaultConfig),
      (value, key) => has(this.defaultConfig, key),
    );

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
    parsed.plugin.namespace = `${parsed.plugin.namespace}\\Plugin`;

    parsed.theme.id = snakeCase(parsed.theme.name);
    parsed.theme.class = upperSnakeCase(parsed.theme.name);
    parsed.theme.namespace = parsed.project.namespace || parsed.theme.class;
    parsed.theme.namespace = `${parsed.theme.namespace}\\Theme`;

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
  static ensureProjectConfig(config) {
    const parsed = config;

    if (!parsed.project.title && parsed.project.slug) {
      parsed.project.title = startCase(parsed.project.slug);
    }

    if (!parsed.project.slug && parsed.project.title) {
      parsed.project.slug = kebabCase(parsed.project.title);
    }

    if (!parsed.project.url) {
      parsed.project.url = `${parsed.project.slug}.dev`;
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
  static ensurePluginConfig(config) {
    const parsed = config;

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
  static ensureThemeConfig(config) {
    const parsed = config;

    if (!parsed.theme.name) {
      if (parsed.theme.slug) {
        parsed.theme.name = startCase(parsed.theme.slug);
      } else {
        parsed.theme.name = parsed.project.title;
      }
    }

    if (!parsed.theme.slug) {
      parsed.theme.slug = (parsed.theme.name);
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
  static ensureDatabaseConfig(config) {
    const parsed = config;

    if (!parsed.db.name) {
      parsed.db.name = parsed.project.slug;
    }

    if (!parsed.db.prefix) {
      parsed.db.prefix = `${helpers.randomString(DB_PREFIX_LENGTH)}_`;
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
  static ensureSecretConfig(config) {
    const parsed = config;
    const types = ['auth', 'secure_auth', 'logged_in', 'nonce'];

    for (const type of types) {
      if (!parsed.secret[`${type}_key`]) {
        parsed.secret[`${type}_key`] = helpers.randomString(
          SECRET_KEY_LENGTH,
          'base64',
        );
      }
      if (!parsed.secret[`${type}_salt`]) {
        parsed.secret[`${type}_salt`] = helpers.randomString(
          SECRET_SALT_LENGTH,
          'base64',
        );
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
  static createConfigFile(force = false) {
    if (force && helpers.fileExists(this.paths.config)) {
      fs.removeSync(this.paths.config);
    }

    if (!helpers.fileExists(this.paths.config)) {
      helpers.writeYAML(this.paths.config, this.defaultConfig);
    }
  }
}

export default mock(Project);
