var express = require('express')
var bodyParser = require('body-parser')
var util = require('util')
var async = require('async')
var run = require('./utils/run')
var Config = require('./utils/config')

var PORT = Config.get().port || 9000
var ROUTE = Config.get().route || '/webhook'

var app = express()
app.use(bodyParser.json())

app.post(ROUTE, function (req, res) {
  if (req.body.repository) {
    var repoUrl = req.body.repository.ssh_url ||
      req.body.repository.url ||
      req.body.repo
    lookupRepo(repoUrl, req.body.ref)
  } else {
    console.log('Invalid webhook payload sent from ' + req.headers.host)
  }

  res.sendStatus(200)
})

function lookupRepo (repoUrl, ref) {
  var config = Config.getRepo(repoUrl)
  var branch = ref ? ref.replace('refs/heads/', '') : null
  if (config && config.directory) {
    run({
      cmd: 'git pull',
      cwd: config.directory
    }, function (error) {
      if (error) { util.log(error + ' ' + config.directory) }
      else { util.log('Successfully updated ' + repoUrl + ' in ' + config.directory) }
      runCommands(config, branch)
    })
  } else if (config) {
    runCommands(config, branch)
  } else {
    util.log('Repository not found: ' + repoUrl)
  }
}

/*
 * Run the specified commands for a given repo in series.
 */
function runCommands (config, branch) {
  var runFunctions = []
  var commands = config.commands

  if (branch && config.branches) {
    commands = config.branches[branch] || []
  }

  commands.forEach(function (cmd) {
    runFunctions.push(buildCommand(cmd, config.directory))
  })
  async.series(runFunctions, function (error, results) {
    if (error) {
      util.log('Failed to run all commands for ' + config.directory + ': ' + error)
    }
  })
}

function buildCommand (cmd, cwd) {
  return function (callback) {
    run({
      cmd: cmd,
      cwd: cwd
    }, function (error) {
      if (error) { util.log(error + ' ' + cwd) }
      else { util.log('Running ' + cmd) }
      callback(error)
    })
  }
}

/*
 * Start the server on port 9000
 */
var server = app.listen(PORT, function () {
  util.log('Hostage Server configured for localhost:' + PORT + ROUTE)
})
