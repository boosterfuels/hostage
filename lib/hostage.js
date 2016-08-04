var express = require('express')
var bodyParser = require('body-parser')
var util = require('util')
var async = require('async')
var _ = require('lodash')
var run = require('./utils/run')
var Config = require('./utils/config')

var PORT = Config.get().port || 9000
var ROUTE = Config.get().route || '/webhook'
var TOKEN = Config.get().authToken

var app = express()
app.use(bodyParser.json())

app.post(ROUTE, function (req, res) {
  if (TOKEN && !_.eq(TOKEN, req.query.authToken)) {
    console.log('Invalid auth token used by ' + req.headers.host)
    res.sendStatus(400)
  } else if (req.body.repository) {
    var repoUrl = req.body.repository.ssh_url ||
      req.body.repository.url ||
      req.body.repo
    lookupRepo(repoUrl, req.body.ref)
    res.sendStatus(200)
  } else {
    console.log('Invalid webhook payload sent from ' + req.headers.host)
    res.sendStatus(400)
  }
})

function lookupRepo (repoUrl, ref) {
  var config = Config.getRepo(repoUrl)
  var branch = ref ? ref.replace('refs/heads/', '') : null
  if (config) {
    runCommands(config, branch)
  } else {
    util.log('Repository config not found: ' + repoUrl)
  }
}

/*
 * Run the specified commands for a given repo in series.
 */
function runCommands (config, branch) {
  var runFunctions = []
  var commands = config.commands
  var directory = config.directory

  if (branch && config.branches) {
    commands = config.branches[branch].commands || []
    directory = config.branches[branch].directory
  }

  commands.forEach(function (cmd) {
    runFunctions.push(buildCommand(cmd, directory))
  })
  async.series(runFunctions, function (error, results) {
    if (error) {
      util.log('Failed to run all commands in ' + directory + ': ' + error)
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
      else { util.log('Running ' + cmd + ' in ' + cwd) }
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
