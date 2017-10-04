
/**
 * Build task.
 */
module.exports = (gulp, doRollup, runNsp) => {
  function handleError(err) {
    console.error(err.stack)
  }

  gulp.task('build', function buildTask() {
    process.env.BABEL_ENV = 'production'

    const moduleTypes = ['es', 'cjs']
    const promises = moduleTypes.map(doRollup)

    return Promise.all(promises)
      .then(runNsp)
      .catch(handleError)
  })
}
