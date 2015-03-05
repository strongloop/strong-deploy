'use strict';

var path = require('path');
var shell = require('shelljs');

var gitDeployment = require('./lib/git').performGitDeployment;
var httpPutDeployment = require('./lib/put-file').performHttpPutDeployment;
var localDeployment = require('./lib/post-json').performLocalDeployment;

module.exports = deploy;
module.exports.local = localDeployment;

/**
 * Deploy a NPM pack or GIT branch to a strong-pm service
 *
 * @param {string} workingDir The working directory
 * @param {string} baseURL The URL of the service.
 * @param {string} branchOrPack Name of the GIT branch or path to the NPM pack.
 * @param {string} [config] The config to use on the strong-pm server.
 * @param {function} cb Callback
 */
function deploy(workingDir, baseURL, branchOrPack, config, cb) {
  if (typeof config === 'function') {
    cb = config;
    config = 'default';
  }

  config = config || 'default';

  if (shell.test('-f', path.resolve(branchOrPack))) {
    return httpPutDeployment(baseURL, config, branchOrPack, cb);
  } else {
    return gitDeployment(workingDir, baseURL, config, branchOrPack, cb);
  }
}
