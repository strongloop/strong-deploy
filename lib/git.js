// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: strong-deploy
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var async = require('async');
var childProcess = require('child_process');
var debug = require('debug')('strong-deploy:git');
var getDeployEndpoint = require('./deploy-endpoint').get;
var shell = require('shelljs');
var util = require('util');
var urlParse = require('url').parse;
var urlFormat = require('url').format;

function getCurrentBranch(workingDir) {
  if (!shell.pushd(workingDir)) {
    return Error(util.format('Directory %s does not exist', workingDir));
  }
  var output = shell.exec('git symbolic-ref --short HEAD', {silent: true});
  shell.popd();
  if (output.code !== 0) {
    return Error('This directory does not contain a valid git repository');
  }
  return output.output.trim();
}

function isValidBranch(workingDir, branchName, callback) {
  var cmd = util.format('git rev-parse --abbrev-ref %s', branchName);
  debug(cmd);
  var options = {cwd: workingDir};
  childProcess.exec(cmd, options, function(err, stdout, stderr) {
    debug('stdout: ' + stdout);
    debug('stderr: ' + stderr);
    if (err) {
      debug(err);
      console.error('Branch `%s` is not available in this repository',
        branchName);
      err = Error('invalid branch');
    }
    callback(err);
  });
}

function isValidGitURL(workingDir, url, callback) {
  var cmd = util.format('git ls-remote %s', url);
  debug(cmd);
  var options = {cwd: workingDir};
  childProcess.exec(cmd, options, function(err, stdout, stderr) {
    debug('stdout: ' + stdout);
    debug('stderr: ' + stderr);
    if (err) {
      debug(err);
      if (urlFormat(urlParse(url)) !== url) {
        console.error('URL `%s` is not valid', url);
      }
      err = Error('invalid url');
    }
    callback(err);
  });
}

function doGitPush(workingDir, gitURL, branch, callback) {
  var cmd = 'git';
  var args = ['push', '-f', gitURL, branch + ':' + branch];

  debug(cmd, args);
  var options = {cwd: workingDir, stdio: [0, 1, 2]};
  var child = childProcess.spawn(cmd, args, options);

  // Based on node docs, `exit` event may or may not fire afetr `error`.
  child.once('error', function(err) {
    if (!callback) return;

    callback(err);
    callback = null;
  });

  child.once('exit', function(code) {
    if (!callback) return;

    if (code !== 0) return callback(Error('git push failed'));
    callback();
    callback = null;
  });
}

function performGitDeployment(options, callback) {
  getDeployEndpoint(options.baseURL, options.serviceName, options.clusterSize,
    function(err, deployUrl, service) {
      if (err) return callback(err);
      _performGitDeployment(service, options.workingDir, deployUrl,
          options.branchOrPack, callback);
    });
}

function _performGitDeployment(service, workingDir, baseUrl, branch, callback) {
  var deployURL = baseUrl + '/default';
  async.series([
    isValidBranch.bind(null, workingDir, branch),
    isValidGitURL.bind(null, workingDir, deployURL),
    doGitPush.bind(null, workingDir, deployURL, branch)
  ], function(err) {
    if (err) return callback(err);
    return callback(null, service);
  });
}

exports.performGitDeployment = performGitDeployment;
// for unit tests
exports._getCurrentBranch = getCurrentBranch;
