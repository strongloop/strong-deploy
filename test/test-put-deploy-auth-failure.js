// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: strong-deploy
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

var assert = require('assert');
var childProcess = require('child_process');
var debug = require('debug')('test');
var helpers = require('./helpers');

helpers.httpServerDeny(assertNoPut, doPut);

function assertNoPut(req, res) {
  assert.fail('request', 'none', 'Handler should never see request');
}

function doPut(server, _ci) {
  var port = server.address().port;
  var put = childProcess.fork(
    require.resolve('../bin/sl-deploy'),
    [
      '--service', 's1',
      'http://always:allow@127.0.0.1:' + port, __filename
    ],
    { silent: true }
  );
  put.on('exit', function(code, signal) {
    helpers.ok = true;
    server.close();
    var stderr = put.stderr.read();
    var stdout = put.stdout.read();
    debug('sl-deploy stdout: %s', stdout);
    debug('sl-deploy stderr: %s', stderr);
    assert.notEqual(code, 0, 'sl-deploy should exit with failure');
    helpers.assertMatch(stderr, /If authentication is required/i);
  });
}
