/**
 * @module
 */

import path from 'path';

import fs from 'fs-extra';
import cp from 'mz/child_process';
import mustache from 'mustache';

import {
  camelCase,
  startCase,
  isEmpty,
} from 'lodash/fp';

import { mock } from 'mocktail';

import log from './log';
import Project from './project';

import { isTest } from './utils/env';

import {
  readDir,
  fileExists,
  symlinkExists,
  directoryExists,
} from './utils/fs';

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
class Scaffold extends Project {

  /**
   * Project files that need to be symlinked, removed, or any other special
   * type of action that we can't determine automatically based on template
   * files or project configuration.
   *
   * @return {Object}
   */
  static get files() {
    return {
      bedrock: {
        remove: new Set([
          'composer.*',
          '*.md',
          'phpcs.xml',
          'wp-cli.yml',
          '.gitignore',
          '.travis.yml',
          '.env.example',
          '.editorconfig',
        ]),
      },
    };
  }

  /**
   * Gets base path to a specific type of file.
   *
   * @param  {String} [type = 'project'] [description]
   * @return {String}
   */
  static getBasePath(type = 'project') {
    const basePaths = {
      project: '.',
      vvv: 'vvv',
      scripts: 'scripts',
      bedrock: 'htdocs',
      wordpress: 'htdocs/web/wp',
      plugin: path.join('htdocs/web/app/plugins/', this.config.plugin.slug),
      theme: path.join('htdocs/web/app/themes/', this.config.theme.slug),
    };

    // We convert the type to camel case so we don't run into issues if we
    // want to use a type like `type-name` or `type_name`.
    const pathKey = camelCase(type);
    const base = basePaths[pathKey];

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
  static getAssetsPath(type = 'theme') {
    const assetsPaths = {
      plugin: 'assets/source',
      theme: 'assets/source',
    };

    const pathKey = camelCase(type);
    const assetsPath = assetsPaths[pathKey];

    if (!assetsPath) {
      return '';
    }

    return path.join(this.getBasePath(type), assetsPath);
  }

  /**
   * Sets initial values required for other class methods.
   * Also creates the project folder if it doesn't exist.
   */
  static async init() {
    this.templateData = this.config;

    if (isTest(this.config.env)) {
      await fs.remove(this.paths.project);
    }

    await fs.mkdirp(this.paths.project);
  }

  /**
   * Creates a new project.
   *
   * @return {Boolean}
   */
  static async createProject() {
    if (!this.config.project.title) {
      log.error('You must specify a project title.');
      log.info('Check the README for usage information.');

      return false;
    }

    await this.initProjectFiles();
    await this.initRepo();
    await this.initProject();
    await this.initPlugin();
    await this.initTheme();

    return true;
  }

  /**
   * Creates project files.
   */
  static async initProjectFiles() {
    await this.maybeCopyPluginZips();
    await this.parseTemplateData();

    await this.scaffoldFiles('scripts');

    if (this.config.vvv) {
      await this.scaffoldFiles('vvv');
    }
  }

  /**
   * Copies plugin ZIP files.
   */
  static async maybeCopyPluginZips() {
    const dirExists = await directoryExists(this.paths.plugins);

    if (!dirExists) {
      return;
    }

    log.message('Copying plugin ZIPs...');

    const source = this.paths.plugins;
    const dest = path.join(this.paths.project, 'project-files/plugin-zips');

    await fs.copy(source, dest);

    log.ok('Plugin ZIPs copied.');
  }

  /**
   * Parses template data from project config.
   */
  static async parseTemplateData() {
    const pluginZipsDir = path.join(this.paths.project, 'project-files/plugin-zips');

    if (!this.templateData.pluginZips) {
      this.templateData.pluginZips = [];
    }

    const files = await readDir(pluginZipsDir);

    for (const file of files) {
      const name = path.basename(file, '.zip');

      this.templateData.pluginZips.push({ name, file });
    }
  }

  /**
   * Initializes the Git repo if enabled in project config.
   *
   * @return {Boolean}
   */
  static async initRepo() {
    if (!this.config.repo.create) {
      return false;
    }

    log.message('Checking for Git repo...');

    const dirPath = path.join(this.paths.project, '.git');
    const dirExists = await fs.directoryExists(dirPath);

    if (dirExists) {
      log.ok('Repo exists.');

      return false;
    }

    // Initialize repo.
    const gitInitResult = await this.exec('git init', 'project');

    if (gitInitResult) {
      log.ok('Repo initialized.');
    }

    // If the repo URL is set, add it as a remote.
    if (this.config.repo.url) {
      const command = `git remote add origin ${this.config.repo.url}`;
      const remoteAddResult = await this.exec(command, 'project');

      if (remoteAddResult) {
        log.ok('Remote URL added.');
      }
    }

    return true;
  }

  /**
   * Creates project files and install project dependencies.
   *
   * @return {Boolean}
   */
  static async initProject() {
    log.message('Checking for Bedrock...');

    const dirPath = path.join(this.paths.project, 'htdocs');
    const dirExists = await fs.directoryExists(dirPath);

    if (dirExists) {
      log.ok('Bedrock exists');

      return false;
    }

    // Install Bedrock.
    const command = 'composer create-project roots/bedrock htdocs --no-install';
    const createProjectResult = await this.exec(command, 'project');

    if (createProjectResult) {
      log.ok('Bedrock installed.');
    }

    await this.linkFiles('project');
    await this.scaffoldFiles('project');
    await this.scaffoldFiles('bedrock');
    await this.removeFiles('bedrock');

    log.message('Installing project dependencies...');

    const installResult = await this.exec('composer install', 'project');

    if (installResult) {
      log.ok('Dependencies installed.');
    }

    return true;
  }

  /**
   * Creates plugin files.
   *
   * @return {Boolean}
   */
  static async initPlugin() {
    if (!this.config.plugin.scaffold) {
      return false;
    }

    if (!this.config.plugin.name) {
      log.error(
        'You must specify a plugin name.'
        + ' Check the README for usage information.',
      );

      return false;
    }

    log.message('Checking for plugin...');

    const basePath = this.getBasePath('plugin');

    const dirExists = await fs.directoryExists(basePath);

    if (dirExists) {
      log.ok('Plugin exists.');

      return false;
    }

    await this.scaffoldFiles('plugin');
    await this.createPlaceholders('plugin');

    log.ok('Plugin created.');

    return true;
  }

  /**
   * Creates plugin unit tests.
   */
  static createPluginTests() {
    log.error('This feature is not ready');
  }

  /**
   * Creates a child theme.
   *
   * @since 0.1.0
   *
   * @return {Boolean} False if theme exists,
   */
  static async initTheme() {
    if (!this.config.theme.scaffold) {
      return false;
    }

    if (!this.config.theme.name) {
      const errorMessage = 'You must specify a theme name.'
        + ' Check the README for usage information.';

      log.error(errorMessage);

      return false;
    }

    log.message('Checking for child theme...');

    const basePath = this.getBasePath('theme');

    const dirExists = await fs.directoryExists(basePath);

    if (dirExists) {
      log.ok('Child theme exists.');

      return true;
    }

    await this.scaffoldFiles('theme');
    await this.createPlaceholders('theme');
    await this.copyAssets('theme');

    log.ok('Theme created.');

    log.message('Installing theme dependencies...');

    await this.exec('npm install', 'theme');
    await this.exec('bower install', 'theme');

    log.message('Compiling theme assets...');

    await this.exec('npm run build', 'theme');

    log.ok('Done');

    return true;
  }

  /**
   * Creates theme unit tests.
   */
  static async createThemeTests() {
    log.error('This feature is not ready');

    return false;
  }

  /**
   * Executes a command.
   *
   * @param  {String}   command The command.
   * @param  {String}   [type = 'project'] Type to use for the base path.
   * @return {Boolean}
   */
  static async exec(command, type = 'project') {
    const options = {
      cwd: this.getBasePath(type),
    };

    return cp.exec(command, options);
  }

  /**
   * Creates placeholder files and folders.
   *
   * @param  {String} [type = 'theme'] [description]
   */
  static async createPlaceholders(type = 'theme') {
    const base = this.getBasePath(type);

    const dirs = [
      'includes',
      'assets/source/css',
      'assets/source/js',
      'assets/source/images',
      'assets/source/fonts',
      'assets/dist/css',
      'assets/dist/js',
      'assets/dist/images',
      'assets/dist/fonts',
    ];

    const files = [
      'assets/dist/css/.gitkeep',
      'assets/dist/js/.gitkeep',
      'assets/dist/images/.gitkeep',
      'assets/dist/fonts/.gitkeep',
    ];

    for (const dir of dirs) {
      try {
        await fs.mkdirp(path.join(base, dir));
      } catch (error) {
        log.error(error);
      }
    }

    for (const file of files) {
      try {
        await fs.ensureFile(path.join(base, file));
      } catch (error) {
        // Do nothing.
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
  static async copyAssets(type = 'theme', dir = '') {
    const source = path.join(this.paths.assets, type, dir);
    const dest = path.join(this.getAssetsPath(type), dir);

    const dirExists = await fs.directoryExists(source);

    if (!dirExists) {
      log.error(`${source} is not a valid assets folder.`);

      return false;
    }

    try {
      await fs.mkdirp(dest);
      await fs.copy(source, dest);

      const assetName = startCase(type);

      log.ok(`${assetName} assets created.`);
    } catch (error) {
      if (!isEmpty(error)) {
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
  static async linkFiles(type = 'project') {
    const base = this.getBasePath(type);
    const files = this.files[type].link;

    if (!files) {
      return;
    }

    for (let [source, dest] of files) {
      const destBase = path.join(dest, path.basename(source));

      source = path.join(base, source);
      dest = path.join(base, destBase);

      log.message(`Checking for ${destBase}...`);

      const linkExists = await symlinkExists(dest);

      if (linkExists) {
        log.ok(`${dest} exists.`);
      } else {
        try {
          await fs.ensureSymlink(dest, source);
          log.ok(`${dest} created.`);
        } catch (error) {
          if (!isEmpty(error)) {
            log.error(error);
          }
        }
      }
    }
  }

  /**
   * Removes a set of files.
   *
   * @param  {String} type = 'project' [description]
   */
  static async removeFiles(type = 'project') {
    const base = this.getBasePath(type);
    const files = this.files[type].remove;

    if (!files) {
      return;
    }

    for (let file of files) {
      file = path.join(base, file);

      try {
        await fs.remove(file);
      } catch (error) {
        if (!isEmpty(error)) {
          log.error(error);
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
  static async scaffoldFiles(type = 'project') {
    const source = path.join(this.paths.templates, type);

    const dirExists = await fs.directoryExists(source);

    if (!dirExists) {
      log.error(`${source} is not a valid template directory`);

      return false;
    }

    const dirs = await readDir(source);

    if (!isEmpty(dirs)) {
      for (const file of dirs) {
        await this.scaffoldFile(path.join(source, file), type);
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
  static async scaffoldFile(source, type = 'project') {
    let file = path.basename(source, '.mustache');

    // Templates for hidden files start with `_` instead of `.`
    if (file.startsWith('_')) {
      file = file.replace('_', '.');
    }

    log.message(`Checking for ${file}...`);

    const base = this.getBasePath(type);
    const dest = path.join(base, file);

    const templateFileExists = await fileExists(dest);

    if (templateFileExists) {
      log.ok(`${file} exists.`);

      return true;
    }

    await fs.mkdirp(base);

    try {
      const fileBuffer = await fs.readFile(source);
      const templateContent = fileBuffer.toString();
      const renderedContent = mustache.render(templateContent, this.templateData);

      await fs.writeFile(dest, renderedContent);

      log.ok(`${file} created.`);
    } catch (error) {
      if (!isEmpty(error)) {
        log.error(error);

        return false;
      }
    }

    return true;
  }
}

export default mock(Scaffold);
