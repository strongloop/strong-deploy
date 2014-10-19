var shell = require('shelljs');
var url = require('url');
var util = require('util');

function getCurrentBranch() {
  var output = shell.exec('git symbolic-ref --short HEAD', {silent: true});
  if (output.code !== 0) {
    return Error('This directory does not contain a valid git repository');
  }
  return output.output.trim();
}

function isValidBranch(branchName) {
  var output = shell.exec(
    util.format('git rev-parse --abbrev-ref %s', branchName),
    {silent: true});
  return output.code === 0;
}

function isValidGitURL(url) {
  var output = shell.exec(
    util.format('git ls-remote %s', url),
    {silent: true});
  return output.code === 0;
}

function doGitPush(gitURL, branch, callback) {
  shell.exec(
    util.format('git push -f %s %s:%s', gitURL, branch, branch),
    callback);
}

function performGitDeployment(baseUrl, config, branch, callback) {
  baseUrl = url.parse(baseUrl);
  baseUrl.pathname = config;
  var deployURL = url.format(baseUrl);

  if (!isValidBranch(branch)) {
    console.error('Branch `%s` is not available in this repository', branch);
    return callback(Error('invalid branch'));
  }

  if (!isValidGitURL(deployURL)) {
    console.error('URL `%s` is not valid', deployURL);
    return callback(Error('invalid url'));
  }

  doGitPush(deployURL, branch, callback);
}

exports.performGitDeployment = performGitDeployment;
// for unit tests
exports._getCurrentBranch = getCurrentBranch;
