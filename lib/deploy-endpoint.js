'use strict';

var MeshClient = require('strong-mesh-models').Client;

exports.get = getDeployEndpoint;

function getDeployEndpoint(url, serviceName, callback) {
  var client = new MeshClient(url);
  client.serviceFindOrCreate(serviceName, 1, function(err, service) {
    if (err) {
      if (err.statusCode === 401) {
        console.error(
          'Cannot access remote. If authentication is required,' +
          ' credentials should be given in the URL.');
      } else {
        console.error('Error connecting to server:', err);
      }
      return callback(err);
    }
    return callback(null, service.getDeployEndpoint());
  });
}
