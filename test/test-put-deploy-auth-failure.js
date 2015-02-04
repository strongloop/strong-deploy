var assert = require('assert');
var childProcess = require('child_process');
var debug = require('debug')('test');
var helpers = require('./helpers');

var server = helpers.httpServerDeny(assertNoPut, doPut);

function assertNoPut(req, res) {
  assert.fail('request', 'none', 'Handler should never see request');
}

function doPut(server, _ci) {
  var port = server.address().port;
  var put = childProcess.fork(
    require.resolve('../bin/sl-deploy'),
    ['--config', 'repo2', 'http://always:allow@127.0.0.1:' + port, __filename],
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
    helpers.assertMatch(stderr, /HTTP Code: 401/i);
    helpers.assertMatch(stderr, /credentials must be given in the URL/i);
  });
}
