/**
 * Project config settings and helper methods.
 */

import path from 'path';

import fs from 'fs-extra';
import yargs from 'yargs';
import upsearch from 'utils-upsearch';
import { compose, keys, replace, mergeDeepRight } from 'ramda';
import {
  pick,
  merge,
  startCase,
  snakeCase,
  kebabCase,
  isEmpty,
} from 'lodash/fp';

import { randomString } from './utils/string';

import { fileExists, loadYAML, writeYAML } from './utils/fs';

const upperSnakeCase = compose(replace(/ /g, '_'), startCase);

/**
 * The number of characters to use when generating a database prefix.
 */
const DB_PREFIX_LENGTH = 8;

/**
 * The number of characters to use when generating a secret key.
 */
const SECRET_KEY_LENGTH = 64;

/**
 * The number of characters to use when generating a secret salt.
 */
const SECRET_SALT_LENGTH = 64;

type PluginZipConfig = {
  name: string;
  file: string;
};

type ProjectConfig = {
  env: string;
  vvv: boolean;
  debug: boolean;
  token: string;
  pluginZips: PluginZipConfig[];
  author: {
    name: string;
    email: string;
    website: string;
  };
  project: {
    multisite: boolean;
    title: string;
    slug: string;
    url: string;
    folder: string;
    namespace: string;
  };
  repo: {
    create: boolean;
    url: string;
  };
  plugin: {
    scaffold: boolean;
    name: string;
    slug: string;
    description: string;
    id: string;
    class: string;
    namespace: string;
  };
  theme: {
    scaffold: boolean;
    name: string;
    slug: string;
    description: string;
    id: string;
    class: string;
    namespace: string;
  };
  admin: {
    user: string;
    pass: string;
    email: string;
  };
  db: {
    name: string;
    user: string;
    pass: string;
    host: string;
    root_user: string;
    root_pass: string;
    prefix: string;
  };
  secret: {
    auth_key: string;
    auth_salt: string;
    secure_auth_key: string;
    secure_auth_salt: string;
    logged_in_key: string;
    logged_in_salt: string;
    nonce_key: string;
    nonce_salt: string;
  };
};

type ProjectPaths = {
  root: string;
  cwd: string;
  project: string;
  assets: string;
  templates: string;
  plugins: string;
  test: string;
  config: string;
};

let _config: ProjectConfig;
let _paths: ProjectPaths;

const DEFAULT_CONFIG: ProjectConfig = {
  env: 'development',
  vvv: true,
  debug: false,
  token: '',
  pluginZips: [],
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
    folder: '',
    namespace: '',
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
    id: '',
    class: '',
    namespace: '',
  },
  theme: {
    scaffold: true,
    name: '',
    slug: '',
    description: '',
    id: '',
    class: '',
    namespace: '',
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

export const getPaths = (): ProjectPaths => {
  if (_paths) {
    return _paths;
  }

  const rootPath = path.join(__dirname, '..');

  _paths = {
    root: rootPath,
    cwd: process.cwd(),
    project: process.cwd(),
    assets: path.join(rootPath, 'project-files', 'assets'),
    templates: path.join(rootPath, 'project-files', 'templates'),
    plugins: path.join(rootPath, 'project-files', 'plugin-zips'),
    test: path.join(rootPath, 'test'),
    config: upsearch.sync('project.yml'),
  };

  if (_paths.root === _paths.project) {
    _paths.project = path.join(_paths.root, '_test-project');
  }

  if (!_paths.config) {
    _paths.config = path.join(_paths.project, 'project.yml');
  }

  return _paths;
};

/**
 * Fills in any missing project settings with their default values.
 *
 * @since 0.5.0
 */
const ensureProjectConfig = (config: ProjectConfig): ProjectConfig => {
  const parsed = { ...config };

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
};

/**
 * Fills in any missing plugin settings with their default values.
 *
 * @since 0.5.0
 */
const ensurePluginConfig = (config: ProjectConfig): ProjectConfig => {
  const parsed = { ...config };

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
};

/**
 * Fills in any missing theme settings with their default values.
 *
 * @since 0.5.0
 */
const ensureThemeConfig = (config: ProjectConfig): ProjectConfig => {
  const parsed = { ...config };

  if (!parsed.theme.name) {
    if (parsed.theme.slug) {
      parsed.theme.name = startCase(parsed.theme.slug);
    } else {
      parsed.theme.name = parsed.project.title;
    }
  }

  if (!parsed.theme.slug) {
    parsed.theme.slug = kebabCase(parsed.theme.name);
  }

  return parsed;
};

/**
 * Fills in any missing database settings with their default values.
 *
 * @since 0.5.0
 */
const ensureDatabaseConfig = (config: ProjectConfig): ProjectConfig => {
  const parsed = { ...config };

  if (!parsed.db.name) {
    parsed.db.name = parsed.project.slug;
  }

  if (!parsed.db.prefix) {
    const prefix = randomString(DB_PREFIX_LENGTH);

    parsed.db.prefix = `${prefix}_`;
  }

  return parsed;
};

/**
 * Fills in any missing secret key / salts with their default values.
 *
 * @since 0.5.0
 */
const ensureSecretConfig = (config: ProjectConfig): ProjectConfig => {
  const parsed = config;
  const types = ['auth', 'secure_auth', 'logged_in', 'nonce'];

  for (const type of types) {
    if (!parsed.secret[`${type}_key`]) {
      const secretKey = randomString(SECRET_KEY_LENGTH, 'base64');

      parsed.secret[`${type}_key`] = secretKey;
    }
    if (!parsed.secret[`${type}_salt`]) {
      const secretSalt = randomString(SECRET_SALT_LENGTH, 'base64');

      parsed.secret[`${type}_salt`] = secretSalt;
    }
  }

  return parsed;
};

/**
 * Parses the project config. Missing values are filled in from the default
 * config object.
 *
 * @since 0.1.0
 */
const parseConfig = (config: ProjectConfig): ProjectConfig => {
  const paths = getPaths();

  // Merge config with defaults.
  const configKeys = keys(DEFAULT_CONFIG);
  const configWithDefaults = mergeDeepRight(DEFAULT_CONFIG, config) as ProjectConfig;

  // Filter out any invalid config values, then
  // fill in any config values that aren't set.
  const _parseConfig = compose(
    ensureSecretConfig,
    ensureDatabaseConfig,
    ensureThemeConfig,
    ensurePluginConfig,
    ensureProjectConfig,
    pick(configKeys),
  );

  const parsed = _parseConfig(configWithDefaults);

  // Set internal config values.
  parsed.project.folder = path.basename(paths.project);
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
};

/**
 * Loads and parses a YAML config file. If no file is passed, or the
 * specified file doesn't exist or is empty, the default config file path
 * is used.
 *
 * @since 0.1.0
 */
const loadConfig = async (file: string = ''): Promise<ProjectConfig> => {
  let config;

  const paths = getPaths();

  // Try to load the config file if one was passed and it exists.
  if (file) {
    const customFileExists = await fileExists(file);

    if (customFileExists) {
      config = await loadYAML(file);
    }
  }

  // If we don't have a config object (or the config object is empty)
  // fall back to the default config file.
  if (isEmpty(config)) {
    const configFileExists = await fileExists(paths.config);

    if (configFileExists) {
      config = await loadYAML(paths.config);
    }
  }

  config = (merge(config, yargs.argv) as any) as ProjectConfig;

  return parseConfig(config);
};

/**
 * Creates a new `project.yml` file with the default settings.
 *
 * @since 0.3.0
 */
export const createConfigFile = async (force: boolean = false) => {
  const paths = getPaths();

  if (force) {
    const configFileExists = await fileExists(paths.config);

    if (configFileExists) {
      await fs.remove(paths.config);
    }
  }

  const configFileExists = await fileExists(paths.config);

  if (!configFileExists) {
    await writeYAML(paths.config, DEFAULT_CONFIG);
  }
};

export const getConfig = async (): Promise<ProjectConfig> => {
  if (_config) {
    return _config;
  }

  _config = await loadConfig();

  return _config;
};
