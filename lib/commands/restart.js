var utils = require('../utils');
var start = require('./start');
var stop = require('./stop');

module.exports = function () {
  utils.isRunning(function (err, running) {
    if (running) {
      stop();
      setTimeout(module.exports, 300);
    } else {
      start();
    }
  });
};
