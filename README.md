# findup-package-json [![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

Find the closest package.json file meeting specific criteria by searching upwards from a given directory until hitting root.

## Usage

[![NPM](https://nodei.co/npm/findup-package-json.png)](https://nodei.co/npm/findup-package-json/)

Can be used as a regular module and/or a browserify transform to inline specific fields of a projects 'package.json'

### `findup([fields], [dir], [filter], found(err, packageJson))`

Given a starting directory `dir`, look up through every directory to see if it contains a `package.json` file matching the `filter` function, for example:

``` javascript
var findup = require('findup-package-json')
/******************************************************************************
  PARAMETER:
    findup({
      fields: optional array,
        * array of fields you want from package.json
        * defaults to ALL FIELDS if not provided
      path: optional string,
        * the path where the search starts, going one level up towards the root directory and returns the package.json content if it can find it
        * defaults to 'process.cwd()'
      filter: optional function,
        * a function (json, filename) in which you can test the content and return true if it's the right packageJson, otherwise return false to continue the search.
        * defaults to function (packageJson) { return true } to return the first found
      found: required callback function
        * a callback (err, packageJson) that will be called with the content of the found package.json which has all the fields you asked for
    })

******************************************************************************/

// Below a list of all different ways to call "findup"

findup({ found: function (err, result) { // required callback
  console.log(result.pkgfile)
  console.log(result.pkg)
}})
// or
findup({
  fields: ['name', 'scripts.test'], // optional, default: all fields
  dirname: __dirname, // optional, default: process.cwd()
  filter: function (json, filename) { // optional, default: return true
    return json.name === 'async'
  },
  found: function (err, result) { // required callback
    console.log(result.pkgfile)
    console.log(result.pkg)
  }
})
```

Note that `filter` is optional and takes the following arguments:

* `json`: the parsed `package.json` file.
* `filename`: the `package.json`'s absolute filename.

### `file = findup.sync([fields], [dir], [filter])`

Same as the `findup` function, however executed synchronously:

``` javascript
var findup = require('findup-package-json')
/******************************************************************************
  PARAMETER:
    var found = findup.sync({
      fields: optional array,
        * array of fields you want from package.json
        * defaults to ALL FIELDS if not provided
      path: optional string,
        * the path where the search starts, going one level up towards the root directory and returns the package.json content if it can find it
        * defaults to 'process.cwd()'
      filter: optional function
        * a function (json, filename) in which you can test the content and return true if it's the right packageJson, otherwise return false to continue the search.
        * defaults to function (packageJson) { return true } to return the first found
    }) // returns the content of the found package.json which has all the fields you asked for

******************************************************************************/
// Below a list of all different ways to call "findup"

var result = findup.sync()
// or
var result = findup.sync({
  fields: ['name', 'scripts.test'], // optional, default: all fields
  dirname: __dirname, // optional, default: process.cwd()
  filter: function (json, filename) { // optional, default: return true
    return json.name === 'async'
  }
})
```

### browserify

Turns the calls to `require('findup-package-json')` as shown above and the selected `package.json` fields into an inlined object that goes into the `bundle.js`, but requires the arguments to `findup` or `findup.sync` to be statically analysable

It only works if the call is directly made on the require statement

```js
require('findup-package-json')({ found: function (err, json) {
  // ... use err and/or json
  console.log(json.pkgfile)
  console.log(json.pkg)
}})
// or
var json = require('findup-package-json').sync(...)
console.log(json.pkgfile)
console.log(json.pkg)
```
after `browserify index.js -t findup-package-json > bundle.js`
will be turned into

```js
(function (err, json) {
  // ... use err and/or json
  console.log(json.pkgfile)
  console.log(json.pkg)
})({
  pkgfile   : '...',
  pkg       : { /* package.json with requested fields */ }
})
// or
var json =  {
  pkgfile   : '...',
  pkg       : { /* package.json with requested fields */ }
}
console.log(json.pkgfile)
console.log(json.pkg)
```
## License

MIT. See [LICENSE.md](http://github.com/hughsk/findup-package-json/blob/master/LICENSE.md) for details.
