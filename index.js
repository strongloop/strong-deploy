var Parser = require('posix-getopt').BasicParser;
var path = require('path');
var shell = require('shelljs');

var performGitDeployment = require('./lib/git').performGitDeployment;
var performHttpPutDeployment = require('./lib/put-file').performHttpPutDeployment;

function printHelp($0, prn) {
  prn('usage: %s [options] URL [PACK|BRANCH]', $0);
  prn('');
  prn('Deploy a node application to a StrongLoop process manager');
  prn('');
  prn('Options:');
  prn('  -h,--help          Print this message and exit.');
  prn('  -v,--version       Print version and exit.');
  prn('  -c,--config CFG    Deploy a specified configuration (default is "default").');
  prn('');
  prn('Arguments:');
  prn('  URL       The URL of the StrongLoop process manager');
  prn('            eg: http://127.0.0.1:7777');
  prn('  PACK      Deploy an NPM package/tarball.');
  prn('  BRANCH    Deploy a git branch.');
  prn('');
  prn('Default behaviour is to deploy the git branch "deploy".');
}

exports.deploy = function deploy(argv, callback) {
  var $0 = process.env.SLC_COMMAND ?
    'slc ' + process.env.SLC_COMMAND :
    path.basename(argv[1]);
  var parser = new Parser([
      ':v(version)',
      'h(help)',
      'c:(config)',
    ].join(''),
    argv);
  var option;
  var config = 'default';
  var branchOrPack;

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
      case 'p':
        npmPkg = option.optarg;
        break;
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

  var baseURL = argv[parser.optind()];
  if (numArgs === 2) {
    branchOrPack = argv[parser.optind() + 1];
  }
  branchOrPack = branchOrPack || 'deploy';

  function cb(er) {
    if (er) {
      callback(Error('Deployment unsuccessful'));
    } else {
      console.log('Deployed `%s` to `%s`', branchOrPack, baseURL);
      callback();
    }
  }

  if (shell.test('-f', path.resolve(branchOrPack))) {
    performHttpPutDeployment(baseURL, config, branchOrPack, cb);
  } else {
    performGitDeployment(baseURL, config, branchOrPack, cb);
  }
};
