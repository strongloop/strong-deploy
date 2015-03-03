#!/usr/bin/env node

var Parser = require('posix-getopt').BasicParser;
var deploy = require('../');
var fs = require('fs');
var path = require('path');

function printHelp($0, prn) {
  var USAGE = fs.readFileSync(require.resolve('./sl-deploy.txt'), 'utf-8')
      .replace(/%MAIN%/g, $0)
      .trim();

  prn(USAGE);
}

var argv = process.argv;
var $0 = process.env.SLC_COMMAND ? 'slc ' +
process.env.SLC_COMMAND : path.basename(argv[1]);
var parser = new Parser([
    ':v(version)',
    'h(help)',
    'c:(config)',
    'L(local)', // Undocumented for now, just for local testing
  ].join(''),
  argv);
var option;
var config = 'default';
var branchOrPack;
var local;

while ((option = parser.getopt()) !== undefined) {
  switch (option.option) {
    case 'v':
      console.log(require('../package.json').version);
      process.exit(0);
      break;
    case 'h':
      printHelp($0, console.log);
      process.exit(0);
      break;
    case 'c':
      config = option.optarg;
      break;
    case 'L':
      local = true;
      break;
    default:
      console.error('Invalid usage (near option \'%s\'), try `%s --help`.',
        option.optopt,
        $0);
      process.exit(1);
  }
}

var numArgs = argv.length - parser.optind();
if (numArgs < 1 || numArgs > 2) {
  console.error('Invalid usage, try `%s --help`.', $0);
  process.exit(1);
}

var baseURL = argv[parser.optind()];
if (numArgs === 2) {
  branchOrPack = argv[parser.optind() + 1];
}
branchOrPack = branchOrPack || 'deploy';

if (!local)
  deploy(process.cwd(), baseURL, branchOrPack, config, exit);
else
  deploy.local(baseURL, branchOrPack, config, exit);

function exit(err) {
  if (!err) {
    console.log('Deployed `%s` to `%s`', branchOrPack, baseURL);
    process.exit(0);
  }
  process.exit(1);
}
