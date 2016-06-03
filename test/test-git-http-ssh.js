// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: strong-deploy
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var assert = require('assert');
var childProcess = require('child_process');
var helpers = require('./helpers');
var shell = require('shelljs');

if (/win32/.test(process.platform)) {
  helpers.ok = true;
  console.log('TAP version 13\n1..0 # skip ssh tests on Windows');
  return;
}

shell.exec('git branch deploy');
helpers.gitServer(test);

function test(server, ci) {
  ci.once('commit', assertCommit);

  childProcess.fork(
    require.resolve('../bin/sl-deploy'),
    [
      '--service', 's1',
      'http+ssh://127.0.0.1:' + server.address().port
    ]
  );

  function assertCommit(commit) {
    assert(commit.repo === 'default');
    var branch = 'deploy';
    assert(commit.branch === branch);
    helpers.ok = true;
    server.close();
  }
}
