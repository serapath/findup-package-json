# findup-package-json [![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

Find the closest package.json file meeting specific criteria by searching upwards from a given directory until hitting root.

## Usage

[![NPM](https://nodei.co/npm/findup-package-json.png)](https://nodei.co/npm/findup-package-json/)

### `findup(dir, [filter], found(err, file))`

Given a starting directory `dir`, look up through every directory to see if it contains a `package.json` file matching the `filter` function, for example:

``` javascript
var findup = require('findup-package-json')
findup(__dirname, function(json, filename) {
  return json.name === 'async'
}, function(err, result) {
  console.log(result.pkgfile)
  console.log(result.pkg)
})
```

Note that `filter` is optional and takes the following arguments:

* `json`: the parsed `package.json` file.
* `filename`: the `package.json`'s absolute filename.

### `file = findup.sync(dir, [filter])`

Same as the `findup` function, however executed synchronously:

``` javascript
var result = findup.sync(__dirname, function(json, filename) {
  return json.name === 'async'
})

console.log(result.pkgfile)
console.log(result.pkg)
```

## License

MIT. See [LICENSE.md](http://github.com/hughsk/findup-package-json/blob/master/LICENSE.md) for details.
