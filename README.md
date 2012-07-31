# Doxer

Doxer is a port of, and borrows a bit from, [Docco](https://github.com/jashkenas/docco) but for [Dox documentation](https://github.com/visionmedia/dox).
Doxer is not perfect and maybe contains bugs.

[Example page](http://frozzare.github.com/doxer/)

```sh
npm install -g doxer
doxer --title "project name" source.js
```

Will save `doxer.html` and `doxer.css` in `docs` directory after generating the documentation.

## Supported top comments

```
/*!
 * Project comment
 * ...
 * ... 
 */
 
// Project comment
// ...
// ...

// Project comment

// ...
// ...
```

## Using Doxer inside your code

```javascript
var doxer = require('doxer');

doxer.process({ files: [], title: 'Title' }, function (res) {
  // res.html is the html document
  // res.style is Doxer stylesheet
});
```

`files` can be a string containg source code, path to filename or array with files.