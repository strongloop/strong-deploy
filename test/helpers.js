var assert = require('assert');
var auth = require('http-auth');
var cicada = require('strong-fork-cicada');
var debug = require('debug')('test');
var http = require('http');
var path = require('path');
var shell = require('shelljs');

var artifactDir = path.join(__dirname, '.test_artifacts');

shell.rm('-rf', artifactDir);

var ci = cicada(artifactDir);
var allowAll = auth.basic({ realm: 'git' }, alwaysSay(true));
var denyAll = auth.basic({ realm: 'git' }, alwaysSay(false));

module.exports = exports = {
  gitServerAllow:  httpServer.bind(null, [allowAll, ci.handle]),
  gitServerDeny:   httpServer.bind(null, [denyAll, ci.handle]),
  gitServer:       httpServer.bind(null, [ci.handle]),
  httpServerAllow: httpServer.bind(null, [allowAll]),
  httpServerDeny:  httpServer.bind(null, [denyAll]),
  httpServer:      httpServer.bind(null, []),
  assertMatch:     assertMatch,
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

function alwaysSay(result) {
  return function(user, pass, callback) {
    debug('HTTP Auth: %s:%s => %s', user, pass, result ? 'ALLOW' : 'DENY');
    callback(result);
  }
}

function assertMatch(actual, expected, message) {
  actual = actual.toString('utf8');
  expected = new RegExp(expected);
  if (!expected.test(actual)) {
    assert.fail(actual, expected.toString(), message, 'match');
  }
}
