/**
 * @module
 */

import fs from 'fs-extra';
import YAML from 'js-yaml';
import thenifyAll from 'thenify-all';

import {
  partialRight,
  constant,
  complement,
  values,
  startsWith,
  isFunction,
  stubFalse,
  stubArray,
} from 'lodash/fp';

import { mock } from 'mocktail';

/**
 * Filesystem helper methods, plus everything from the `fs-extra` module (which
 * itself includes everything from the core `fs` module). All the `fs-extra`
 * methods have been modified to return a Promise so `async/await` can be used.
 */
class FSHelpers {

  /**
   * Takes an object and copies any methods it has into this class.
   *
   * @since 0.7.17
   *
   * @param {Object} source The source object.
   */
  static _inheritMethods(source) {
    const methods = values(source).filter(isFunction);

    for (const method of methods) {
      this[method] = source[method].bind(this);
    }
  }

  /**
   * Checks whether the specified file is a hidden file.
   *
   * @param  {String} file The file name to check.
   * @return {Boolean}     True if the file name begins with a dot;
   *                       false if not.
   */
  static isHiddenFile = complement(startsWith('.'))

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
  static pathExists(path, type = 'any') {
    return this
      .lstat(path)
      .then(function handleSuccess(info) {
        switch ( type ) {
          case 'file' : {
            return info.isFile();
          }
          case 'folder' :
          case 'directory' : {
            return info.isDirectory();
          }
          case 'link':
          case 'symlink': {
            return info.isSymbolicLink();
          }
          default: {
            return Boolean(info);
          }
        }
      })
      .catch(stubFalse);
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
  static fileExists = partialRight(this.pathExists, ['file'])

  /**
   * Checks if the specified directory exists.
   *
   * @since 0.1.0
   * @since 0.7.17 Moved to `FSHelpers` class; now returns a Promise.
   *
   * @param  {String} path The path to the directory to check.
   * @return {Promise}     Resolves to true if directory exists; false if not.
   */
  static directoryExists = partialRight(this.pathExists, ['directory'])

  /**
   * Alias for `directoryExists`.
   *
   * @since 0.7.17
   *
   * @param  {String} path The path to the directory to check.
   * @return {Promise}     Resolves to true if directory exists; false if not.
   */
  static dirExists = this.directoryExists

  /**
   * Checks if the specified symbolic link exists.
   *
   * @since 0.2.0
   * @since 0.7.17 Moved to `FSHelpers` class; now returns a Promise.
   *
   * @param  {String} path The path to the link to check.
   * @return {Promise}     Resolves to true if link exists; false if not.
   */
  static symlinkExists = partialRight(this.pathExists, ['symlink'])

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
  static readDir(dir, includeHidden = false) {
    return this
      .readdir(dir)
      .then(function handleSuccess(files) {
        if (!includeHidden) {
          return files.filter(this.isHiddenFile);
        }

        return files;
      })
      .catch(stubArray);
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
  static loadYAML(filePath) {
    const defaultValue = {};

    return this
      .readFile(filePath, 'utf8')
      .then(function handleSuccess(contents) {
        const json = YAML.safeLoad(contents);

        return json || defaultValue;
      })
      .catch(constant(defaultValue));
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
  static writeYAML(filePath, json) {
    const yaml = YAML.safeDump(json, { noCompatMode: true });

    return this.writeFile(filePath, yaml);
  }

}

FSHelpers._inheritMethods(thenifyAll(fs));

export default mock(FSHelpers);
