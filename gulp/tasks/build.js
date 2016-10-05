
module.exports = ( gulp, doRollup, runNsp ) => {

  /**
   * Build task.
   *
   * @param  {Function} done Async callback.
   * @return {Promise}
   */
  gulp.task( 'build', () => {
    process.env.BABEL_ENV = 'production';

    const promises = ( [ 'es', 'cjs' ] ).map( doRollup );

    return Promise
      .all( promises )
      .then( () => {
        runNsp();
      } )
      .catch( ( err ) => {
        console.error( err.stack );
      } );
  } );
};
