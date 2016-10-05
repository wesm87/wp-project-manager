module.exports = ( gulp, istanbul, runTests, taskConfig, taskFiles ) => {

  /**
   * Code coverage.
   *
   * @param  {Function} done Async callback.
   * @return {Function}
   */
   gulp.task( 'coverage',
    ( done ) => gulp.src( taskFiles.js.source )
      .pipe( istanbul( taskConfig.istanbul.read ) )
      .pipe( istanbul.hookRequire() )
      .on( 'finish', () =>
        runTests()
          .pipe( istanbul.writeReports( taskConfig.istanbul.write ) )
          .on( 'end', done )
      )
  );
};
