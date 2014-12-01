var assert = require('assert');
var async = require('async');
var debug = require('debug')('strong-deploy:test');
var path = require('path');
var util = require('util');

require('shelljs/global');

function deployCli(args, cb) {
  var cmd = util.format('%s %s',
    path.resolve('../bin/sl-deploy.js'),
    args
  );
  console.log(cmd);
  var res = exec(cmd);
  if (res.code !== 0) {
    return cb(Error(res.output));
  }
  return cb();
}

// Check for node silently exiting with code 0 when tests have not passed.
var ok = false;

process.on('exit', function(code) {
  if (code === 0) {
    assert(ok);
  }
});

function expectError(er) {
  if (er) {
    return null;
  }
  return Error('expected error');
}

// argv [0] and [1] are ignored (they are node and script name, not options)
async.parallel([
  deployCli.bind(null, '-h'),
  deployCli.bind(null, '--help'),
  deployCli.bind(null, '-hv'),
  deployCli.bind(null, '-v'),
  deployCli.bind(null, '--version'),
  deployCli.bind(null, '-vh'),
  function(callback) {
    deployCli('--no-such-option', function(er) {
      return callback(expectError(er));
    });
  },
  function(callback) {
    deployCli('http://some-invalid-repo no-such-branch',
      function(er) {
        return callback(expectError(er));
      }
    );
  },
  function(callback) {
    deployCli('http://some-invalid-repo', function(er) {
      return callback(expectError(er));
    });
  }
], function(er, results) {
  debug('test-help: error=%s:', er, results);
  assert.ifError(er);
  ok = true;
});
