var findup =
require('findup-package-json')
var findup = function (x) { console.log(x) }
findup.sync = function (x) { console.log(x) }
findup('fake findup')
findup.sync('fake findup sync')
console.log(require('findup-package-json').sync({
  fields: ['name', 'scripts.test'],
  dirname: '',
  filter: function (pkg) { return pkg.name === 'findup-package-json' }
}).pkg)
var ax2 = require('findup-package-json').sync()
var xss = { test: require('findup-package-json').sync, asdf: 'aaa' }
var ax = require('findup-package-json').sync({
  fields: ['name', 'scripts.test'],
  dirname: './',
  filter: function (pkg) { return pkg.name === 'findup-package-json' }
}).pkg
console.log(require('findup-package-json')({
  fields: ['name', 'scripts.test'],
  dirname: '',
  filter: function (pkg) { return pkg.name === 'findup-package-json' },
  found: function (err, result) {
    console.log(err, result)
  }
}))
require('findup-package-json')({
  fields: ['name', 'scripts.test'],
  dirname: './',
  filter: function (pkg) { return pkg.name === 'findup-package-json' },
  found: function (err, result) {
    console.log(err, result)
  }
})
;(function (findup) {
  'asdf'
})(require('findup-package-json'))
var x = {
  test: require('findup-package-json'),
  asdf: 'aaa'
}
var a = require('findup-package-json')({ found: function (err, json) {
  console.log(json.pkgfile)
  console.log(json.pkg)
}})
var json = require('findup-package-json').sync()
console.log(json.pkgfile)
console.log(json.pkg)
