var shell = require('shelljs');
var util = require('util');

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

function isValidBranch(workingDir, branchName) {
  if (!shell.pushd(workingDir)) {
    return Error(util.format('Directory %s does not exist', workingDir));
  }
  var output = shell.exec(
    util.format('git rev-parse --abbrev-ref %s', branchName),
    {silent: true});
  shell.popd();
  return output.code === 0;
}

function isValidGitURL(workingDir, url) {
  if (!shell.pushd(workingDir)) {
    return Error(util.format('Directory %s does not exist', workingDir));
  }
  var output = shell.exec(
    util.format('git ls-remote %s', url),
    {silent: true});
  shell.popd();
  return output.code === 0;
}

function doGitPush(workingDir, gitURL, branch, callback) {
  if (!shell.pushd(workingDir)) {
    return Error(util.format('Directory %s does not exist', workingDir));
  }
  shell.exec(
    util.format('git push -f %s %s:%s', gitURL, branch, branch),
    function(err){
      shell.popd();
      callback(err);
    }
  );
}

function performGitDeployment(workingDir, baseUrl, config, branch, callback) {
  var deployURL = baseUrl + '/' + config;

  if (!isValidBranch(workingDir, branch)) {
    console.error('Branch `%s` is not available in this repository', branch);
    return callback(Error('invalid branch'));
  }

  if (!isValidGitURL(workingDir, deployURL)) {
    console.error('URL `%s` is not valid', deployURL);
    return callback(Error('invalid url'));
  }

  doGitPush(workingDir, deployURL, branch, callback);
}

exports.performGitDeployment = performGitDeployment;
// for unit tests
exports._getCurrentBranch = getCurrentBranch;
