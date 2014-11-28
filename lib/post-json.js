var fs = require('fs');
var http = require('http');
var path = require('path');
var shell = require('shelljs');
var url = require('url');

function performLocalDeployment(baseURL, what, config, callback) {
  what = path.resolve(what);

  var postURL = url.parse(baseURL);
  if (postURL.protocol !== 'http:') {
    console.error('Invalid URL `%s`. Only http:// URLs are supported.',
      baseURL
    );
    return callback(Error('Invalid URL'));
  }

  if (postURL.hostname) {
    if (postURL.hostname !== 'localhost' || postURL.hostname != '127.0.0.1') {
      console.error('Invalid URL `%s`. Only localhost URLs are supported.',
        baseURL);
      return callback(Error('Invalid URL'));
    }
  }

  if (!shell.test('-d', what)) {
    console.error('Invalid path `%s`. Only directories are supported.', what);
    return callback(Error('Invalid path, not a directory'));
  }

  var postOptions = {
    auth: postURL.auth,
    hostname: 'localhost',
    port: postURL.port || 80,
    path: '/' + config,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-pm-deploy',
    },
  };

  var req = http.request(postOptions, function(res) {
    if (res.statusCode === 200) {
      return callback();
    }
    console.error('Deploy `%s` to `%s` failed. HTTP Code: %d',
      what,
      baseURL,
      res.statusCode
    );
    callback(Error('HTTP error ' + res.statusCode));
  });

  req.end(JSON.stringify({
    'local-directory': what,
  }));

  req.on('error', function(err) {
    console.error('Deploy `%s` to `%s` failed: %s',
      what,
      baseURL,
      err.message
    );
    callback(err);
  });
}

exports.performLocalDeployment = performLocalDeployment;
