/**
 * @module
 */

import path from 'path'
import cp from 'child_process'

import fs from 'fs-extra'
import mustache from 'mustache'
import stripNL from 'strip-newlines'

import {
  getOr,
  camelCase,
  startCase,
  isEmpty,
} from 'lodash/fp'

import { mock } from 'mocktail'

import log from './log'
import Project from './project'

import { isTest } from './utils/env'

import {
  readDir,
  fileExists,
  symlinkExists,
  directoryExists,
} from './utils/fs'

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
    }
  }

  /**
   * Gets base path to a specific file.
   *
   * @param  {String} [context = 'project'] [description]
   * @return {String}
   */
  static getBasePath(context = 'project') {
    const { paths, config } = this
    const { plugin, theme } = config

    const basePaths = {
      project: '.',
      vvv: 'vvv',
      scripts: 'scripts',
      bedrock: 'htdocs',
      wordpress: 'htdocs/web/wp',
      plugin: path.join('htdocs/web/app/plugins/', plugin.slug),
      theme: path.join('htdocs/web/app/themes/', theme.slug),
    }

    // We convert the context to camel case so we don't run into issues if we
    // want to use a value like `context-name` or `context_name`.
    const pathKey = camelCase(context)
    const base = basePaths[pathKey]

    if (!base) {
      return ''
    }

    return path.join(paths.project, base)
  }

  /**
   * Gets path to plugin or theme assets.
   *
   * @param  {String} [context = 'theme']
   * @return {String}
   */
  static getAssetsPath(context = 'theme') {
    const assetsPaths = {
      plugin: 'assets/source',
      theme: 'assets/source',
    }

    const pathKey = camelCase(context)
    const assetsPath = assetsPaths[pathKey]

    if (!assetsPath) {
      return ''
    }

    return path.join(this.getBasePath(context), assetsPath)
  }

  /**
   * Sets initial values required for other class methods.
   * Also creates the project folder if it doesn't exist.
   */
  static async init() {
    this.config = await this.config
    this.templateData = this.config

    const { paths, config } = this

    if (isTest(config.env)) {
      await fs.remove(paths.project)
    }

    await fs.mkdirp(paths.project)

    return true
  }

  /**
   * Creates a new project.
   *
   * @return {Boolean}
   */
  static async createProject() {
    const { project } = this.config

    if (!project || !project.title) {
      log.error('You must specify a project title.')
      log.info('Check the README for usage information.')

      return false
    }

    await this.initProjectFiles()
    await this.initRepo()
    await this.initProject()
    await this.initPlugin()
    await this.initTheme()

    return true
  }

  /**
   * Creates project files.
   */
  static async initProjectFiles() {
    const { config } = this

    await this.maybeCopyPluginZips()
    await this.parseTemplateData()

    await this.scaffoldFiles('scripts')

    if (config.vvv) {
      await this.scaffoldFiles('vvv')
    }
  }

  /**
   * Copies plugin ZIP files.
   */
  static async maybeCopyPluginZips() {
    const { paths } = this

    const dirExists = await directoryExists(paths.plugins)

    if (!dirExists) {
      return
    }

    log.message('Copying plugin ZIPs...')

    const source = paths.plugins
    const dest = path.join(paths.project, 'project-files/plugin-zips')

    await fs.copy(source, dest)

    log.ok('Plugin ZIPs copied.')
  }

  /**
   * Parses template data from project config.
   */
  static async parseTemplateData() {
    const { paths, templateData } = this

    const pluginZipsDir = path.join(paths.project, 'project-files/plugin-zips')

    if (!templateData.pluginZips) {
      templateData.pluginZips = []
    }

    const files = await readDir(pluginZipsDir)

    for (const file of files) {
      const name = path.basename(file, '.zip')

      templateData.pluginZips.push({ name, file })
    }
  }

  /**
   * Initializes the Git repo if enabled in project config.
   *
   * @return {Boolean}
   */
  static async initRepo() {
    const { config, paths } = this

    if (!config.repo.create) {
      return false
    }

    log.message('Checking for Git repo...')

    const dirPath = path.join(paths.project, '.git')
    const dirExists = await directoryExists(dirPath)

    if (dirExists) {
      log.ok('Repo exists.')

      return false
    }

    // Initialize repo.
    const gitInitResult = await this.exec('git init', 'project')

    if (gitInitResult) {
      log.ok('Repo initialized.')
    }

    // If the repo URL is set, add it as a remote.
    if (config.repo.url) {
      const command = `git remote add origin ${config.repo.url}`
      const remoteAddResult = await this.exec(command, 'project')

      if (remoteAddResult) {
        log.ok('Remote URL added.')
      }
    }

    return true
  }

  /**
   * Creates project files and install project dependencies.
   *
   * @return {Boolean}
   */
  static async initProject() {
    const { paths } = this

    log.message('Checking for Bedrock...')

    const dirPath = path.join(paths.project, 'htdocs')
    const dirExists = await directoryExists(dirPath)

    if (dirExists) {
      log.ok('Bedrock exists')

      return false
    }

    // Install Bedrock.
    const command = 'composer create-project roots/bedrock htdocs --no-install'
    const createProjectResult = await this.exec(command, 'project')

    if (createProjectResult) {
      log.ok('Bedrock installed.')
    }

    await this.linkFiles('project')
    await this.scaffoldFiles('project')
    await this.scaffoldFiles('bedrock')
    await this.removeFiles('bedrock')

    log.message('Installing project dependencies...')

    const installResult = await this.exec('composer install', 'project')

    if (installResult) {
      log.ok('Dependencies installed.')
    }

    return true
  }

  /**
   * Creates plugin files.
   *
   * @return {Boolean}
   */
  static async initPlugin() {
    const { config } = this

    if (!config.plugin.scaffold) {
      return false
    }

    if (!config.plugin.name) {
      log.error(stripNL`
        You must specify a plugin name.
        Check the README for usage information.
      `)

      return false
    }

    log.message('Checking for plugin...')

    const basePath = this.getBasePath('plugin')

    const dirExists = await directoryExists(basePath)

    if (dirExists) {
      log.ok('Plugin exists.')

      return false
    }

    await this.scaffoldFiles('plugin')
    await this.createPlaceholders('plugin')

    log.ok('Plugin created.')

    return true
  }

  /**
   * Creates plugin unit tests.
   */
  static createPluginTests() {
    log.error('This feature is not ready')
  }

  /**
   * Creates a child theme.
   *
   * @since 0.1.0
   *
   * @return {Boolean} False if theme exists,
   */
  static async initTheme() {
    const { config } = this

    if (!config.theme.scaffold) {
      return false
    }

    if (!config.theme.name) {
      const errorMessage = stripNL`
        You must specify a theme name.
        Check the README for usage information.
      `

      log.error(errorMessage)

      return false
    }

    log.message('Checking for child theme...')

    const basePath = this.getBasePath('theme')

    const dirExists = await directoryExists(basePath)

    if (dirExists) {
      log.ok('Child theme exists.')

      return true
    }

    await this.scaffoldFiles('theme')
    await this.createPlaceholders('theme')
    await this.copyAssets('theme')

    log.ok('Theme created.')

    log.message('Installing theme dependencies...')

    await this.exec('npm install', 'theme')
    await this.exec('bower install', 'theme')

    log.message('Compiling theme assets...')

    await this.exec('npm run build', 'theme')

    log.ok('Done')

    return true
  }

  /**
   * Creates theme unit tests.
   */
  static async createThemeTests() {
    log.error('This feature is not ready')

    return false
  }

  /**
   * Executes a command.
   *
   * @param  {String}   command The command.
   * @param  {String}   [context = 'project'] Context to use when determining the base path.
   * @return {Boolean}
   */
  static async exec(command, context = 'project') {
    const options = {
      cwd: this.getBasePath(context),
    }

    return cp.exec(command, options)
  }

  /**
   * Creates placeholder files and folders.
   *
   * @param  {String} [context = 'theme'] [description]
   */
  static async createPlaceholders(context = 'theme') {
    const base = this.getBasePath(context)

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
    ]

    const files = [
      'assets/dist/css/.gitkeep',
      'assets/dist/js/.gitkeep',
      'assets/dist/images/.gitkeep',
      'assets/dist/fonts/.gitkeep',
    ]

    const createDirectory = async (dir) => fs.mkdirp(path.join(base, dir))

    try {
      await Promise.all(dirs.map(createDirectory))
    } catch (error) {
      if (!isEmpty(error)) {
        log.error(error)
      }
    }

    const createFile = async (file) => fs.ensureFile(path.join(base, file))

    try {
      await Promise.all(files.map(createFile))
    } catch (error) {
      // Do nothing.
    }
  }

  /**
   * Copy an included set of plugin or theme assets.
   *
   * @param  {String} [context = 'theme'] [description]
   * @param  {String} [dir  = '']      [description]
   * @return {Boolean}
   */
  static async copyAssets(context = 'theme', dir = '') {
    const { paths } = this

    const source = path.join(paths.assets, context, dir)
    const dest = path.join(this.getAssetsPath(context), dir)

    const dirExists = await directoryExists(source)

    if (!dirExists) {
      log.error(`${source} is not a valid assets folder.`)

      return false
    }

    try {
      await fs.mkdirp(dest)
      await fs.copy(source, dest)

      const assetName = startCase(context)

      log.ok(`${assetName} assets created.`)
    } catch (error) {
      if (!isEmpty(error)) {
        log.error(error)

        return false
      }
    }

    return true
  }

  /**
   * Creates symlinks to a set of files.
   *
   * @param {String} context = 'project' [description]
   */
  static async linkFiles(context = 'project') {
    const base = this.getBasePath(context)
    const files = getOr('', [context, 'link'], this.files)

    if (!files) {
      return
    }

    for (let [source, dest] of files) {
      const destBase = path.join(dest, path.basename(source))

      source = path.join(base, source)
      dest = path.join(base, destBase)

      log.message(`Checking for ${destBase}...`)

      // eslint-disable-next-line no-await-in-loop
      const linkExists = await symlinkExists(dest)

      if (linkExists) {
        log.ok(`${dest} exists.`)
      } else {
        try {
          // eslint-disable-next-line no-await-in-loop
          await fs.ensureSymlink(dest, source)
          log.ok(`${dest} created.`)
        } catch (error) {
          if (!isEmpty(error)) {
            log.error(error)
          }
        }
      }
    }
  }

  /**
   * Removes a set of files.
   *
   * @param {String} context = 'project' [description]
   */
  static async removeFiles(context = 'project') {
    const base = this.getBasePath(context)
    const files = this.files[context].remove

    if (!files) {
      return
    }

    const removeFile = (file) => fs.remove(path.join(base, file))

    try {
      await Promise.all(files.map(removeFile))
    } catch (error) {
      if (!isEmpty(error)) {
        log.error(error)
      }
    }
  }

  /**
   * Renders a set of template files using the template data.
   *
   * @param  {String} context = 'project'
   * @return {Boolean}
   */
  static async scaffoldFiles(context = 'project') {
    const { paths } = this

    const source = path.join(paths.templates, context)

    const dirExists = await directoryExists(source)

    if (!dirExists) {
      log.error(`${source} is not a valid template directory`)

      return false
    }

    const files = await readDir(source)
    const createFile = (file) => this.scaffoldFile(path.join(source, file), context)

    if (!isEmpty(files)) {
      try {
        await files.map(createFile)
      } catch (error) {
        if (!isEmpty(error)) {
          log.error(error)

          return false
        }
      }
    }

    return true
  }

  /**
   * Renders a specific template file.
   *
   * @param  {String} source [description]
   * @param  {String} context = 'project' [description]
   * @return {Boolean}        [description]
   */
  static async scaffoldFile(source, context = 'project') {
    let file = path.basename(source, '.mustache')

    // Templates for hidden files start with `_` instead of `.`
    if (file.startsWith('_')) {
      file = file.replace('_', '.')
    }

    log.message(`Checking for ${file}...`)

    const base = this.getBasePath(context)
    const dest = path.join(base, file)

    const templateFileExists = await fileExists(dest)

    if (templateFileExists) {
      log.ok(`${file} exists.`)

      return true
    }

    await fs.mkdirp(base)

    const { templateData } = this

    try {
      const fileBuffer = await fs.readFile(source)
      const templateContent = fileBuffer.toString()
      const renderedContent = mustache.render(templateContent, templateData)

      await fs.writeFile(dest, renderedContent)

      log.ok(`${file} created.`)
    } catch (error) {
      if (!isEmpty(error)) {
        log.error(error)

        return false
      }
    }

    return true
  }
}

export default mock(Scaffold)
