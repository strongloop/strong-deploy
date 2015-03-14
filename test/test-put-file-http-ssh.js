var assert = require('assert');
var childProcess = require('child_process');
var helpers = require('./helpers');

var server = helpers.httpServer(assertPut, doPut);

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
    ['http+ssh://127.0.0.1:' + port, __filename]
  );
}
