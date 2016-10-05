module.exports = ( gulp, runTests ) => (

  /**
   * Unit tests.
   *
   * @return {Function}
   */
  gulp.task( 'test', () => runTests() )
);
