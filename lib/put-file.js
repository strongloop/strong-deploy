var concat = require('concat-stream');
var debug = require('debug')('strong-deploy');
var fs = require('fs');
var getDeployEndpoint = require('./deploy-endpoint').get;
var g = require('strong-globalize');
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
    g.error('Error while reading file: %s', err);
    callback(err);
  });

  var postURL = url.parse(baseURL);
  if (postURL.protocol !== 'http:') {
    g.error('Invalid URL `%s`. Only http:// URLs are supported.',
      baseURL
    );
    return callback(g.Error('Invalid URL'));
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
        g.error('Valid credentials must be given in the URL.');
      } else {
        console.error('%s', msg);
      }
      callback(g.Error('HTTP error %s', res.statusCode));
    }));
  });

  req.on('error', function(err) {
    g.error('Deploy `%s` to `%s` failed: %s',
      npmPkg,
      baseURL,
      err.message
    );
    callback(err);
  });

  fileReader.pipe(req);
}

exports.performHttpPutDeployment = performHttpPutDeployment;
