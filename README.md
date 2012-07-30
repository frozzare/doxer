# Doxer

Doxer is a port of, and borrows a bit from, Docco but for [Dox documentation](https://github.com/visionmedia/dox).
Doxer is not perfect and will contains bugs, use at your own risk.

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

doxer.process({ files: [], title: 'Title' });
```

It will return an object with `html` and `style` properties. Where `html` is the html document and `style` is Doxer stylesheet.