var deep    = require('deep-equal')
var test    = require('tape')
var path    = require('path')
var findup  = require('./')

var lowest    = require.resolve('./fixtures/a/b/package.json')
var local     = require.resolve('./package.json')
var lowestpkg = require('./fixtures/a/b/package.json')
var localpkg  = require('./package.json')

function localDir (pkg, pkgfile) {
  var pkgdir = path.dirname(pkgfile).split(path.sep)
  return (pkgdir.length >= __dirname.split(path.sep).length)
}


test('async: always true', function(t) {
  t.plan(3)
  findup({
    fields: ['name', 'scripts.test'], // optional, default: all fields
    dirname: __dirname, // optional, default: process.cwd()
    filter: function (json, filename) { // optional, default: return true
      return json.name === 'findup-package-json'
    },
    found: function (err, result) { // required callback
      if (err) return t.fail(err)
      // CHECKS
      t.ok(result.pkgfile === local, 'found local package.json')
      t.ok(result.pkg['name'] === "findup-package-json", "name: findup-package-json")
      t.ok(result.pkg['scripts.test'] === "node test | tap-spec", "scripts.test: node test | tap-spec")
      for ( key in result.pkg ) {
        if (key !== 'name' && key !== 'scripts.test') {
          t.fail('result contains '+key+' that were not requested')
        }
      }

    }
  })
})


test('async: always false', function(t) {
  t.plan(1)
  findup({
    fields: ['name', 'scripts.test'], // optional, default: all fields
    dirname: __dirname, // optional, default: process.cwd()
    filter: function (json, filename) { // optional, default: return true
      return false
    },
    found: function (err, result) { // required callback
      if (err) return t.fail(err)
      // CHECKS
      t.ok(result === null, 'returned null')
    }
  })
})


test('async: three levels down', function(t) {
  t.plan(1)
  findup({
    dirname: lowest, // optional, default: process.cwd()
    filter: localDir,
    found: function (err, result) { // required callback
      if (err) return t.fail(err)
      // CHECKS
      t.ok(result.pkg.level === 3, '"level": 3')
    }
  })
})


test('async: level === 1', function(t) {
  t.plan(1)
  findup({
    dirname: path.dirname(lowest), // optional, default: process.cwd()
    filter: function (pkg, pkgfile) {
      return localDir(pkg, pkgfile) && pkg.level === 1
    },
    found: function (err, result) { // required callback
      if (err) return t.fail(err)
      // CHECKS
      t.ok(result.pkg.level === 1, '"level": 1')
    }
  })
})


test('sync: always true', function(t) {
  t.plan(3)
  var result = findup.sync({
    fields: ['name', 'scripts.test'], // optional, default: all fields
    dirname: __dirname, // optional, default: process.cwd()
    filter: function (json, filename) { // optional, default: return true
      return true
    }
  })
  // CHECK
  t.ok(result.pkgfile === local, 'found local package.json')
  t.ok(result.pkg['name'] === "findup-package-json", "name: findup-package-json")
  t.ok(result.pkg['scripts.test'] === "node test | tap-spec", "scripts.test: node test | tap-spec")
  for ( key in result.pkg ) {
    if (key !== 'name' && key !== 'scripts.test') {
      t.fail('result contains '+key+' that were not requested')
    }
  }
})


test('sync:level === 1', function(t) {
  t.plan(2)
  var result = findup.sync({
    dirname: path.dirname(lowest), // optional, default: process.cwd()
    filter: function(pkg, pkgfile) {
      return localDir(pkg, pkgfile) && pkg.level === 1
    }
  })
  // CHECK
  t.ok(result.pkgfile, 'should find package.json')
  t.ok(result.pkg.level === 1, '"level": 1')
})
