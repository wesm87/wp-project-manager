
import fs     from 'fs-extra';
import YAML   from 'js-yaml';
import crypto from 'crypto'; // eslint-disable-line no-shadow

import log    from './log';

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
	 * Checks if the specified file or directory exists.
	 *
	 * @since 0.1.0
	 * @since 0.2.0 Added 'symlink' type.
	 *
	 * @param  {string} path The path to check.
	 * @param  {string} type Optional. A type to check the path against.
	 * @return {bool}        True if path exists and is `type`; false if not.
	 */
	static pathExists( path, type = 'any' ) {
		try {
			const info = fs.lstatSync( path );

			switch ( type ) {
			case 'file' :
				return info.isFile();
			case 'folder' :
			case 'directory' :
				return info.isDirectory();
			case 'link':
			case 'symlink':
				return info.isSymbolicLink();
			default:
				return !! info;
			}
		} catch ( error ) {
			return false;
		}
	}

	/**
	 * Checks if the specified file exists.
	 *
	 * @since 0.1.0
	 *
	 * @param  {string} path The path to the file to check.
	 * @return {bool}        True the file exists; false if not.
	 */
	static fileExists( path ) {
		return this.pathExists( path, 'file' );
	}

	/**
	 * Checks if the specified directory exists.
	 *
	 * @since 0.1.0
	 *
	 * @param  {string} path The path to the directory to check.
	 * @return {bool}        True the directory exists; false if not.
	 */
	static directoryExists( path ) {
		return this.pathExists( path, 'directory' );
	}

	/**
	 * Checks if the specified symbolic link exists.
	 *
	 * @since 0.2.0
	 *
	 * @param  {string} path The path to the symbolic link to check.
	 * @return {bool}        True the symbolic link exists; false if not.
	 */
	static symlinkExists( path ) {
		return this.pathExists( path, 'symlink' );
	}

	/**
	 * Takes a directory path and returns an array containing the contents of
	 * the directory.
	 *
	 * @since 0.4.0
	 *
	 * @param  {string} dir             The directory path.
	 * @param  {bool}   [includeHidden] If true, hidden files are included.
	 *                                  Default is false.
	 *
	 * @return {array}  The directory contents.
	 */
	static readDir( dir, includeHidden ) {

		try {
			let files = fs.readdirSync( dir );

			if ( ! includeHidden ) {

				// eslint-disable-next-line no-magic-numbers
				files = files.filter( ( file ) => 0 !== file.indexOf( '.' ) );
			}

			return files;
		} catch ( error ) {
			return [];
		}
	}

	/**
	 * Tries to load a YAML config file and parse it into JSON.
	 *
	 * @since 0.1.0
	 *
	 * @param  {string} filePath The path to the YAML file.
	 * @return {object}          The parsed results. If the file is blank or
	 *                           doesn't exist, we return an empty object.
	 */
	static loadYAML( filePath ) {

		try {

			// Get file contents as JSON.
			const json = YAML.safeLoad( fs.readFileSync( filePath, 'utf8' ) );

			// Make sure the config isn't empty.
			if ( json ) {
				return json;
			}
		} catch ( error ) {
			log.error( error );
		}

		// If the file doesn't exist or is empty, return an empty object.
		return {};
	}

	/**
	 * Takes a JSON string or object, parses it into YAML, and writes to a file.
	 *
	 * @since 0.3.0
	 *
	 * @param  {string} filePath The path to the file to write to.
	 * @param  {object} json     The JSON object to parse into YAML.
	 */
	static writeYAML( filePath, json ) {

		try {

			// Convert JSON to YAML.
			const yaml = YAML.safeDump( json, { noCompatMode: true } );

			fs.writeFileSync( filePath, yaml );
		} catch ( error ) {
			log.error( error );
		}
	}

	/**
	 * Generates a random string in hexadecimal format.
	 *
	 * @since 0.1.0
	 *
	 * @param  {int}    strLen  The number of characters to include in the string.
	 * @param  {string} format  The string format to use (hex, base64, etc).
	 * @return {string}         The randomly generated string.
	 */
	static randomString( strLen, format = 'hex' ) {

		try {

			let numBytes;

			// Adjust number of bytes based on desired string format.
			if ( 'hex' === format ) {
				numBytes = Math.ceil( strLen * RATIOS.BYTES_TO_HEX );
			} else if ( 'base64' === format ) {
				numBytes = Math.ceil( strLen * RATIOS.BYTES_TO_BASE64 );
			}

			return crypto
				.randomBytes( numBytes )
				.toString( format )
				.slice( 0, strLen ); // eslint-disable-line no-magic-numbers

		} catch ( error ) {
			log.error( error );

			return '';
		}
	}
}

export default Helpers;
