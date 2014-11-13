var http = require('http');
var cicada = require('cicada');
var shell = require('shelljs');
var childProcess = require('child_process');
var assert = require('assert');
var getCurrentBranch = require('../lib/git.js')._getCurrentBranch;

shell.rm('-rf', '.test_artifacts');
var ci = cicada('.test_artifacts');
var server = http.createServer(ci.handle);
var ok = false;
var currentBranch = getCurrentBranch(process.cwd());
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
  childProcess.fork(
    require.resolve('../bin/sl-deploy'),
    ['--config', 'repo2', 'http://localhost:5255', pushBranch]
  );
});

server.listen(5255);
