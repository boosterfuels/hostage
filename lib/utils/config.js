var path = require('path')
var fs = require('fs')
var fse = require('fs-extra')
var _ = require('lodash')

var NAME = '.hostage-rc'
var ROOT = null
if (process.platform === 'win32') {
  ROOT = process.env.USERPROFILE ||
  process.env.APPDATA ||
  process.env.TMP ||
  process.env.TEMP
} else {
  ROOT = process.env.HOME ||
  process.env.TMPDIR ||
  '/tmp'
}

var sanitizeRepoUrl = function (repoUrl) {
  return repoUrl.replace('/', '-').replace(':', '-')
}

var Config = function () {
  if (!(this instanceof Config)) {
    return new Config(NAME)
  }

  this.root = ROOT
  this.path = path.join(ROOT, NAME)
}

Config.prototype.get = function (suppress) {
  suppress = _.isUndefined(suppress) ? false : suppress
  try {
    return JSON.parse(fs.readFileSync(this.path, 'utf8'))
  } catch (err) {
    if (!suppress) {
      console.log(err)
      console.log('CRITICAL ERROR: Unable to parse ~/.hostage-rc file, invalid JSON')
    }
    return { reposPath: ROOT + '/.hostage' }
  }
}

Config.prototype.set = function (config) {
  fs.writeFileSync(this.path, JSON.stringify(config, null, 2) + '\n')
}

Config.prototype.update = function (config) {
  var current = this.get(true)
  this.set(_.merge(current, config))
}

Config.prototype.getRepo = function (repoUrl, suppress) {
  suppress = _.isUndefined(suppress) ? false : suppress
  var reposPath = this.get().reposPath
  var file = path.resolve(reposPath, sanitizeRepoUrl(repoUrl))
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (err) {
    if (!suppress) {
      console.log(err)
      console.log('ERROR: Unable to parse JSON in ' + file)
    }
    return null
  }
}

Config.prototype.saveRepo = function (repoUrl, repoConfig) {
  var reposPath = this.get().reposPath
  var file = path.resolve(reposPath, sanitizeRepoUrl(repoUrl))
  fse.ensureFileSync(file)
  fs.writeFileSync(file, JSON.stringify(repoConfig, null, 2) + '\n')
}

module.exports = Config()
