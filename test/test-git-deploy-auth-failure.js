var assert = require('assert');
var childProcess = require('child_process');
var debug = require('debug')('test');
var helpers = require('./helpers');

helpers.gitServerDeny(test);

function test(server, ci) {
  ci.once('commit', assertNoCommit);
  var deploy = childProcess.fork(
    require.resolve('../bin/sl-deploy'),
    ['http://any:thing@127.0.0.1:' + server.address().port],
    { env: { GIT_ASKPASS: 'echo' }, silent: true }
  );
  deploy.on('exit', function(code, signal) {
    helpers.ok = true;
    server.close();
    var stderr = deploy.stderr.read();
    var stdout = deploy.stdout.read();
    debug('sl-deploy stdout: %s', stdout);
    debug('sl-deploy stderr: %s', stderr);
    assert.notEqual(code, 0, 'sl-deploy should exit with failure');
    helpers.assertMatch(stderr, /If authentication is required/i);
    helpers.assertMatch(stderr, /credentials should be given in the URL/i);
  });
}

function assertNoCommit(commit) {
  assert.fail('commit', 'none', 'cicada should never see this');
}
