/**
 * Filesystem helper methods, plus everything from the `fs-extra` module (which
 * itself includes everything from the core `fs` module). All the `fs-extra`
 * methods have been modified to return a Promise so `async/await` can be used.
 *
 * @module
 */

import fs from 'fs-extra';
import YAML from 'js-yaml';
import { startsWith, reject } from 'lodash/fp';

/**
 * Checks whether the specified file is a hidden file.
 *
 * @param  {String} file The file name to check.
 * @return {Boolean}     True if the file name begins with a dot;
 *                       false if not.
 */
export const isHiddenFile = startsWith('.');

/**
 * Checks if the specified file or directory of the specified type exists.
 *
 * @since 0.9.0
 */
export const pathOfTypeExists = (type: string) => async (path: string) => {
  try {
    const info = await fs.lstat(path);

    switch (type) {
      case 'file': {
        return info.isFile();
      }
      case 'folder':
      case 'directory': {
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
  } catch (_unused) {
    return false;
  }
};

/**
 * Checks if the specified file or directory exists.
 *
 * @since 0.1.0
 * @since 0.2.0  Added 'symlink' type.
 * @since 0.7.17 Moved to `FSHelpers` class; now returns a Promise.
 * @since 0.8.0  Moved to `utils/fs.js`
 */
export const pathExists = pathOfTypeExists('');

/**
 * Checks if the specified file exists.
 *
 * @since 0.1.0
 * @since 0.7.17 Moved to `FSHelpers` class; now returns a Promise.
 * @since 0.8.0  Moved to `utils/fs.js`
 */
export const fileExists = pathOfTypeExists('file');

/**
 * Checks if the specified directory exists.
 *
 * @since 0.1.0
 * @since 0.7.17 Moved to `FSHelpers` class; now returns a Promise.
 * @since 0.8.0  Moved to `utils/fs.js`
 */
export const directoryExists = pathOfTypeExists('directory');

/**
 * Alias for `directoryExists`.
 *
 * @since 0.7.17
 * @since 0.8.0  Moved to `utils/fs.js`
 */
export const dirExists = directoryExists;

/**
 * Checks if the specified symbolic link exists.
 *
 * @since 0.2.0
 * @since 0.7.17 Moved to `FSHelpers` class; now returns a Promise.
 * @since 0.8.0  Moved to `utils/fs.js`
 */
export const symlinkExists = pathOfTypeExists('symlink');

/**
 * Takes a directory path and returns Promise that resolves to an array,
 * which contains the contents of the directory.
 *
 * @since 0.4.0
 * @since 0.7.17 Moved to `FSHelpers` class; now returns a Promise.
 * @since 0.8.0  Moved to `utils/fs.js`
 */
export const readDir = async (
  dir: string,
  includeHidden: boolean = false,
): Promise<any[]> => {
  try {
    const files = await fs.readdir(dir);

    if (!includeHidden) {
      return reject(isHiddenFile, files);
    }

    return files;
  } catch (_unused) {
    return [];
  }
};

/**
 * Tries to load a YAML config file and parse it into JSON.
 *
 * @since 0.1.0
 * @since 0.7.17 Moved to `FSHelpers` class; now returns a Promise.
 * @since 0.8.0  Moved to `utils/fs.js`
 */
export const loadYAML = async (filePath: string): Promise<object> => {
  const defaultValue = {};

  try {
    const contents = await fs.readFile(filePath, 'utf8');
    const json = YAML.safeLoad(contents);

    return json || defaultValue;
  } catch (_unused) {
    return defaultValue;
  }
};

/**
 * Takes a JSON string or object, parses it into YAML, and writes to a file.
 *
 * @since 0.3.0
 * @since 0.7.17 Moved to `FSHelpers` class; now returns a Promise.
 * @since 0.8.0  Moved to `utils/fs.js`
 */
export const writeYAML = async (
  filePath: string,
  json: object,
): Promise<void> => {
  const yaml = YAML.safeDump(json, { noCompatMode: true });

  return fs.writeFile(filePath, yaml);
};
