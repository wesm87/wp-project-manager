
/**
 * Creates a new bundle via Rollup.
 */
module.exports = (rollupPluginBabel, rollup) => function doRollup(format) {
  const rollupConfig = {
    entry: 'app/index.js',
    plugins: [
      rollupPluginBabel({ runtimeHelpers: true }),
    ],
  };

  const bundleConfig = {
    format,
    dest: `dist/bundle.${format}.js`,
  };

  return rollup
    .rollup(rollupConfig)
    .then((bundle) => bundle.write(bundleConfig));
};
