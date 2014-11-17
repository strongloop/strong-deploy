var assert = require('assert');
var childProcess = require('child_process');
var cicada = require('cicada');
var debug = require('debug')('test');
var http = require('http');
var shell = require('shelljs');

shell.exec('git branch deploy');
shell.rm('-rf', '.test_artifacts');
var ci = cicada('.test_artifacts');
var server = http.createServer(ci.handle);
var ok = false;

ci.once('commit', function(commit) {
  assert(commit.repo === 'default');
  var branch = 'deploy';
  assert(!(branch instanceof Error));
  assert(commit.branch === branch);
  ok = true;
  server.close();
});

server.once('listening', function() {
  debug('Server started at: %j', server.address());
  childProcess.fork(
    require.resolve('../bin/sl-deploy'),
    ['http://127.0.0.1:' + server.address().port]
  );
});

server.listen(0);
