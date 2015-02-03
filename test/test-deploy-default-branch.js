var assert = require('assert');
var childProcess = require('child_process');
var helpers = require('./helpers');
var shell = require('shelljs');

shell.exec('git branch deploy');
helpers.gitServer(test);

function test(server, ci) {
  ci.once('commit', assertCommit);

  childProcess.fork(
    require.resolve('../bin/sl-deploy'),
    ['http://any:thin@127.0.0.1:' + server.address().port]
  );

  function assertCommit(commit) {
    assert(commit.repo === 'default');
    var branch = 'deploy';
    assert(commit.branch === branch);
    helpers.ok = true;
    server.close();
  }
}
