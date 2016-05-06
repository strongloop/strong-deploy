#!/usr/bin/env node
// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: strong-deploy
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

var Parser = require('posix-getopt').BasicParser;
var debug = require('debug')('strong-deploy');
var defaults = require('strong-url-defaults');
var getPackageInfo = require('../lib/package').getPackageInfo;
var defaultPackagePath = require('../lib/package').getPackagePath;
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
  's:(service)',
  'z:(size)',
  'L(local)' // Undocumented for now, just for local testing
].join(''), argv);
var option;
var branchOrPack;
var local;
var serviceName;
var clusterSize;

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
    case 's':
      serviceName = option.optarg;
      break;
    case 'z':
      clusterSize = option.optarg;
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

var workingDir = process.cwd();

// XXX(sam) our CWD isn't necessarily the package we are deploying, we should
// get the package name from the git branch, or the tarball being deployed,
// or the path being deployed.
var packageInfo = getPackageInfo(workingDir);
serviceName = serviceName || (packageInfo ? packageInfo.name : null);

if (!serviceName) {
  console.error(
    'Unable to detect service name, package.json has no "name" property.\n' +
    'Please update your package.json or specify a service name.\n' +
    'See `%s --help` for more details.', $0
  );
  process.exit(1);
}

var baseURL = argv[parser.optind()];
branchOrPack = argv[parser.optind() + 1];

baseURL = baseURL || 'http://';
branchOrPack = branchOrPack || defaultPackagePath(workingDir) || 'deploy';

// Truncate any paths from the baseURL, because the final path of the URL is
// dependent on the ID of the service being updated by this deployment.
// Older versions of deploy use to allow paths on the git push.
baseURL = defaults(baseURL, {host: '127.0.0.1', port: 8701}, {path: '/'});

debug('deploy %j to %j', branchOrPack, baseURL);

var sshOpts = {};

if (process.env.SSH_USER) {
  sshOpts.username = process.env.SSH_USER;
}

if (process.env.SSH_KEY) {
  sshOpts.privateKey = fs.readFileSync(process.env.SSH_KEY);
}

if (process.env.SSH_PORT) {
  sshOpts.port = process.env.SSH_PORT;
}

exit.url = baseURL;
if (!local) {
  maybeTunnel(baseURL, sshOpts, function(err, url) {
    exit.url = url;
    if (err) {
      console.error('Error setting up tunnel:', err);
      return exit(err);
    }
    debug('Connecting to %s via %s', baseURL, url);
    var options = {
      workingDir: workingDir,
      baseURL: url,
      serviceName: serviceName,
      branchOrPack: branchOrPack,
      clusterSize: clusterSize,
    };
    deploy(options, exit);
  });
} else {
  var options = {
    baseURL: baseURL,
    serviceName: serviceName,
    branchOrPack: branchOrPack,
    clusterSize: clusterSize,
  };
  deploy.local(options, exit);
}

function exit(err, service) {
  var svc = service ? (service.name || service.id) : serviceName;
  if (err) {
    console.error('Failed to deploy `%s` as `%s` to `%s` via `%s`',
                  branchOrPack, svc, baseURL, exit.url);
    process.exit(1);
  } else {
    console.log('Deployed `%s` as `%s` to `%s`', branchOrPack, svc, baseURL);
    process.exit(0);
  }
}
