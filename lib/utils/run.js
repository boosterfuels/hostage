var exec = require('child_process').exec;

module.exports = function(config, callback) {
  var options = {
    maxBuffer: 1024 * 500
  };
  options.cwd = config.cwd || process.cwd();

  exec(config.cmd, options, function(error, stdout, stderr) {
    callback(error);
  });
};
