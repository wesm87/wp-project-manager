/**
 * @module
 */

import crypto from 'mz/crypto'; // eslint-disable-line no-shadow

import { mock } from 'mocktail';

import log from './log';

/**
 * Ratios used when converting numbers from one format to another.
 *
 * @since 0.7.7
 *
 * @type {Object}
 */
const RATIOS = {
	BYTES_TO_HEX:    0.5,
	BYTES_TO_BASE64: 0.75,
};

/**
 * Helper functions.
 */
class Helpers {

	/**
	 * Generates a random string in hexadecimal format.
	 *
	 * @since 0.1.0
	 *
	 * @param  {Number} strLen         The number of characters to include in the string.
	 * @param  {String} [format='hex'] The string format to use (hex, base64, etc).
	 * @return {String}                The randomly generated string.
	 */
	static randomString( strLen, format = 'hex' ) {

		const strStart = 0;
		let numBytes;

		// Adjust number of bytes based on desired string format.
		if ( 'hex' === format ) {
			numBytes = Math.ceil( strLen * RATIOS.BYTES_TO_HEX );
		} else if ( 'base64' === format ) {
			numBytes = Math.ceil( strLen * RATIOS.BYTES_TO_BASE64 );
		}

		return crypto.randomBytes( numBytes )
			.then( ( value ) =>
				value.toString( format ).slice( strStart, strLen )
			)
			.catch( ( reason ) => {
				log.error( reason );

				return '';
			} );
	}
}

export default mock( Helpers );
