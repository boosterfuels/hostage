var exec = require('child_process').exec;

module.exports = function(config, callback) {
  var options = {};
  options.cwd = config.cwd || process.cwd();

  exec(config.cmd, options, function(error, stdout, stderr) {
    callback(error);
  });
};
