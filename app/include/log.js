/**
 * @module
 */

import { isEmpty, isObjectLike, keys } from 'lodash';
import colors from 'colors';

// import { mock } from 'mocktail';

import project from './project';

/**
 * The number of spaces to use for a tab when formatting JSON strings.
 */
const JSON_TAB_WIDTH = 2;


/**
 * Logger class. Contains various methods (debug, info, ok, warn, error, etc.)
 * that take a string or object-like value, apply an associated style, and log
 * it. Some styles also prepend an associated icon identifier to the message.
 */
class Log {

  /**
   * Message styles.
   *
   * @since 0.4.0
   *
   * @member {Object}
   */
  get styles() {
    return {
      ok: ['green'],
      info: ['cyan'],
      warn: ['yellow', 'underline'],
      error: ['red', 'underline'],
      debug: ['cyan', 'underline'],
      message: ['reset'],
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
  get icons() {
    if (process.platform === 'win32') {
      return {
        ok: '√',
        info: 'i',
        warn: '‼',
        error: '×',
        debug: '*',
      };
    }

    return {
      ok: '✔',
      info: 'ℹ',
      warn: '⚠',
      error: '✘',
      debug: '✱',
    };
  }

  /**
   * Class constructor.
   *
   * @since 0.4.0
   */
  constructor() {
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
  init() {
    // Set the colors theme based on our styles.
    colors.setTheme(this.styles);

    // Automatically create methods for each style.
    for (const style of keys(this.styles)) {
      this[style] = message => this._log(message, style);
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
  _log(message, style) {
    let output = message;

    // Convert object-like messages to string.
    if (isObjectLike(output)) {
      output = JSON.stringify(output, null, JSON_TAB_WIDTH);
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
      if (style === 'debug' && !project.debug) {
        return;
      }

      // If the style has an associated icon, prepend it to the message.
      if (this.icons[style]) {
        output = `${this.icons[style]} ${output}`;
      }

      // Apply the style to the message.
      output = output[style];
    }

    // Log the message.
    console.log(output);
  }
}

export default new Log();
