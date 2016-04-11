'use strict';

require( 'babel-core/register' );

var path     = require( 'path' );
var upsearch = require( 'utils-upsearch' );

global.__path = {
	root:          __dirname,
	cwd:           process.cwd(),
	project:       process.cwd(),
	projectTest:   path.join( __dirname, '_test-project' ),
	app:           path.join( __dirname, 'app' ),
	includes:      path.join( __dirname, 'app/include' ),
	templates:     path.join( __dirname, 'templates' ),
	test:          path.join( __dirname, 'test' ),
	configDefault: path.join( __dirname, 'project.yml' ),
	config:        upsearch.sync( 'project.yml' ),
};

module.exports = require( __path.app );
