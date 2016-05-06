// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: strong-deploy
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var debug = require('debug')('strong-deploy:package');
var fs = require('fs');
var path = require('path');

function getPackageInfo(workingDir) {
  var packageJsonPath = path.join(workingDir, 'package.json');
  try {
    var json = require(packageJsonPath);
    debug('package.json found: %s', packageJsonPath);
    return {name: json.name, version: json.version};
  } catch (e) {
    debug('package.json require failed: %s', packageJsonPath);
    return null;
  }
}
exports.getPackageInfo = getPackageInfo;

function getPackagePath(workingDir) {
  var info = getPackageInfo(workingDir);
  if (!info) return null;

  var tgzPath = path.join('..', info.name + '-' + info.version + '.tgz');
  if (!fs.existsSync(tgzPath)) {
    debug('Package tgz not found: %s', tgzPath);
    return null;
  }
  return tgzPath;
}
exports.getPackagePath = getPackagePath;
