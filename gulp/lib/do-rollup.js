
module.exports = ( rollupPluginBabel, rollup ) => (

  /**
   * Creates a new bundle via Rollup.
   *
   * @param  {Object} format The bundle format.
   * @return {[type]}        [description]
   */
  ( format ) => {
    const rollupConfig = {
      entry:   'app/index.js',
      plugins: [
        rollupPluginBabel( { runtimeHelpers: true } ),
      ],
    };

    const bundleConfig = {
      format,
      dest: `dist/bundle.${ format }.js`,
    };

    return rollup.rollup( rollupConfig ).then(
      ( bundle ) => bundle.write( bundleConfig )
    );
  }
);
