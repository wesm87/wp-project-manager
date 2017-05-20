
import crypto from 'mz/crypto';

import {
  compose,
  truncate,
  toString,
  stubString,
} from 'lodash/fp';


/**
 * Ratios used when converting numbers from one format to another.
 *
 * @since 0.7.7
 *
 * @type {Object}
 */
const RATIOS = {
  BYTES_TO_HEX: 0.5,
  BYTES_TO_BASE64: 0.75,
};


/**
 * Generates a random string in hexadecimal format.
 *
 * @since 0.1.0
 *
 * @param  {Number} strLen         The number of characters to include in the string.
 * @param  {String} [format='hex'] The string format to use (hex, base64, etc).
 * @return {String}                The randomly generated string.
 */
export function randomString(strLen, format = 'hex') {
  let numBytes;

  // Adjust number of bytes based on desired string format.
  if (format === 'hex') {
    numBytes = Math.ceil(strLen * RATIOS.BYTES_TO_HEX);
  } else if (format === 'base64') {
    numBytes = Math.ceil(strLen * RATIOS.BYTES_TO_BASE64);
  }

  const sliceString = truncate({
    length: strLen,
    ommission: '',
  });

  const formatString = compose(sliceString, toString);

  // log.error(reason) -> stubString() -> ''
  const handleError = compose(stubString, log.error);

  return crypto
    .randomBytes(numBytes)
    .then(formatString)
    .catch(handleError);
}
