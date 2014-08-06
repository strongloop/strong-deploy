var assert = require('assert');
var debug = require('debug')('strong-deploy');
var Parser = require('posix-getopt').BasicParser;
var path = require('path');
var shell = require('shelljs');
var util = require('util');
var url = require('url');

function printHelp($0, prn) {
  prn('usage: %s [options] URL [BRANCH]', $0);
  prn('');
  prn('Deploy a node application to a StrongLoop process manager');
  prn('');
  prn('Options:');
  prn('  -h,--help          Print this message and exit.');
  prn('  -v,--version       Print version and exit.');
  prn('  -c,--config CFG    Deploy a specified configuration.');
  prn('                     (default: default)');
  prn('  -r,--redeploy      Redeploy branch, even if has been deployed before.');
  prn('');
  prn('Arguments:');
  prn('  URL       The URL of the StrongLoop process manager');
  prn('            eg: http://127.0.0.1:7777');
  prn('  BRANCH    Deploy a specified branch.');
  prn('            (default: deploy)');
}

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

function doGitPush(gitURL, branch, redeploy, callback) {
  var force = redeploy ? '-f' : '';
  shell.exec(
    util.format('git push %s %s %s:%s', force, gitURL, branch, branch),
    callback);
}

// for unit tests
exports._getCurrentBranch = getCurrentBranch;
exports.deploy = function deploy(argv, callback) {
  var $0 = process.env.SLC_COMMAND ?
    'slc ' + process.env.SLC_COMMAND :
    path.basename(argv[1]);
  var parser = new Parser([
      ':v(version)',
      'h(help)',
      'c:(config)'
    ].join(''),
    argv);
  var option;
  var error;
  var config = 'default';
  var branch = 'deploy';
  var redeploy = false;

  while ((option = parser.getopt()) !== undefined) {
    switch (option.option) {
      case 'v':
        console.log(require('./package.json').version);
        return callback();
      case 'h':
        printHelp($0, console.log);
        return callback();
      case 'c':
        config = option.optarg;
        break;
      case 'r':
        redeploy = true;
      default:
        console.error('Invalid usage (near option \'%s\'), try `%s --help`.',
          option.optopt, $0);
        return callback(Error('usage'));
    }
  }

  var numArgs = argv.length - parser.optind();
  if (numArgs < 1 || numArgs > 2) {
    console.error('Invalid usage, try `%s --help`.', $0);
    return callback(Error('usage'));
  }
  
  config = config || 'default';
  var deployURL = argv[parser.optind()] + "/" + config;
  if (numArgs === 2) {
    branch = argv[parser.optind()+1];
  }

  branch = branch || 'deploy'
  if (!isValidBranch(branch)) {
    console.error('Branch `%s` is not available in this repository', branch);
    return callback(Error('invalid branch'));
  }

  if (!isValidGitURL(deployURL)) {
    console.error('URL `%s` is not valid', deployURL);
    return callback(Error('invalid url'));
  }

  doGitPush(deployURL, branch, redeploy, function(er, p) {
    if (er) {
      console.error('Deployment unsuccessful');
      callback(Error('Deployment unsuccessful'));
    } else {
      console.log('Deployed branch `%s` to `%s`', branch, deployURL);
      callback();
    }
  });
};
