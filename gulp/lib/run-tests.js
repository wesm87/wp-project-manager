
module.exports = ( gulp, mocha, taskConfig, taskFiles ) => (
  () => (
    gulp.src( taskFiles.js.tests )
      .pipe( mocha( taskConfig.mocha ) )
  )
);
