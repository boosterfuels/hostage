var forever = require('forever');
var path = require('path');
var _ = require('lodash');
var utils = require('../utils');

module.exports = function () {
  var argv = require('yargs')
    .options('p', {
      alias: 'port'
    })
    .options('r', {
      alias: 'route'
    })
    .options('t', {
      alias: 'auth-token'
    })
    .argv;

  var script = path.resolve(__dirname, '../hostage.js');
  var config = utils.Config.get();
  var options = !_.isEmpty(config.options) ? config.options :  {
    logFile: path.resolve(utils.Config.root, '.hostage.log'),
    outFile: path.resolve(utils.Config.root, '.hostage.out'),
    errFile: path.resolve(utils.Config.root, '.hostage.err')
  };

  utils.Config.update({
    port: argv.port || config.port || 9000,
    route: argv.route || config.route || '/webhook',
    authToken: argv.authToken || config.authToken,
    options: options
  });

  utils.isRunning(function (err, running) {
    if (running) {
      console.log('hostage already running');
    } else {
      console.log('Started hostage');
      forever.startDaemon(script, options);
    }
  });
};
