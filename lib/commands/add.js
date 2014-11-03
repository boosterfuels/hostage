var _ = require('lodash');
var utils = require('../utils');

module.exports = function () {
  var argv = require('yargs')
    .usage('Add a new repository to Hostage for webhook handling.\n\nUsage: $0 add -r git@git/repo-url -d path/to/local/repo/directory')
    .options('r', {
      alias: 'repo',
      demand: true
    })
    .options('d', {
      alias: 'directory',
      demand: true
    })
    .check(function (hash, array) {
      return _.isString(hash.repo) 
        && _.isString(hash.directory);
    })
    .argv;

  var repoConfig = utils.Config.getRepo(argv.repo, true);

  if (!repoConfig) {
    utils.Config.saveRepo(argv.repo, {
      directory: argv.directory,
      commands: []
    }, true);
  } else {
    console.log('WARN: Project already exists');
    console.log('See ~/.hostage-rc for configuration.');
  }
};
