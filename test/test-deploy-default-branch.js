var assert = require('assert');
var childProcess = require('child_process');
var concat = require('concat-stream');
var helpers = require('./helpers');
var shell = require('shelljs');

shell.exec('git branch deploy');
helpers.gitServer(test);

function test(server, ci) {
  ci.once('commit', assertCommit);

  var child = childProcess.fork(
    require.resolve('../bin/sl-deploy'),
    [
      '--service', 's1',
      'http://any:thin@127.0.0.1:' + server.address().port
    ],
    {silent: true}
  );

  child.stderr.pipe(process.stderr);
  child.stdout.pipe(concat(function(msg) {
    console.log('Check deploy message: <%s>', String(msg).trim());
    assert(/Deployed.*as `1` to `http.*/.test(msg), msg);
  }));

  function assertCommit(commit) {
    var branch = 'deploy';
    assert(commit.branch === branch);
    helpers.ok = true;
    server.close();
  }
}
