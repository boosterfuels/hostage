var forever = require('forever');
var _ = require('lodash');
var Config = require('./config');

module.exports  = function (cb) {
  forever.list(false, function (err, processes) {
    if (processes) {
      var running = false;
      processes.forEach(function (p) {
        if (_.includes(p.file, 'hostage')) {
          running = p.file;
        }
      });
      cb(err, running);
    } else {
      cb(err, false);
    }
  });
};
