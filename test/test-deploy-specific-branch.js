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
var currentBranch = getCurrentBranch();
assert(!(currentBranch instanceof Error));

var pushBranch = 'production';
if (currentBranch === 'production') {
  pushBranch = 'master';
}

ci.once('commit', function(commit) {
  assert(commit.repo === 'repo2');
  assert(commit.branch === pushBranch);
  ok = true;
  server.close();
});

server.once('listening', function() {
  var deploy = child_process.fork(
    require.resolve('../bin/sl-deploy'),
    ['--branch', pushBranch, 'http://localhost:5255/repo2']
  );
});

server.listen(5255);
