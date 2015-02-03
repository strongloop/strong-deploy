var assert = require('assert');
var cicada = require('strong-fork-cicada');
var debug = require('debug')('test');
var http = require('http');
var path = require('path');
var shell = require('shelljs');

var artifactDir = path.join(__dirname, '.test_artifacts');

shell.rm('-rf', artifactDir);

var ci = cicada(artifactDir);

module.exports = exports = {
  gitServer:       httpServer.bind(null, [ci.handle]),
  httpServer:      httpServer.bind(null, []),
  ok:              false,
};

// Check for node silently exiting with code 0 when tests have not passed.
process.on('exit', function(code) {
  if (code === 0) {
    assert(exports.ok);
  }
});

function httpServer(handlers, customHandler, callback) {
  if (customHandler) {
    if (callback) {
      handlers.push(customHandler);
    } else {
      callback = customHandler;
    }
  }
  var server = http.createServer.apply(http, handlers);

  return server.listen(0, returnServer);

  function returnServer() {
    debug('Server started at: %j', server.address());
    callback(server, ci);
  }
}
