var fs = require('fs');
var http = require('http');
var path = require('path');
var url = require('url');

function performHttpPutDeployment(baseURL, config, npmPkg, callback) {
  npmPkg = path.resolve(npmPkg);

  var fileReader = fs.createReadStream(npmPkg);
  fileReader.on('error', function(err) {
    console.error('Error while reading file: %s', err);
    callback(err);
  });

  var postURL = url.parse(baseURL);
  if (postURL.protocol !== 'http:') {
    console.error('Invalid URL `%s`. Only http:// URLs are supported.',
      baseURL
    );
    return callback(Error('Invalid URL'));
  }

  var postOptions = {
    auth: postURL.auth,
    hostname: postURL.hostname,
    port: postURL.port || 80,
    path: '/' + config,
    method: 'PUT'
  };

  var req = http.request(postOptions, function(res) {
    if (res.statusCode === 200) {
      return callback();
    }
    console.error('Deploy `%s` to `%s` failed. HTTP Code: %d',
      npmPkg,
      baseURL,
      res.statusCode
    );
    if (res.statusCode === 401 || res.statusCode === 403) {
      console.error('Valid credentials must be given in the URL');
    }
    callback(Error('HTTP error'));
  });

  req.on('error', function(err) {
    console.error('Deploy `%s` to `%s` failed: %s',
      npmPkg,
      baseURL,
      err.message
    );
    callback(err);
  });

  fileReader.pipe(req);
}

exports.performHttpPutDeployment = performHttpPutDeployment;
