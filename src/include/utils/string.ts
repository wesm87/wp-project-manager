import crypto from 'crypto';

import log from '../log';

/**
 * Ratios used when converting numbers from one format to another.
 *
 * @since 0.7.7
 */
const RATIOS = {
  DEFAULT: 1,
  BYTES_TO_HEX: 0.5,
  BYTES_TO_BASE64: 0.75,
};

/**
 * Generates a random string in hexadecimal format.
 *
 * @since 0.1.0
 */
export function randomString(strLen: number, format: BufferEncoding = 'hex'): string {
  let ratio;

  // Adjust number of bytes based on desired string format.
  if (format === 'hex') {
    ratio = RATIOS.BYTES_TO_HEX;
  } else if (format === 'base64') {
    ratio = RATIOS.BYTES_TO_BASE64;
  } else {
    ratio = RATIOS.DEFAULT;
  }

  try {
    const numBytes = Math.ceil(strLen * ratio);

    return crypto.randomBytes(numBytes).toString(format).slice(0, strLen);
  } catch (error) {
    log.error(error);

    return '';
  }
}
