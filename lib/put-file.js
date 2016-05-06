// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: strong-deploy
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var concat = require('concat-stream');
var debug = require('debug')('strong-deploy');
var fs = require('fs');
var getDeployEndpoint = require('./deploy-endpoint').get;
var http = require('http');
var path = require('path');
var url = require('url');

function performHttpPutDeployment(options, callback) {
  getDeployEndpoint(options.baseURL, options.serviceName, options.clusterSize,
    function(err, deployUrl, service) {
      if (err) return callback(err);
      _performHttpPutDeployment(service, deployUrl,
          options.branchOrPack, callback);
    });
}

function _performHttpPutDeployment(service, baseURL, npmPkg, callback) {
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
    path: postURL.path + '/default',
    method: 'PUT'
  };

  var req = http.request(postOptions, function(res) {
    res.pipe(concat(res, function(msg) {
      debug('response: code=%d %j', res.statusCode, String(msg));
      if (res.statusCode === 200) {
        return callback(null, service);
      }

      if (res.statusCode === 401 || res.statusCode === 403) {
        console.error('Valid credentials must be given in the URL');
      } else {
        console.error('%s', msg);
      }
      callback(Error('HTTP error' + res.statusCode));
    }));
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
