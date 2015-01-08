var express = require('express');
var bodyParser = require('body-parser');
var util = require('util');
var async = require('async');
var run = require('./utils/run');
var Config = require('./utils/config');

var PORT = Config.get().port || 9000;
var ROUTE = Config.get().route || '/webhook';

var app = express();
app.use(bodyParser.json());

app.post(ROUTE, function(req, res) {
  if (req.body.repository) {
    var repoUrl = req.body.repository.ssh_url || req.body.repository.url;
    lookupRepo(repoUrl);
  } else {
    console.log('Invalid webhook payload sent from ' + req.headers.host);
  }

  res.sendStatus(200);
});

function lookupRepo(repoUrl) {
  //var repo = Config.get().repos[repoUrl] || null;
  var repo = Config.getRepo(repoUrl);
  if (repo) {
    run({
      cmd: 'git clean -fd && git pull',
      cwd: repo.directory
    }, function(error) {
      if (error) { util.log(error + ' ' + repo.directory); }
      else { util.log('Successfully updated ' + repoUrl + ' in ' + repo.directory); }
      runCommands(repo);
    })
  } else {
    util.log('Repository not found: ' + repoUrl);
  }
};

/*
 * Run the specified commands for a given repo in series.
 */
function runCommands(repo) {
  var runFunctions = [];
  repo.commands.forEach(function (cmd) {
    runFunctions.push(buildCommand(cmd, repo.directory));
  });
  async.series(runFunctions, function (error, results) {
    if (error) {
      util.log('Failed to run all commands for ' + repo.directory + ': ' + error);
    }
  });
}

function buildCommand(cmd, cwd) {
  return function (callback) {
    run({
      cmd: cmd,
      cwd: cwd
    }, function (error) {
      if (error) { util.log(error + ' ' + cwd); }
      else { util.log('Running ' + cmd + ' in ' + cwd); }
      callback(error);
    });
  };
}

/*
 * Start the server on port 9000
 */
var server = app.listen(PORT, function() {
  util.log('Hostage Server configured for localhost:' + PORT + ROUTE);
}); 
