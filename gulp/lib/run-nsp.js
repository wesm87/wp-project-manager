
module.exports = ( nsp, noop, taskConfig ) => (

  /**
   * Checks for any potential security issues (NSP = Node Security Project).
   *
   * @param  {Function} done Async callback.
   * @return {Function}
   */
  () => nsp( taskConfig.nsp, noop )
);
