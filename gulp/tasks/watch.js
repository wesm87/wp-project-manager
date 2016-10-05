module.exports = ( gulp, runTests, taskFiles ) => (

  /**
   * Watch task.
   */
  gulp.task( 'watch', () => {
    gulp.watch( taskFiles.js.watch, runTests );
  } )
);
