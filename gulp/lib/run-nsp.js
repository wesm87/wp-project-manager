
const { partial, noop } = require('lodash/fp');

/**
 * Checks for any potential security issues (NSP = Node Security Project).
 */
module.exports = (nsp, taskConfig) => function runNsp() {
  return nsp(taskConfig.nsp, noop);
}
