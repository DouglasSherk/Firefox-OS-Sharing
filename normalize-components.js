'use strict';
/*global require, __dirname, console */

var requirejs = require('./r'),
    glob = require('glob'),
    fs = require('fs'),
    path = require('path'),
    targetDir = path.join(__dirname, 'dist', 'app', 'components');


//Do it twice, just to make sure it all holds together on multiple passes.
requirejs.tools.useLib(function(require) {
  require(['transform'], function (transform) {
    // options is optional
    glob('**/*.js', {
      cwd: targetDir,
      nodir: true
    }, function (err, files) {
      if (err) {
        return console.error(err);
      }

      files.forEach(function(filePath) {
        var fullPath = path.join(targetDir, filePath);
        var contents = fs.readFileSync(fullPath, 'utf8');
        var transformed = transform
                          .toTransport('', null, fullPath, contents);

        if (transformed !== contents) {
          fs.writeFileSync(fullPath, transformed, 'utf8');
        }
      });
    });
  });
});
