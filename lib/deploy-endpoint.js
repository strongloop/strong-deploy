'use strict';

var MeshClient = require('strong-mesh-models').Client;
var clientApiVersion = require('strong-mesh-models/package.json').version;
var debug = require('debug')('strong-deploy');

exports.get = getDeployEndpoint;

function getDeployEndpoint(url, serviceName, callback) {
  var client = new MeshClient(url);
  client.checkRemoteApiSemver(function(err, info) {
    if (err) {
      console.error('Failed to connect to %s: %s',
                    url, err.message || err);
      return callback(err);
    }
    serviceFindOrCreate(client, serviceName, callback);
  });
}

function serviceFindOrCreate(client, serviceName, callback) {
  client.serviceFindOrCreate(serviceName, 1, function(err, service) {
    if (err) {
      debug('client.serviceFindOrCreate(%s, 1): %s', serviceName, err);
      if (err.statusCode === 401) {
        console.error(
          'Cannot access remote. If authentication is required,' +
          ' credentials should be given in the URL.');
      } else {
        console.error('Error connecting to server:', err);
      }
      return callback(err);
    }
    var endpoint = service.getDeployEndpoint();
    debug('client.serviceFindOrCreate(%s, 1): endpoint %s',
          serviceName, endpoint);
    return callback(null, endpoint);
  });
}
