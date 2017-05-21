
/**
 * Code coverage.
 */
module.exports = (gulp, istanbul, runTests, taskConfig, taskFiles) => {
  function handleFinish() {
    return runTests()
      .pipe(istanbul.writeReports(taskConfig.istanbul.write))
      .on('end', done)
  }

   gulp.task('coverage', function coverageTask(done) {
     return gulp
      .src(taskFiles.js.source)
        .pipe(istanbul(taskConfig.istanbul.read))
        .pipe(istanbul.hookRequire())
        .on('finish', handleFinish);
   });
};
