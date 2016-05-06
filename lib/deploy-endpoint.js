// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: strong-deploy
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

var MeshClient = require('strong-mesh-models').Client;
var debug = require('debug')('strong-deploy');

exports.get = getDeployEndpoint;

function getDeployEndpoint(url, serviceName, clusterSize, callback) {
  var client = new MeshClient(url);
  client.checkRemoteApiSemver(function(err) {
    if (err) {
      console.error('Failed to connect to %s: %s',
                    url, err.message || err);
      return callback(err);
    }
    serviceFindOrCreate(client, serviceName, clusterSize, callback);
  });
}

function serviceFindOrCreate(client, serviceName, clusterSize, callback) {
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
    debug('client.serviceFindOrCreate(%s, 1): endpoint %s svc %j',
          serviceName, endpoint, service);
    if (clusterSize != null) service.setClusterSize(clusterSize, true,
      function(err) {
        debug('service.setClusterSize(%s): serviceName %s endpoint %s svc %j',
          clusterSize, serviceName, endpoint, service);
        if (err) callback(err);
        return callback(null, endpoint, service);
      });
    else callback(null, endpoint, service);
  });
}

