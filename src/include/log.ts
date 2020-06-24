/**
 * @module
 *
 * Logger utils. Contains various methods (debug, info, ok, warn, error, etc.)
 * that take a string or object-like value, apply an associated style, and log
 * it. Some styles also prepend an associated icon identifier to the message.
 *
 * @since 0.4.0
 * @since 0.8.0 Switched from `colors` to `chalk`.
 */

import chalk from 'chalk';
import { identity, propOr, keys, isEmpty } from 'ramda';
import { isObjectLike } from 'lodash/fp';

import { getConfig } from './project';

/**
 * The number of spaces to use for a tab when formatting JSON strings.
 */
const JSON_TAB_WIDTH = 2;

/**
 * Message styles.
 */
const STYLES = {
  ok: chalk.green,
  info: chalk.cyan,
  warn: chalk.yellow.underline,
  error: chalk.red.underline,
  debug: chalk.cyan.underline,
  message: chalk.reset,
};

type Logger = {
  ok: chalk.Chalk;
  info: chalk.Chalk;
  warn: chalk.Chalk;
  error: chalk.Chalk;
  debug: chalk.Chalk;
  message: chalk.Chalk;
};

/**
 * Message icons. Includes plain-text fallbacks for Windows, since the CMD
 * prompt supports a very limited character set.
 *
 * @since 0.4.0
 *
 * @see https://github.com/sindresorhus/log-symbols
 */
const getIcons = () => {
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
};

/**
 * Creates a function to log a styled message.
 *
 * If message is an object, array, function, class, etc. it is converted to
 * a string using `JSON.stringify()`.
 *
 * @since 0.4.0
 */
const createLogWithStyle = (style: string) => async (message: any) => {
  const config = await getConfig();

  // Bail if the style is 'debug' and debugging is disabled.
  if (style === 'debug' && !config.debug) {
    return;
  }

  // Don't log anything if message is empty.
  if (isEmpty(message)) {
    return;
  }

  const icon = propOr('', style, getIcons());
  const applyStyle = propOr(identity, style, STYLES) as chalk.Chalk;

  let output = message;

  // Convert object-like messages to string.
  if (isObjectLike(output)) {
    output = JSON.stringify(output, null, JSON_TAB_WIDTH);
  }

  // Make sure the message is a string.
  output = String(output);

  // If the style has an associated icon, prepend it to the message.
  if (icon) {
    output = `${icon} ${output}`;
  }

  // Apply the style to the message.
  output = applyStyle(output);

  // Log the message.
  console.log(output);
};

const createLogger = () =>
  keys(STYLES).reduce(
    (acc, style) => ({
      ...acc,
      [style]: createLogWithStyle(style),
    }),
    {},
  ) as Logger;

export default createLogger();
