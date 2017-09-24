
/**
 * Watch task.
 */
module.exports = (gulp, runTests, taskFiles) => {
  gulp.task('watch', function watchTask() {
    gulp.watch(taskFiles.js.watch, runTests)
  })
}
