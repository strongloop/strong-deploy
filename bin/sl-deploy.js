#!/usr/bin/env node

'use strict';

var Parser = require('posix-getopt').BasicParser;
var debug = require('debug')('strong-deploy');
var defaults = require('strong-url-defaults');
var deploy = require('../');
var fs = require('fs');
var maybeTunnel = require('strong-tunnel');
var path = require('path');

function printHelp($0, prn) {
  var USAGE = fs.readFileSync(require.resolve('./sl-deploy.txt'), 'utf-8')
      .replace(/%MAIN%/g, $0)
      .trim();

  prn(USAGE);
}

var argv = process.argv;
var $0 = process.env.CMD ? process.env.CMD : path.basename(argv[1]);
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
if (numArgs > 2) {
  console.error('Invalid usage, try `%s --help`.', $0);
  process.exit(1);
}

var baseURL = argv[parser.optind()];
branchOrPack = argv[parser.optind() + 1];

baseURL = baseURL || 'http://';
branchOrPack = branchOrPack || 'deploy';

// Truncate any paths from the baseURL, because the git push does a raw string
// concatenation of '/<config>', and older versions of deploy allowed paths on
// the git push.
baseURL = defaults(baseURL, {host: '127.0.0.1', port: 8701}, {path: '/'});

debug('deploy %j to %j', branchOrPack, baseURL);

var sshOpts = {};

if (process.env.SSH_USER) {
  sshOpts.username = process.env.SSH_USER;
}

if (process.env.SSH_KEY) {
  sshOpts.privateKey = fs.readFileSync(process.env.SSH_KEY);
}


if (!local)
  maybeTunnel(baseURL, sshOpts, function(err, url) {
    if (err) {
      console.error('Error setting up tunnel:', err);
      return exit(err);
    }
    debug('Connecting to %s via %s', baseURL, url);
    deploy(process.cwd(), url, branchOrPack, config, exit);
  });
else
  deploy.local(baseURL, branchOrPack, config, exit);

function exit(err) {
  if (!err) {
    console.log('Deployed `%s` to `%s`', branchOrPack, baseURL);
    process.exit(0);
  }
  process.exit(1);
}
