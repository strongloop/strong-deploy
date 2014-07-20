var http = require('http');
var cicada = require('cicada');
var shell = require('shelljs');
var child_process = require('child_process');
var assert = require('assert');
var getCurrentBranch = require('../index.js')._getCurrentBranch;

shell.rm('-rf', '.test_artifacts');
var ci = cicada('.test_artifacts');
var server = http.createServer(ci.handle);
var ok = false;

ci.once('commit', function(commit) {
  assert(commit.repo === 'repo1');
  var branch = getCurrentBranch();
  assert(!(branch instanceof Error));
  assert(commit.branch === branch);
  ok = true;
  server.close();
});

server.once('listening', function() {
  var deploy = child_process.fork(
    require.resolve('../bin/sl-deploy'),
    ['http://localhost:5255/repo1']
  );
});

server.listen(5255);
