'use strict';

import colors from 'colors';

class Log {

	/**
	 * Logs an informational message.
	 *
	 * @since 0.2.0
	 *
	 * @param {string} message
	 */
	static info( message ) {
		console.log( message );
	}

	/**
	 * Logs a debug message.
	 *
	 * @since 0.2.0
	 *
	 * @param {string} message
	 */
	static debug( message ) {
		console.log( `${ message }`.cyan );
	}

	/**
	 * Logs an OK symbol and optional message.
	 *
	 * @since 0.2.0
	 *
	 * @param {string} [message]
	 */
	static ok( message = '' ) {
		console.log( `✔ ${ message }`.green );
	}

	/**
	 * Logs a warning symbol and optional message.
	 *
	 * @since 0.2.0
	 *
	 * @param {string} [message]
	 */
	static warn( message = '' ) {
		console.log( `✱ ${ message }`.yellow );
	}

	/**
	 * Logs an error symbol and optional message.
	 *
	 * @since 0.2.0
	 *
	 * @param {string} [message]
	 */
	static error( message = '' ) {
		console.log( `✘ ${ message }`.red.underline );
	}
}

export default Log;
