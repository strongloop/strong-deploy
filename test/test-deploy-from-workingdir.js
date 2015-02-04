var assert = require('assert');
var debug = require('debug')('test');
var helpers = require('./helpers');
var os = require('os');
var path = require('path');
var shell = require('shelljs');

var performGitDeployment = require('../lib/git').performGitDeployment;

shell.exec('git branch deploy');

helpers.gitServer(test);

function test(server, ci) {
  ci.once('commit', assertCommit);
  var workingDir = __dirname;
  var baseUrl = 'http://127.0.0.1:' + server.address().port;
  process.chdir(os.tmpdir());

  debug('workingDir: %s', workingDir);
  performGitDeployment(workingDir, baseUrl, 'default', 'deploy', function(err) {
    assert.ifError(err);
  });

  function assertCommit(commit) {
    assert(commit.repo === 'default');
    var branch = 'deploy';
    assert(!(branch instanceof Error));
    assert(commit.branch === branch);
    helpers.ok = true;
    server.close();
  }
}
