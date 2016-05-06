// Copyright IBM Corp. 2014,2015. All Rights Reserved.
// Node module: strong-deploy
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

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
 * @param {string} options.workingDir The working directory
 * @param {string} options.baseURL The URL of the service.
 * @param {integer} options.serviceName The name of the service.
 * @param {integer} options.clusterSize The size of the cluster.
 * @param {string} branchOrPack Name of the GIT branch or path to the NPM pack.
 * @param {function} cb Callback
 */
function deploy(options, cb) {
  if (shell.test('-f', path.resolve(options.branchOrPack))) {
    return httpPutDeployment(options, cb);
  } else {
    return gitDeployment(options, cb);
  }
}
