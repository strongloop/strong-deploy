// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: strong-deploy
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var assert = require('assert');
var childProcess = require('child_process');
var helpers = require('./helpers');

if (/win32/.test(process.platform)) {
  helpers.ok = true;
  console.log('TAP version 13\n1..0 # skip ssh tests on Windows');
  return;
}

var handler = helpers.findServiceAndRunHandler.bind(null, assertPut);
var server = helpers.httpServer(handler, doPut);

function assertPut(req, res) {
  assert(req.method === 'PUT');
  helpers.ok = true;

  res.end();
  server.close();
}

function doPut(server, _ci) {
  var port = server.address().port;
  childProcess.fork(
    require.resolve('../bin/sl-deploy'),
    [
      '--service', 's1',
      'http+ssh://127.0.0.1:' + port, __filename
    ]
  );
}
