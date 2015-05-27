var assert = require('assert');
var auth = require('http-auth');
var cicada = require('strong-fork-cicada');
var debug = require('debug')('strong-deploy:test');
var http = require('http');
var path = require('path');
var shell = require('shelljs');
var url = require('url');

var artifactDir = path.join(__dirname, '.test_artifacts');

shell.rm('-rf', artifactDir);

var ci = cicada(artifactDir);
var allowAll = auth.basic({ realm: 'git' }, alwaysSay(true));
var denyAll = auth.basic({ realm: 'git' }, alwaysSay(false));

debug('cicada artifacts %j', artifactDir);
debug('cwd %j', process.cwd());

module.exports = exports = {
  gitServerAllow:  httpServer.bind(null, [allowAll, findServiceAndHandleCi]),
  gitServerDeny:   httpServer.bind(null, [denyAll, findServiceAndHandleCi]),
  gitServer:       httpServer.bind(null, [findServiceAndHandleCi]),
  httpServerAllow: httpServer.bind(null, [allowAll]),
  httpServerDeny:  httpServer.bind(null, [denyAll]),
  httpServer:      httpServer.bind(null, []),
  assertMatch:     assertMatch,
  ok:              false,
  findServiceAndRunHandler: findServiceAndRunHandler,
};

// Check for node silently exiting with code 0 when tests have not passed.
process.on('exit', function(code) {
  if (code === 0) {
    assert(exports.ok);
  }
});

function findServiceAndRunHandler(handler, req, res) {
  var reqUrl = url.parse(req.url);
  var path = reqUrl.pathname.toLowerCase();
  debug('findServiceAndRunHandler: %j path %j', req.url, path);
  switch (reqUrl.pathname.toLowerCase()) {
    case '/api/api':
      getApiInfo(req, res);
      break;
    case '/api/services/findone':
      findService(req, res);
      break;
    case '/api/services':
      createService(req, res);
      break;
    default:
      req.url = req.url.replace('/api/services/1/deploy', '');
      handler(req, res);
  }
}

function getApiInfo(req, res) {
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'charset': 'utf-8',
  });
  res.end(JSON.stringify({
    apiVersion: require('strong-mesh-models/package.json').apiVersion,
  }));
}

function findServiceAndHandleCi(req, res) {
  findServiceAndRunHandler(ci.handle, req, res);
}

function findService(req, res) {
  res.writeHead(404, {
    'Content-Type': 'application/json',
    'charset': 'utf-8',
  });
  res.end(JSON.stringify({
    error: {
      name: 'Error',
      status: 404,
      message: 'Unknown \"ServerService\" id \"undefined\".',
      statusCode: 404,
      code: 'MODEL_NOT_FOUND'
    }
  }));
}

function createService(req, res) {
  res.end(JSON.stringify({
    id: 1,
    _groups: [{id: 1, name: 'g1', scale: 1}]
  }));
  res.writeHead(201, {
    'Content-Type': 'application/json',
    'charset': 'utf-8',
  });
}

function httpServer(handlers, customHandler, callback) {
  if (customHandler) {
    if (callback) {
      handlers.push(findServiceAndRunHandler.bind(null, customHandler));
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
