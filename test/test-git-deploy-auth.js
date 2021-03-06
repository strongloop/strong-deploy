// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: strong-deploy
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

var assert = require('assert');
var childProcess = require('child_process');
var helpers = require('./helpers');
var shell = require('shelljs');

shell.exec('git branch deploy');
helpers.gitServerAllow(test);

function test(server, ci) {
  ci.once('commit', assertCommit);

  childProcess.fork(
    require.resolve('../bin/sl-deploy'),
    [
      '--service', 's1',
      'http://any:thin@127.0.0.1:' + server.address().port
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
