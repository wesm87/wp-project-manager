
/**
 * Runs unit tests.
 */
module.exports = (gulp, mocha, taskConfig, taskFiles) => function runTests() {
  return gulp
    .src(taskFiles.js.tests)
    .pipe(mocha(taskConfig.mocha));
};
