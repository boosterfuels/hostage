var forever = require('forever');
var utils = require('../utils');

module.exports = function () {
  utils.isRunning(function (err, running) {
    if (running) {
      console.log('Stopping hostage');
      forever.stop(running);
    } else {
      console.log('No hostage process found');
    }
  });
};
