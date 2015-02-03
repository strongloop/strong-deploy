var assert = require('assert');
var childProcess = require('child_process');
var helpers = require('./helpers');

var server = helpers.httpServer(assertPut, doPut);

function assertPut(req, res) {
  assert(req.url === '/repo2');
  assert(req.method === 'PUT');
  helpers.ok = true;

  res.end();
  server.close();
}

function doPut(server, _ci) {
  var port = server.address().port;
  childProcess.fork(
    require.resolve('../bin/sl-deploy'),
    ['--config', 'repo2', 'http://127.0.0.1:' + port, __filename]
  );
}
