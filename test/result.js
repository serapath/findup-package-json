// @TODO: fix test-bunde.js and compare output with expectations

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
