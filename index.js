var assert = require('assert');
var debug = require('debug')('strong-deploy');
var Parser = require('posix-getopt').BasicParser;
var path = require('path');
var shell = require('shelljs');
var util = require('util');
var url = require('url');

function printHelp($0, prn) {
  prn('usage: %s [options] URL', $0);
  prn('');
  prn('Deploy a node application to a StrongLoop process manager');
  prn('');
  prn('Options:');
  prn('  -h,--help       Print this message and exit.');
  prn('  -v,--version    Print version and exit.');
  prn('');
  prn('Git specific options:');
  prn('  --branch BRANCH    Deploy a specified branch.');
  prn('                     (default: current branch)');
  prn('');
  prn('Arguments:');
  prn('  URL    The URL of the StrongLoop process manager');
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

function doGitPush(gitURL, branch, callback) {
  shell.exec(
    util.format('git push %s %s:%s', gitURL, branch, branch),
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
      'b:(branch)'
    ].join(''),
    argv);
  var option;
  var error;
  var branch;

  while ((option = parser.getopt()) !== undefined) {
    switch (option.option) {
      case 'v':
        console.log(require('./package.json').version);
        return callback();
      case 'h':
        printHelp($0, console.log);
        return callback();
      case 'b':
        branch = option.optarg;
        break;
      default:
        console.error('Invalid usage (near option \'%s\'), try `%s --help`.',
          option.optopt, $0);
        return callback(Error('usage'));
    }
  }

  if (argv.length - parser.optind() != 1) {
    console.error('Invalid usage, try `%s --help`.', $0);
    return callback(Error('usage'));
  }

  branch = branch || getCurrentBranch();
  if (branch instanceof Error) {
    console.error(branch.message);
    callback(branch);
  }

  if (!isValidBranch(branch)) {
    console.error('Branch `%s` is not available in this repository', branch);
    return callback(Error('invalid branch'));
  }

  var deployURL = argv[parser.optind()];
  if (!isValidGitURL(deployURL)) {
    console.error('URL `%s` is not valid', deployURL);
    return callback(Error('invalid url'));
  }

  doGitPush(deployURL, branch, function(er, p) {
    if (er) {
      console.error('Deployment unsuccessful');
      callback(Error('Deployment unsuccessful'));
    } else {
      console.log('Deployed branch `%s` to `%s`', branch, deployURL);
      callback();
    }
  });
};
