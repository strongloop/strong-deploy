var http = require('http');
var cicada = require('cicada');
var shell = require('shelljs');
var childProcess = require('child_process');
var assert = require('assert');

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
  childProcess.fork(
    require.resolve('../bin/sl-deploy'),
    ['http://localhost:5255']
  );
});

server.listen(5255);
