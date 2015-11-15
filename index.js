var path      = require('path')
var fs        = require('fs')
var isarray   = require('isarray')
var defined   = require('defined')
var exemethod = require('exemethod')
var falafel   = require('falafel')
var through   = require('through2')
var getval    = require('getval')

var method    = exemethod(function (msg, method) { return method })

/******************************************************************************
  METHOD: browserify
******************************************************************************/
if (method === 'browserify') {
  module.exports = transform
}
/******************************************************************************
  METHOD: required
******************************************************************************/
else if (method === 'required') {
  module.exports      = closest
  module.exports.sync = closestSync
}


/******************************************************************************
  HELPERS: browserify
******************************************************************************/
function transform (filename) {
  var buffer = []
  return through(function write (buf, enc, next) {
    buffer.push(buf.toString('utf8'))
    next()
  }, function end () {
    this.push(ast(filename, buffer.join('')))
    this.push(null)
  })
}


function ast (filename, source) {
  var out = falafel(source, function parse (node) {
    if (node.name === 'require') {
      var pkgname = node.parent.arguments[0].value
      if (pkgname === 'findup-package-json') {
        var x = node.parent.parent
        if (x.property && x.property.name === 'sync') {
          if (x.parent.type === 'CallExpression') {
            // CASE: require('findup-package-json').sync({...})
            var expression = x.parent
            var json = getPKG(expression)
            expression.update(JSON.stringify(json.pkg))
          } else if (x.parent.type === 'VariableDeclarator') {
            x.parent.parent.update()
          } else if (x.parent.type === 'Property') {
            x.update('{}')
          }
        } else if (x.type === 'VariableDeclarator') {
          node.parent.parent.parent.update()
        } else if (x.type === 'Property') {
          node.parent.update('undefined')
        } else if (x.type === 'CallExpression') {
          // CASE: require('findup-package-json')({...})
          var expression = node.parent.parent
          if (expression.arguments[0].properties) {
            var args = expression.arguments[0].properties
            var found = false
            var json = getPKG(expression, 'async')
            args.forEach(function (x) {
              if (x.key.name === 'found') {
                var src = expression.source()
                var exp = src.match(/found:([\s\S]*)\}[\s]*\)[\s]*$/)[0]
                exp = exp.replace('found:', '!(')
                var err = 'null'
                var pkg = JSON.stringify(json.pkg)
                exp = exp.replace(/\}[\s]*\)[\s]*$/, ')('+err+','+pkg+')')
                expression.update(exp)
                found = true
              }
            })
            if (!found) { throw new Error('findup-package-json - callback "found: ..." parameter not found or not statically analysable')
            }
          } else {
            node.parent.update('function(){}')
          }
        } else {
          throw new Error('Probably unsupported coding style - create a github issue :-)')
        }
      }
    }
  }).toString()
  return out
}

function getPKG (expression, mode) {
  var rargs =  mode === 'async' ?
    /require\('findup-package-json'\)\(([\s\S]*)\)$/
    : /require\('findup-package-json'\).sync\(([\s\S]*)\)$/
  var params = expression.source().match(rargs)[1] || '{}'
  var result = require('vm').runInThisContext('result = ' + params);
  var json = closestSync(result)
  return json
}
/******************************************************************************
  HELPERS: required
******************************************************************************/
function validate (params) {
  var fields = defined(getval(params,'fields'))
  if (!isarray(fields) && fields !== undefined) {
    throw new Error('optional: "fields" provided, but its not an array')
  }
  var dirname = defined(getval(params,'dirname'), process.cwd())
  if (typeof dirname !== 'string' && dirname !== undefined) {
    throw new Error('optional: "dirname" provided, but its not a string')
  }
  var filter = defined(getval(params,'filter'), truthy)
  if (typeof filter !== 'function' && filter !== undefined) {
    throw new Error('optional: "filter" provided, but its not a function')
  }
  return [fields, dirname, filter]
}


function closest (params) {
  var args    = validate(params)
  var fields  = args[0]
  var dirname = args[1]
  var filter  = args[2]
  var found   = defined(getval(params,'found'))
  if (typeof found !== 'function') {
    throw new Error('callback "found" needs to be a function')
  }
  dirname = path.resolve(dirname)
  check()
  function check () {
    if (isRoot(dirname)) return found(null, null)
    var pkgfile = path.join(dirname, 'package.json')
    fs.exists(pkgfile, function(exists) {
      if (!exists) return next()
      read(fields, pkgfile, function(err, pkg) {
        if (err) return found(err)
        if (filter(pkg, pkgfile)) {
          return found(null, { pkgfile: pkgfile, pkg: get(fields, pkg) })
        }
        next()
      })
    })
  }
  function next () {
    dirname = path.join(dirname, '..')
    check()
  }
}


function closestSync (params) {
  var args    = validate(params)
  var fields  = args[0]
  var dirname = args[1]
  var filter  = args[2]
  dirname = path.resolve(dirname || process.cwd())
  do {
    var pkgfile = path.join(dirname, 'package.json')
    if (!fs.existsSync(pkgfile)) continue
    var pkg = readSync(fields, pkgfile)
    if (filter(pkg, pkgfile)) {
      return { pkgfile: pkgfile, pkg: get(fields, pkg) }
    }
  } while (!isRoot(
    dirname = path.join(dirname, '..')
  ))
  return null
}


function isRoot(dirname) {
  return path.resolve(dirname, '..') === dirname
}


function read (fields, pkgfile, done) {
  fs.readFile(pkgfile, 'utf8', function(err, json) {
    if (err) return done(err)
    try {
      json = JSON.parse(json)
    } catch(e) { done(e) }
    return done(null, json)
  })
}


function readSync(fields, pkgfile) {
  return JSON.parse(fs.readFileSync(pkgfile, 'utf8'))
}


function truthy() { return true }


function get (fields, pkg) {
  var selectedPkg = {}
  var oneormore = false
  if (fields) {
    fields.forEach(function (field) {
      var x = getval(pkg, field)
      if (x) {
        oneormore = true
        selectedPkg[field] = x
      }
    })
    return oneormore ? selectedPkg : undefined
  } else {
    return pkg
  }
}


// function getPackageJson (inDir) {
//   var dirname = path.dirname(inDir)
//   var pkg_route = path.join(dirname, 'package.json')
//   if (fs.existsSync(pkg_route)) { return pkg_route }
//   return getPackageJson(dirname)
// }
//
// module.exports = transform
//
// function transform (file, opts) {
//   return through(function write(data) {
//     data = data.toString().replace(/require\((\'|\")package\.(.*)(\'|\")\)/ig, function (str, p1, p2) {
//       var r = JSON.stringify(require(getPackageJson(file))[p2])
//       return r
//     })
//
//     this.emit('data', data)
//   }, function end () { //optional
//     this.emit('end')
//   })
// }
