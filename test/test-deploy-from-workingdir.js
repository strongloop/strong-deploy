var assert = require('assert');
var cicada = require('cicada');
var debug = require('debug')('test');
var http = require('http');
var shell = require('shelljs');
var path = require('path');
var os = require('os');

var performGitDeployment = require('../lib/git').performGitDeployment;

shell.exec('git branch deploy');
var artifactDir = path.join(__dirname, '.test_artifacts');
shell.rm('-rf', artifactDir);
var ci = cicada(artifactDir);
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
  var workingDir = __dirname;
  var baseUrl = 'http://127.0.0.1:' + server.address().port;
  process.chdir(os.tmpdir());

  debug('workingDir: %s', workingDir);
  performGitDeployment(workingDir, baseUrl, 'default', 'deploy', function(err) {
    assert.ifError(err);
  });
});

server.listen(0);
