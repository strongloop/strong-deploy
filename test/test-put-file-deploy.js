var assert = require('assert');
var http = require('http');
var childProcess = require('child_process');

var ok = false;
var server = http.createServer(function(req, res) {
  assert(req.url === '/repo2');
  assert(req.method === 'PUT');
  ok = true;

  res.end();
  server.close();
});
server.listen(0);

server.on('listening', function() {
  var port = server.address().port;
  childProcess.fork(
    require.resolve('../bin/sl-deploy'),
    ['--config', 'repo2', 'http://127.0.0.1:' + port, __filename]
  );
});
