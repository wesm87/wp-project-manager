/**
 * Filesystem helper methods, plus everything from the `fs-extra` module (which
 * itself includes everything from the core `fs` module). All the `fs-extra`
 * methods have been modified to return a Promise so `async/await` can be used.
 *
 * @module
 */

import fs from 'fs-extra'
import YAML from 'js-yaml'

import {
  partialRight,
  constant,
  complement,
  startsWith,
  stubFalse,
  stubArray,
} from 'lodash/fp'


/**
 * Checks whether the specified file is a hidden file.
 *
 * @param  {String} file The file name to check.
 * @return {Boolean}     True if the file name begins with a dot;
 *                       false if not.
 */
export const isHiddenFile = complement(startsWith('.'))

/**
 * Checks if the specified file or directory exists.
 *
 * @since 0.1.0
 * @since 0.2.0  Added 'symlink' type.
 * @since 0.7.17 Moved to `FSHelpers` class; now returns a Promise.
 * @since 0.8.0  Moved to `utils/fs.js`
 *
 * @param  {String} path The path to check.
 * @param  {String} type Optional. A type to check the path against.
 * @return {Promise}     Resolves to true if path exists and matches `type`;
 *                       false if not.
 */
export async function pathExists(path, type = 'any') {
  const handleSuccess = (info) => {
    switch (type) {
      case 'file': {
        return info.isFile()
      }
      case 'folder':
      case 'directory': {
        return info.isDirectory()
      }
      case 'link':
      case 'symlink': {
        return info.isSymbolicLink()
      }
      default: {
        return Boolean(info)
      }
    }
  }

  return fs
    .lstat(path)
    .then(handleSuccess)
    .catch(stubFalse)
}

/**
 * Checks if the specified file exists.
 *
 * @since 0.1.0
 * @since 0.7.17 Moved to `FSHelpers` class; now returns a Promise.
 * @since 0.8.0  Moved to `utils/fs.js`
 *
 * @param  {String} path The path to the file to check.
 * @return {Boolean}     Resolves to true if file exists; false if not.
 */
export const fileExists = partialRight(pathExists, ['file'])

/**
 * Checks if the specified directory exists.
 *
 * @since 0.1.0
 * @since 0.7.17 Moved to `FSHelpers` class; now returns a Promise.
 * @since 0.8.0  Moved to `utils/fs.js`
 *
 * @param  {String} path The path to the directory to check.
 * @return {Promise}     Resolves to true if directory exists; false if not.
 */
export const directoryExists = partialRight(pathExists, ['directory'])

/**
 * Alias for `directoryExists`.
 *
 * @since 0.7.17
 * @since 0.8.0  Moved to `utils/fs.js`
 *
 * @param  {String} path The path to the directory to check.
 * @return {Promise}     Resolves to true if directory exists; false if not.
 */
export const dirExists = directoryExists

/**
 * Checks if the specified symbolic link exists.
 *
 * @since 0.2.0
 * @since 0.7.17 Moved to `FSHelpers` class; now returns a Promise.
 * @since 0.8.0  Moved to `utils/fs.js`
 *
 * @param  {String} path The path to the link to check.
 * @return {Promise}     Resolves to true if link exists; false if not.
 */
export const symlinkExists = partialRight(pathExists, ['symlink'])

/**
 * Takes a directory path and returns Promise that resolves to an array,
 * which contains the contents of the directory.
 *
 * @since 0.4.0
 * @since 0.7.17 Moved to `FSHelpers` class; now returns a Promise.
 * @since 0.8.0  Moved to `utils/fs.js`
 *
 * @param  {String}  dir                   The directory path.
 * @param  {Boolean} [includeHidden=false] If true, include hidden files.
 * @return {Promise}                       Resolves to an array of the
 *                                         directory's contents.
 */
export async function readDir(dir, includeHidden = false) {
  const handleSuccess = (files) => {
    if (!includeHidden) {
      return files.filter(isHiddenFile)
    }

    return files
  }

  const handleError = stubArray

  return fs
    .readdir(dir)
    .then(handleSuccess)
    .catch(handleError)
}

/**
 * Tries to load a YAML config file and parse it into JSON.
 *
 * @since 0.1.0
 * @since 0.7.17 Moved to `FSHelpers` class; now returns a Promise.
 * @since 0.8.0  Moved to `utils/fs.js`
 *
 * @param  {String} filePath The path to the YAML file.
 * @return {Promise}          Resolves to the parsed results on success;
 *                            an empty object on failure.
 */
export async function loadYAML(filePath) {
  const defaultValue = {}

  const handleSuccess = (contents) => {
    const json = YAML.safeLoad(contents)

    return json || defaultValue
  }

  const handleError = constant(defaultValue)

  return fs
    .readFile(filePath, 'utf8')
    .then(handleSuccess)
    .catch(handleError)
}

/**
 * Takes a JSON string or object, parses it into YAML, and writes to a file.
 *
 * @since 0.3.0
 * @since 0.7.17 Moved to `FSHelpers` class; now returns a Promise.
 * @since 0.8.0  Moved to `utils/fs.js`
 *
 * @param  {String} filePath The path to the file to write to.
 * @param  {Object} json     The JSON object to parse into YAML.
 * @return {Promise}         Resolves to true on success; false on failure.
 */
export async function writeYAML(filePath, json) {
  const yaml = YAML.safeDump(json, { noCompatMode: true })

  return fs.writeFile(filePath, yaml)
}
