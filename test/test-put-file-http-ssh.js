var assert = require('assert');
var childProcess = require('child_process');
var helpers = require('./helpers');

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
